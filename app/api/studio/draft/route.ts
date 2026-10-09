import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { DraftSchema, MAX_PHOTOS, type Chapter, type DraftRequest, type Tone } from "@/lib/studio/draft";

/* Reading ~80 photos and writing every chapter takes a while. */
export const maxDuration = 300;

const client = new Anthropic();

const SYSTEM = `You help people put together a small website for their partner on Unwrapme, an Indonesian service for couples. The buyer has uploaded photos from their relationship. Your job is to turn the pile into chapters, one per date or outing, and write a first draft of each chapter's story that the buyer will then edit.

Grouping:
- A chapter is one date or outing: same day and same place or activity. Use the "taken" times when they are given; photos without a time are grouped by what they show.
- Every photo goes into exactly one chapter. Photos are numbered from 1; refer to them by those numbers.
- Order chapters from oldest to newest. Pick as cover the photo that best sums up the chapter.

Titles and dates:
- Title format: "Kencan ke-N · <what happened>", e.g. "Kencan ke-3 · Ngopi sore". Number the chapters in order. If a chapter is clearly not a date (a birthday, a trip, a graduation), name it for what it is instead, e.g. "Ulang tahun Milea".
- "when" is a short Indonesian date label such as "14 Februari 2025" or "Maret 2025". If there is no time information, describe the time of day or leave a short guess like "Sore hari".

Stories:
- Write in Indonesian, as the buyer talking to their partner ("aku" and "kamu"), 2 to 4 short sentences per chapter.
- Use only what the photos show and what the buyer told you. Never invent names, places, quotes or events. Where a detail only they would know would make the story better, leave a short placeholder in square brackets, e.g. "[nama kafenya]", so they can fill it in.
- Sound like a real person writing to someone they love, not like a greeting card. Avoid clichés and over-the-top romance.
- If the buyer gave a sample of their own writing, match its voice: word choice, slang, emoji use, capitalisation.`;

const TONES: Record<Tone, string> = {
  santai: "Santai, seperti chat sehari-hari.",
  manis: "Manis dan hangat, tapi tetap sederhana.",
  lucu: "Lucu dan jahil, boleh bercanda.",
};

/** Indonesian-style label for when a photo was taken, so Claude can tell the dates apart. */
function takenLabel(iso: string | null) {
  if (!iso) return "waktu tidak diketahui";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "waktu tidak diketahui";
  return d.toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short", timeZone: "UTC" });
}

function buildContent(body: DraftRequest): Anthropic.Beta.BetaContentBlockParam[] {
  const content: Anthropic.Beta.BetaContentBlockParam[] = [];
  body.photos.forEach((p, i) => {
    content.push({ type: "text", text: `Foto ${i + 1} · diambil ${takenLabel(p.takenAt)}` });
    content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: p.data } });
  });

  const about = [
    body.names.trim() && `Nama kami: ${body.names.trim()}`,
    body.notes.trim() && `Cerita singkat dari kami:\n${body.notes.trim()}`,
    body.sample.trim() && `Contoh tulisanku sendiri (tiru gayanya):\n${body.sample.trim()}`,
    `Nada tulisan: ${TONES[body.tone] ?? TONES.santai}`,
  ].filter(Boolean);

  content.push({
    type: "text",
    text: `Ada ${body.photos.length} foto di atas.\n\n${about.join("\n\n")}\n\nKelompokkan fotonya jadi bab per kencan dan tulis draf ceritanya.`,
  });
  return content;
}

/**
 * Claude's grouping is a suggestion, so make it safe to render: drop numbers
 * that point at no photo, keep each photo in its first chapter only, and give
 * any photo it forgot a chapter of its own at the end.
 */
function tidy(chapters: Chapter[], count: number): Chapter[] {
  const seen = new Set<number>();
  const out: Chapter[] = [];
  for (const c of chapters) {
    const photos = c.photos.filter((n) => Number.isInteger(n) && n >= 1 && n <= count && !seen.has(n));
    photos.forEach((n) => seen.add(n));
    if (!photos.length) continue;
    out.push({ ...c, photos, cover: photos.includes(c.cover) ? c.cover : photos[0] });
  }
  const left = Array.from({ length: count }, (_, i) => i + 1).filter((n) => !seen.has(n));
  if (left.length) {
    out.push({ title: "Belum masuk bab", when: "", photos: left, cover: left[0], story: "" });
  }
  return out;
}

function fail(status: number, error: string) {
  return Response.json({ error }, { status });
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return fail(503, "Kunci API Claude belum diatur. Isi ANTHROPIC_API_KEY di .env.local, lalu jalankan ulang server.");
  }

  let body: DraftRequest;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Data yang dikirim tidak terbaca.");
  }
  if (!Array.isArray(body.photos) || body.photos.length === 0) {
    return fail(400, "Belum ada foto yang dikirim.");
  }
  if (body.photos.length > MAX_PHOTOS) {
    return fail(400, `Maksimal ${MAX_PHOTOS} foto sekali susun.`);
  }

  try {
    const stream = client.beta.messages.stream({
      model: "claude-opus-5-5",
      max_tokens: 32000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: betaZodOutputFormat(DraftSchema) },
      system: SYSTEM,
      messages: [{ role: "user", content: buildContent(body) }],
    });
    const message = await stream.finalMessage();

    if (message.stop_reason === "refusal") {
      return fail(422, "Claude tidak bisa memproses foto-foto ini. Coba kurangi atau ganti beberapa foto.");
    }
    if (message.stop_reason === "max_tokens" || !message.parsed_output) {
      return fail(502, "Drafnya terpotong. Coba lagi dengan foto yang lebih sedikit.");
    }

    return Response.json({ chapters: tidy(message.parsed_output.chapters, body.photos.length) });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return fail(401, "Kunci API Claude ditolak. Periksa ANTHROPIC_API_KEY di .env.local.");
    }
    if (error instanceof Anthropic.RateLimitError) {
      return fail(429, "Lagi ramai. Tunggu sebentar, lalu coba lagi.");
    }
    if (error instanceof Anthropic.BadRequestError) {
      console.error("[studio] bad request:", error.message);
      return fail(400, "Ada foto yang tidak bisa dibaca. Coba hapus foto yang bukan JPG atau PNG.");
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`[studio] API error ${error.status}:`, error.message);
      return fail(502, "Claude sedang bermasalah. Coba lagi sebentar lagi.");
    }
    console.error("[studio] unexpected:", error);
    return fail(500, "Ada yang salah saat menyusun draf. Coba lagi.");
  }
}

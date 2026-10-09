import Image from "next/image";
import Scene, { type SceneKind } from "@/components/art/Scene";
import Lily from "@/components/art/Lily";
import { cn } from "@/lib/cn";

export type Book = {
  title: string;
  label: string;
  scene?: SceneKind;
  /** A real photograph, used instead of the painted scene. */
  photo?: string;
  cloth: string;
  style: "photo" | "cloth" | "title" | "empty";
  lily?: boolean;
  /** Dark writing, for a pastel cloth. */
  ink?: boolean;
};

/**
 * The front of one book on the shelf, bound one of three ways — a photograph to
 * the edges with a paper label, cloth with a photograph set into it, or a
 * photograph with its name across the top — so a shelf of them reads as a row
 * of different books. Every size is in `cqw`, so it is the same book at any size.
 */
/**
 * `soft` is the light, scrapbook binding Rak Buku now ships with: a gentler
 * shadow and washi tape on the photographs.
 */
export default function BookCover({ book: b, className, soft = false }: { book: Book; className?: string; soft?: boolean }) {
  const picture = b.photo ? (
    <Image src={b.photo} alt="" fill sizes="240px" className="object-cover" />
  ) : b.scene ? (
    <Scene kind={b.scene} />
  ) : null;

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-l-[0.8cqw] rounded-r-[3.2cqw] [container-type:inline-size]",
        soft
          ? "shadow-[0_3cqw_7cqw_-2.5cqw_rgba(70,45,35,0.45),inset_0_0_0_0.3cqw_rgba(255,255,255,0.18)]"
          : "shadow-[0_3cqw_6cqw_-2cqw_rgba(0,0,0,0.8),inset_0_0_0_0.3cqw_rgba(255,255,255,0.06)]",
        className
      )}
      style={{ backgroundColor: b.cloth }}
    >
      {/* cloth weave */}
      <span
        className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.18) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 3px)",
        }}
      />

      {(b.style === "photo" || b.style === "title") && picture ? <div className="absolute inset-0">{picture}</div> : null}

      {b.style === "photo" ? (
        <div className="absolute bottom-[9%] left-[16%] right-[9%] rotate-[-1.5deg] bg-[#f6efe5] px-[5cqw] py-[4cqw] shadow-[0_1.5cqw_3cqw_-1cqw_rgba(0,0,0,0.6)]">
          <p className="font-sans text-[3.2cqw] uppercase tracking-[0.3em] text-sepia">{b.label}</p>
          <p className="mt-[1.5cqw] font-script text-[11cqw] leading-[1.02] text-petal-deep">{b.title}</p>
        </div>
      ) : null}

      {b.style === "title" ? (
        <>
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/45" />
          <div className="absolute left-[16%] right-[8%] top-[8%]">
            <p className="font-sans text-[3.2cqw] uppercase tracking-[0.3em] text-white/75">{b.label}</p>
            <p className="mt-[1cqw] font-script text-[13cqw] leading-[1] text-white [text-shadow:0_1cqw_3cqw_rgba(0,0,0,0.5)]">
              {b.title}
            </p>
          </div>
        </>
      ) : null}

      {b.style === "cloth" ? (
        <>
          <div className="absolute left-[22%] right-[12%] top-[11%] aspect-[4/5] rotate-[2deg] bg-[#fbf8f3] p-[3cqw] shadow-[0_2cqw_3cqw_-1cqw_rgba(0,0,0,0.6)]">
            <div className="relative h-full w-full overflow-hidden">{picture}</div>
            {soft ? (
              <>
                <span className="absolute -left-[4cqw] -top-[1.5cqw] aspect-[4/1] w-[32%] -rotate-[28deg] bg-[#f6c6d1]/85" />
                <span className="absolute -right-[4cqw] -top-[1.5cqw] aspect-[4/1] w-[32%] rotate-[28deg] bg-[#f6c6d1]/85" />
              </>
            ) : null}
          </div>
          <div className="absolute bottom-[8%] left-[16%] right-[8%]">
            {b.lily ? <Lily alive={false} className="mb-[1cqw] h-[11cqw] w-[11cqw]" /> : null}
            <p
              className={cn(
                "text-[11cqw] leading-[1.02]",
                b.ink ? "font-hand text-[#3a2a26]" : "font-script text-[#f6efe5] [text-shadow:0_0.6cqw_1.6cqw_rgba(0,0,0,0.35)]"
              )}
            >
              {b.title}
            </p>
            <p className={cn("mt-[1cqw] font-sans text-[3cqw] uppercase tracking-[0.3em]", b.ink ? "text-[#3a2a26]/60" : "text-[#f6efe5]/70")}>
              {b.label}
            </p>
          </div>
        </>
      ) : null}

      {b.style === "empty" ? (
        <>
          <div className="absolute left-[24%] right-[14%] top-[14%] grid aspect-[4/5] place-items-center border-[0.5cqw] border-dashed border-[#b9a48f]">
            <span className="font-hand text-[18cqw] text-[#b9a48f]">?</span>
          </div>
          <div className="absolute bottom-[10%] left-[16%] right-[8%]">
            <p className="font-sans text-[3cqw] uppercase tracking-[0.3em] text-sepia">{b.label}</p>
            <p className="mt-[1cqw] font-hand text-[9cqw] leading-[1.05] text-pencil">{b.title}</p>
          </div>
        </>
      ) : null}

      {/* the spine: a darker band, a groove where the board hinges, a highlight */}
      <span
        className="pointer-events-none absolute inset-y-0 left-0 w-[9%]"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.42), rgba(0,0,0,0.12) 45%, rgba(255,255,255,0.14) 75%, rgba(0,0,0,0.2))",
        }}
      />
      <span className="pointer-events-none absolute inset-y-0 left-[10.5%] w-[0.6cqw] bg-black/25 shadow-[0.4cqw_0_0_rgba(255,255,255,0.12)]" />
      {/* a little sheen, as if under a lamp */}
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.16),transparent_38%,transparent_70%,rgba(255,255,255,0.06))]" />
    </div>
  );
}

import { z } from "zod";

/**
 * What Claude sends back from a pile of photos: the photos grouped into dates
 * (chapters), each with a suggested title and a first draft of its story. The
 * buyer edits all of it afterwards; this is only a starting point.
 */
export const DraftSchema = z.object({
  chapters: z.array(
    z.object({
      title: z.string(),
      when: z.string(),
      photos: z.array(z.number().int()),
      cover: z.number().int(),
      story: z.string(),
    }),
  ),
});

export type Draft = z.infer<typeof DraftSchema>;
export type Chapter = Draft["chapters"][number];

/** One photo as the browser sends it: a small JPEG, plus when it was taken if the file says so. */
export type PhotoInput = { data: string; takenAt: string | null };

export type Tone = "santai" | "manis" | "lucu";

export type DraftRequest = {
  photos: PhotoInput[];
  names: string;
  notes: string;
  sample: string;
  tone: Tone;
};

export const MAX_PHOTOS = 100;

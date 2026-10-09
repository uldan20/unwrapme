/**
 * Getting photos ready in the browser before they go to Claude: shrink each one
 * to a small JPEG (Claude only needs to recognise the scene, and 80 full-size
 * phone photos would be hundreds of megabytes) and read when it was taken.
 */

export type Photo = {
  id: string;
  name: string;
  /** Object URL of the small JPEG, for showing it on the page. */
  url: string;
  /** The same JPEG as base64, without the data: prefix, for the API. */
  data: string;
  /**
   * When it was taken, from the camera's EXIF data. Camera clocks have no time
   * zone, so the wall-clock time is stored as if it were UTC.
   */
  takenAt: string | null;
};

const LONG_SIDE = 640;

export async function preparePhoto(file: File): Promise<Photo> {
  const [takenAt, bitmap] = await Promise.all([readTakenAt(file), createImageBitmap(file)]);

  const scale = Math.min(1, LONG_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/jpeg", 0.78),
  );
  const data = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.readAsDataURL(blob);
  });

  return { id: crypto.randomUUID(), name: file.name, url: URL.createObjectURL(blob), data, takenAt };
}

/** Oldest first; photos without a date keep their order, after the dated ones. */
export function byTakenAt(a: Photo, b: Photo) {
  if (a.takenAt && b.takenAt) return a.takenAt.localeCompare(b.takenAt);
  return a.takenAt ? -1 : b.takenAt ? 1 : 0;
}

/**
 * DateTimeOriginal (or, failing that, DateTime) from a JPEG's EXIF block.
 * Only the first 128 KB is read; that is where EXIF lives.
 */
async function readTakenAt(file: File): Promise<string | null> {
  try {
    const view = new DataView(await file.slice(0, 128 * 1024).arrayBuffer());
    if (view.getUint16(0) !== 0xffd8) return null;

    let at = 2;
    while (at + 4 < view.byteLength) {
      const marker = view.getUint16(at);
      const size = view.getUint16(at + 2);
      if (marker === 0xffe1 && view.getUint32(at + 4) === 0x45786966) return readExif(view, at + 10);
      if ((marker & 0xff00) !== 0xff00) return null;
      at += 2 + size;
    }
  } catch {
    /* not a JPEG we can read: no date */
  }
  return null;
}

function readExif(view: DataView, tiff: number): string | null {
  const little = view.getUint16(tiff) === 0x4949;
  const u16 = (o: number) => view.getUint16(o, little);
  const u32 = (o: number) => view.getUint32(o, little);

  /** Every tag in the IFD at `ifd`, as tag -> offset of its entry. */
  const entries = (ifd: number) => {
    const out = new Map<number, number>();
    const count = u16(ifd);
    for (let i = 0; i < count; i++) out.set(u16(ifd + 2 + i * 12), ifd + 2 + i * 12);
    return out;
  };
  const ascii = (entry: number) => {
    const length = u32(entry + 4);
    const start = length > 4 ? tiff + u32(entry + 8) : entry + 8;
    let s = "";
    for (let i = 0; i < length - 1; i++) s += String.fromCharCode(view.getUint8(start + i));
    return s;
  };

  const ifd0 = entries(tiff + u32(tiff + 4));
  const exifPointer = ifd0.get(0x8769);
  const exif = exifPointer ? entries(tiff + u32(exifPointer + 8)) : new Map<number, number>();
  const entry = exif.get(0x9003) ?? ifd0.get(0x0132);
  if (!entry) return null;

  // "2025:03:14 18:20:05" -> "2025-03-14T18:20:05Z"
  const m = ascii(entry).match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z` : null;
}

/**
 * The pressed plate she can keep: her flower seen from above, on paper, with
 * its name and hers, saved as a picture on her own device. Nothing is sent
 * anywhere; it is drawn in the browser from the flower's SVG.
 */
export async function savePlate(
  svg: SVGSVGElement,
  { plate, latin, to, from, paper, ink, file }: { plate: string; latin: string; to: string; from: string; paper: string; ink: string; file: string },
) {
  const W = 1080;
  const H = 1350;
  const copy = svg.cloneNode(true) as SVGSVGElement;
  copy.setAttribute('width', '900');
  copy.setAttribute('height', '900');
  copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(copy));
  await img.decode();

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext('2d');
  if (!c) return;
  const serif = getComputedStyle(document.documentElement).getPropertyValue('--font-cormorant').trim() || 'Georgia';

  c.fillStyle = paper;
  c.fillRect(0, 0, W, H);
  c.strokeStyle = ink;
  c.globalAlpha = 0.35;
  c.lineWidth = 2;
  c.strokeRect(48, 48, W - 96, H - 96);
  c.globalAlpha = 0.18;
  c.strokeRect(62, 62, W - 124, H - 124);
  c.globalAlpha = 1;

  c.fillStyle = ink;
  c.textAlign = 'center';
  c.font = `500 30px ${serif}`;
  c.letterSpacing = '10px';
  c.fillText(`LEMBAR ${plate}.`, W / 2, 150);
  c.letterSpacing = '0px';
  c.drawImage(img, (W - 900) / 2, 190, 900, 900);
  c.font = `italic 64px ${serif}`;
  c.fillText(latin, W / 2, 1150);
  c.globalAlpha = 0.6;
  c.font = `italic 34px ${serif}`;
  c.fillText(`untuk ${to}, dari ${from}`, W / 2, 1210);
  c.globalAlpha = 1;

  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

import sharp from "sharp";

const OUTPUT_SIZE = 256;
const PADDING = 0.2; // 20% padding — keeps single face centered without expanding into neighbors

export type NormalizedBox = { x: number; y: number; w: number; h: number };

/**
 * Crop a face from an image using normalized box (0..1) with safe padding.
 * Respects EXIF orientation. Returns a 256x256 JPEG buffer.
 */
export async function cropFaceToThumbnail(
  imageBuffer: Buffer,
  box: NormalizedBox
): Promise<Buffer> {
  const img = sharp(imageBuffer).rotate(); // IMPORTANT: respect EXIF orientation
  const meta = await img.metadata();
  const imgW = meta.width ?? 1;
  const imgH = meta.height ?? 1;

  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const minSize = 0.12; // ensure crop region is at least 12% of image
  const rawW = Math.max(box.w, minSize);
  const rawH = Math.max(box.h, minSize);
  const paddedW = Math.min(1, rawW * (1 + PADDING * 2));
  const paddedH = Math.min(1, rawH * (1 + PADDING * 2));
  const halfW = paddedW / 2;
  const halfH = paddedH / 2;

  let left = (cx - halfW) * imgW;
  let top = (cy - halfH) * imgH;
  let width = paddedW * imgW;
  let height = paddedH * imgH;

  // clamp
  if (left < 0) {
    width += left;
    left = 0;
  }
  if (top < 0) {
    height += top;
    top = 0;
  }
  if (left + width > imgW) width = imgW - left;
  if (top + height > imgH) height = imgH - top;

  const x = Math.round(Math.max(0, Math.min(left, imgW - 1)));
  const y = Math.round(Math.max(0, Math.min(top, imgH - 1)));
  const w = Math.max(1, Math.round(Math.min(width, imgW - x)));
  const h = Math.max(1, Math.round(Math.min(height, imgH - y)));

  return await sharp(imageBuffer)
    .rotate() // IMPORTANT: same orientation
    .extract({ left: x, top: y, width: w, height: h })
    .resize(OUTPUT_SIZE, OUTPUT_SIZE, { fit: "cover" })
    .jpeg({ quality: 85 })
    .toBuffer();
}

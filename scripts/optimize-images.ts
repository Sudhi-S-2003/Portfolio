/**
 * Make small, modern versions of the portrait with Sharp: AVIF and WebP for current browsers, JPEG as the fallback,
 * at 1x, 2x and 3x of its largest on-screen width (112 px). Cropped to 4:5 from the top so the face stays in frame.
 * Output goes to public/images/ (git-ignored) and runs before `dev` and `build`.
 */
import { mkdir, stat } from 'node:fs/promises';
import sharp from 'sharp';

const SOURCE = 'src/assets/sudhi.jpg';
const OUT_DIR = 'public/images';
const PORTRAIT_WIDTHS = [112, 224, 336] as const; // keep in step with src/pages/Home.tsx

await mkdir(OUT_DIR, { recursive: true });
const sourceTime = (await stat(SOURCE)).mtimeMs;

for (const width of PORTRAIT_WIDTHS) {
  const height = Math.round((width * 5) / 4);
  const base = sharp(SOURCE).resize(width, height, { fit: 'cover', position: 'top' });
  const outputs = [
    { file: `${OUT_DIR}/sudhi-${width}.avif`, make: () => base.clone().avif({ quality: 55 }) },
    { file: `${OUT_DIR}/sudhi-${width}.webp`, make: () => base.clone().webp({ quality: 72 }) },
    { file: `${OUT_DIR}/sudhi-${width}.jpg`, make: () => base.clone().jpeg({ quality: 78, mozjpeg: true }) },
  ];
  for (const output of outputs) {
    const existing = await stat(output.file).catch(() => null);
    if (existing && existing.mtimeMs >= sourceTime) continue; // already up to date
    await output.make().toFile(output.file);
  }
}
console.log(`portrait: ${PORTRAIT_WIDTHS.length * 3} files in ${OUT_DIR}`);

// Generates the Sahara favicon / app-icon set from the brand mark in public/brand.
// The mark (sahara-icon.png) is the official artwork: a transparent, rounded navy tile.
// Uses ffmpeg; no extra npm dependency needed.
// Run: node scripts/generate-brand-assets.mjs   (from apps/web)
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..');
const brand = join(web, 'public', 'brand');
const root = join(web, 'public');
const tmp = join(root, '.brand-tmp');
const mark = join(brand, 'sahara-icon.png');
const NAVY = '0x0B1020';

const run = (args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });
// Flat icons composite the transparent mark on the brand navy so small sizes stay legible.
const flat = (size, out) => run([
  '-i', mark, '-f', 'lavfi', '-i', `color=c=${NAVY}:s=${size}x${size}`,
  '-filter_complex', `[0:v]scale=${size}:${size}:force_original_aspect_ratio=decrease[ic];[1:v][ic]overlay=(W-w)/2:(H-h)/2`,
  '-frames:v', '1', '-update', '1', out
]);

mkdirSync(tmp, { recursive: true });

flat(16, join(root, 'favicon-16x16.png'));
flat(32, join(root, 'favicon-32x32.png'));
flat(48, join(tmp, 'ico-48.png'));
flat(180, join(root, 'apple-touch-icon.png'));
flat(192, join(root, 'android-chrome-192x192.png'));
flat(512, join(root, 'android-chrome-512x512.png'));

// Social preview card: the white logo centred on the brand navy (Open Graph / Twitter).
run([
  '-f', 'lavfi', '-i', `color=c=${NAVY}:s=1200x630`,
  '-i', join(brand, 'sahara-logo-white.png'),
  '-filter_complex', '[1:v]scale=780:-1[lg];[0:v][lg]overlay=(W-w)/2:(H-h)/2',
  '-frames:v', '1', '-update', '1', join(root, 'og-image.png')
]);

// favicon.ico: header + ICONDIR entries that wrap the PNG bytes (Vista+ supports PNG-in-ICO).
const icoPngs = [
  readFileSync(join(root, 'favicon-16x16.png')),
  readFileSync(join(root, 'favicon-32x32.png')),
  readFileSync(join(tmp, 'ico-48.png'))
];
const sizes = [16, 32, 48];
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2); // 1 = icon
header.writeUInt16LE(icoPngs.length, 4);
const entries = [];
let offset = 6 + icoPngs.length * 16;
for (let i = 0; i < icoPngs.length; i++) {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(sizes[i] === 256 ? 0 : sizes[i], 0);
  entry.writeUInt8(sizes[i] === 256 ? 0 : sizes[i], 1);
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(icoPngs[i].length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += icoPngs[i].length;
  entries.push(entry);
}
writeFileSync(join(root, 'favicon.ico'), Buffer.concat([header, ...entries, ...icoPngs]));

rmSync(tmp, { recursive: true, force: true });
console.log('Brand assets generated in', root);

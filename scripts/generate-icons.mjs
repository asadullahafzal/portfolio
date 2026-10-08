// Generates every icon the site needs from scripts/icon.svg.
// Run after changing the logo:  node scripts/generate-icons.mjs
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const svg = readFileSync(new URL("./icon.svg", import.meta.url));
// Square, full-bleed version (no rounded corners): iOS and Android apply their own mask
const squareSvg = Buffer.from(svg.toString().replace('rx="15"', 'rx="0"'));

// Heavier strokes stay legible at 16–48px in browser tabs
const boldSvg = Buffer.from(svg.toString().replace('stroke-width="6"', 'stroke-width="8"').replace('stroke-width="5"', 'stroke-width="6.5"'));

const png = (source, size) => sharp(source, { density: 600 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

// favicon.ico with 16, 32 and 48px PNGs inside (ICO header + directory + image data)
async function ico(sizes) {
  const images = await Promise.all(sizes.map((s) => png(boldSvg, s)));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map((img, i) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(sizes[i] % 256, 0);
    e.writeUInt8(sizes[i] % 256, 1);
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(img.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += img.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...images]);
}

const out = (p) => new URL(`../${p}`, import.meta.url);
writeFileSync(out("src/app/icon.svg"), svg);
writeFileSync(out("src/app/favicon.ico"), await ico([16, 32, 48]));
writeFileSync(out("src/app/apple-icon.png"), await png(squareSvg, 180));
writeFileSync(out("public/icon-192.png"), await png(svg, 192));
writeFileSync(out("public/icon-512.png"), await png(svg, 512));
writeFileSync(out("public/icon-maskable-512.png"), await png(squareSvg, 512));
console.log("Icons generated.");

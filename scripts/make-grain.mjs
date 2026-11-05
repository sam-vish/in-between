// Writes the static film-grain PNG the page overlays at 4%. Seeded, so it is reproducible.
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const t = Buffer.from(type);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}
function png(w, h, pixel) {
  const raw = Buffer.alloc((w * 2 + 1) * h);
  let i = 0;
  for (let y = 0; y < h; y++) {
    raw[i++] = 0;
    for (let x = 0; x < w; x++) { const [v, a] = pixel(); raw[i++] = v; raw[i++] = a; }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 4; // 8-bit grey + alpha
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}
let s = 1337;
const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
mkdirSync("public/textures", { recursive: true });
writeFileSync("public/textures/grain.png", png(180, 180, () => [r() < 0.5 ? 0 : 255, Math.floor(r() * 255)]));
writeFileSync("public/textures/static.png", png(160, 80, () => { const v = Math.floor(r() * 255); return [v, 255]; }));

/* Generate simple PNG icons from scratch (no canvas dep). */
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

function makeIcon(size) {
  const png = new PNG({ width: size, height: size });
  const lime = [31, 61, 43, 255]; // deep green fill
  const ink = [26, 23, 20, 255];
  const pink = [232, 93, 38, 255]; // accent
  const violet = [250, 246, 239, 255]; // paper mark

  function set(x, y, c) {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (size * y + x) << 2;
    png.data[i] = c[0];
    png.data[i + 1] = c[1];
    png.data[i + 2] = c[2];
    png.data[i + 3] = c[3];
  }

  const r = Math.floor(size * 0.14);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inCorner =
        (x < r && y < r && (x - r) ** 2 + (y - r) ** 2 > r * r) ||
        (x > size - 1 - r && y < r && (x - (size - 1 - r)) ** 2 + (y - r) ** 2 > r * r) ||
        (x < r && y > size - 1 - r && (x - r) ** 2 + (y - (size - 1 - r)) ** 2 > r * r) ||
        (x > size - 1 - r && y > size - 1 - r && (x - (size - 1 - r)) ** 2 + (y - (size - 1 - r)) ** 2 > r * r);
      set(x, y, inCorner ? [0, 0, 0, 0] : lime);
    }
  }

  const border = Math.max(4, Math.floor(size * 0.045));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nearEdge =
        x < border || y < border || x >= size - border || y >= size - border;
      if (nearEdge) {
        const cx = Math.min(Math.max(x, r), size - 1 - r);
        const cy = Math.min(Math.max(y, r), size - 1 - r);
        // keep rounded transparency
        const i = (size * y + x) << 2;
        if (png.data[i + 3] === 0) continue;
        set(x, y, ink);
      }
    }
  }

  // sticker dots
  function disc(cx, cy, rad, col) {
    for (let y = cy - rad; y <= cy + rad; y++) {
      for (let x = cx - rad; x <= cx + rad; x++) {
        if ((x - cx) ** 2 + (y - cy) ** 2 <= rad * rad) set(x, y, col);
      }
    }
  }
  disc(Math.floor(size * 0.78), Math.floor(size * 0.22), Math.floor(size * 0.08), pink);
  disc(Math.floor(size * 0.22), Math.floor(size * 0.78), Math.floor(size * 0.06), violet);

  // CY block
  const block = Math.max(2, Math.floor(size / 32));
  function letterC(ox, oy) {
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 8; x++) {
        const edge = x === 0 || (y === 0 && x < 7) || (y === 9 && x < 7);
        const open = x > 5 && y > 2 && y < 7;
        if (edge && !open) {
          for (let dy = 0; dy < block; dy++)
            for (let dx = 0; dx < block; dx++) set(ox + x * block + dx, oy + y * block + dy, ink);
        }
      }
    }
  }
  function letterY(ox, oy) {
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 8; x++) {
        const left = y < 5 && x === Math.floor(y * 0.6);
        const right = y < 5 && x === 7 - Math.floor(y * 0.6);
        const stem = y >= 5 && x === 3;
        if (left || right || stem) {
          for (let dy = 0; dy < block; dy++)
            for (let dx = 0; dx < block; dx++) set(ox + x * block + dx, oy + y * block + dy, ink);
        }
      }
    }
  }
  const ox = Math.floor(size * 0.28);
  const oy = Math.floor(size * 0.34);
  letterC(ox, oy);
  letterY(ox + block * 9, oy);

  return png;
}

const dir = path.join(__dirname, "..", "icons");
fs.mkdirSync(dir, { recursive: true });
for (const size of [192, 512]) {
  const png = makeIcon(size);
  const out = path.join(dir, `icon-${size}.png`);
  png.pack().pipe(fs.createWriteStream(out));
  console.log("wrote", out);
}

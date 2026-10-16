// Parse Electron asar: list entries and extract files matching a filter.
// Usage: node asar-extract.mjs <asar-path> <out-dir> [regex-filter]
import fs from "node:fs";
import path from "node:path";

const [, , asarPath, outDir, filter] = process.argv;
const fd = fs.openSync(asarPath, "r");
const buf8 = Buffer.alloc(16);
fs.readSync(fd, buf8, 0, 16, 0);
// Chromium Pickle: [uint32 outerPayloadSize][uint32 innerPayloadSize][uint32 strLen][json...]
// Try the standard layout first, then the alt (headerSize at 4, json at 8).
let header = null, dataOffset = null;
const stat = fs.fstatSync(fd);
function maxEnd(node, off) {
  if (node.files) return Math.max(...Object.values(node.files).map(c => maxEnd(c, off)), 0);
  if (node.offset === undefined || node.unpacked) return 0;
  return off + Number(node.offset) + Number(node.size);
}
for (const cand of [
  () => { const strLen = buf8.readUInt32LE(8); const h = Buffer.alloc(strLen); fs.readSync(fd, h, 0, strLen, 12); return { h: JSON.parse(h.toString("utf8")), off: 4 + buf8.readUInt32LE(0) }; },
  () => { const strLen = buf8.readUInt32LE(4); const h = Buffer.alloc(strLen); fs.readSync(fd, h, 0, strLen, 8); return { h: JSON.parse(h.toString("utf8")), off: 8 + buf8.readUInt32LE(0) + ((4 - (buf8.readUInt32LE(0) % 4)) % 4) }; },
  () => { const strLen = buf8.readUInt32LE(12); const h = Buffer.alloc(strLen); fs.readSync(fd, h, 0, strLen, 16); return { h: JSON.parse(h.toString("utf8")), off: 16 + strLen + ((4 - (strLen % 4)) % 4) }; },
]) {
  try { const r = cand(); if (r.h && r.h.files && maxEnd({ files: r.h.files }, r.off) <= stat.size) { header = r.h; dataOffset = r.off; break; } } catch {}
}
if (!header) throw new Error("could not parse asar header; first bytes: " + buf8.toString("hex"));
console.log("dataOffset:", dataOffset);

const re = filter ? new RegExp(filter) : null;
let listed = 0, extracted = 0;
function walk(node, p) {
  if (node.files) {
    for (const [name, child] of Object.entries(node.files)) walk(child, p + "/" + name);
    return;
  }
  listed++;
  if (re && !re.test(p)) return;
  if (node.unpacked) {
    const up = path.join(asarPath + ".unpacked", p);
    if (fs.existsSync(up)) {
      fs.mkdirSync(path.join(outDir, path.dirname(p)), { recursive: true });
      fs.copyFileSync(up, path.join(outDir, p));
      extracted++;
    } else console.log("UNPACKED-MISSING", p);
    return;
  }
  if (node.offset === undefined) return;
  const off = dataOffset + Number(node.offset);
  const buf = Buffer.alloc(Number(node.size));
  fs.readSync(fd, buf, 0, buf.length, off);
  fs.mkdirSync(path.join(outDir, path.dirname(p)), { recursive: true });
  fs.writeFileSync(path.join(outDir, p), buf);
  extracted++;
}
walk({ files: header.files }, "");
console.log(`entries: ${listed}, extracted: ${extracted}`);

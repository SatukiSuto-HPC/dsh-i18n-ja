// Split out/locales.json into per-namespace translation inputs:
// out/src/<ns>.json = { "<key>": { "en": "...", "zh": "..." } }
import fs from "node:fs";
const data = JSON.parse(fs.readFileSync("out/locales.json", "utf8"));
fs.mkdirSync("out/src", { recursive: true });
let total = 0;
for (const rec of data) {
  const out = {};
  for (const [k, en] of Object.entries(rec.dicts.en ?? {})) {
    out[k] = { en, zh: rec.dicts.zh?.[k] ?? "" };
  }
  total += Object.keys(out).length;
  fs.writeFileSync(`out/src/${rec.ns}.json`, JSON.stringify(out, null, 1), "utf8");
}
console.log(`wrote ${data.length} files, ${total} keys`);

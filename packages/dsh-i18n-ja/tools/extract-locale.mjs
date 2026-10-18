// Extract locale dictionaries from compiled @linxin666 client bundles.
// Scans each package's lib/client.js for `ctx.locale.register(NS, {zh, en})`
// (typed form) and `ctx.locale.register(ns, "xx", dict)` (single-locale form),
// resolves identifier references to their `const X = {...}` object literals,
// evaluates them, and dumps { package, ns, zh, en } to out/locales.json.
import fs from "node:fs";
import path from "node:path";

const NM = process.argv[2];
if (!NM) {
  console.error("usage: node extract-locale.mjs <node_modules/@linxin666 dir> [out/locales.json]");
  process.exit(1);
}
const OUT = process.argv[3] ?? "out/locales.json";

function findLiteral(code, startIdx) {
  // startIdx points at the '{' opening the object literal; return the balanced slice.
  let depth = 0, i = startIdx, inStr = null, esc = false;
  for (; i < code.length; i++) {
    const ch = code[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { inStr = ch; continue; }
    if (ch === "{") depth++;
    else if (ch === "}") { depth--; if (depth === 0) return code.slice(startIdx, i + 1); }
  }
  return null;
}

function evalLiteral(lit, label) {
  try {
    return new Function(`return (${lit});`)();
  } catch (e) {
    console.error(`  !! eval failed for ${label}: ${e.message}`);
    return null;
  }
}

const results = [];
for (const dir of fs.readdirSync(NM)) {
  const file = path.join(NM, dir, "lib", "client.js");
  if (!fs.existsSync(file)) continue;
  const code = fs.readFileSync(file, "utf8");
  // Map all top-level-ish const object literals by name (const/let/var, incl. Object.freeze).
  const constLits = new Map();
  for (const m of code.matchAll(/\b(?:const|let|var) ([A-Za-z_$][\w$]*) = (?:Object\.freeze\(|\(\s*)?\{/g)) {
    const lit = findLiteral(code, code.indexOf("{", m.index + m[0].length - 1));
    if (lit) constLits.set(m[1], lit);
  }
  // Also map const X = IDENT; alias chains (e.g. const zh = STATIC_ZH).
  const constAlias = new Map();
  for (const m of code.matchAll(/\b(?:const|let|var) ([A-Za-z_$][\w$]*) = ([A-Za-z_$][\w$]*);/g)) {
    constAlias.set(m[1], m[2]);
  }
  const constPrim = new Map();
  for (const m of code.matchAll(/\b(?:const|let|var) ([A-Za-z_$][\w$]*) = ("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`$\\]*`|-?\d+(?:\.\d+)?|true|false|null);/g)) {
    constPrim.set(m[1], m[2]);
  }
  // Pre-declare every literal/alias so dict literals that reference sibling consts
  // (guideZh, PLAN_NEXT_ACTION_ZH, PRODUCT_NAMES, spreads, …) can be evaluated.
  // Literals that fail to PARSE standalone (e.g. mis-captured class bodies with
  // private fields) are excluded, so one bad span cannot break the whole preamble.
  const decls = [];
  for (const [name, prim] of constPrim) decls.push(`try { var ${name} = (${prim}); } catch {}`);
  for (const [name, lit] of constLits) {
    try { new Function(`return (${lit});`); } catch (e) { if (e instanceof SyntaxError) continue; }
    decls.push(`try { var ${name} = (${lit}); } catch {}`);
  }
  for (const [name, alias] of constAlias) if (!constLits.has(name)) decls.push(`try { var ${name} = (${alias}); } catch {}`);
  const preamble = decls.join("\n");
  const evalScoped = (expr, label) => {
    try { return new Function(`${preamble}\nreturn (${expr});`)(); }
    catch (e) { console.error(`  !! eval failed for ${label}: ${e.message}`); return null; }
  };
  const resolveLit = (id, seen = new Set()) => {
    if (seen.has(id)) return null;
    seen.add(id);
    if (constLits.has(id)) return constLits.get(id);
    const alias = constAlias.get(id);
    return alias ? resolveLit(alias, seen) : null;
  };
  // Typed registration: .locale.register(NS, { zh, en }) — capture the balanced
  // wrapper literal (works for shorthand ids AND inline nested dicts).
  // Also matches bare `locale.register(` (destructured ctx) but not identifiers
  // ending in "locale" (the [^\w$] guard).
  for (const m of code.matchAll(/[^\w$]locale\.register\(\s*([A-Za-z_$][\w$]*|"[^"]+")\s*,\s*(?=\{)/g)) {
    const nsArg = m[1];
    const ns = nsArg.startsWith('"') ? nsArg.slice(1, -1) : resolveNs(code, constLits, nsArg);
    const braceIdx = code.indexOf("{", m.index + m[0].length - 1);
    const lit = findLiteral(code, braceIdx);
    if (!lit) { console.error(`  ?? ${dir}: ns=${ns} wrapper literal not found`); continue; }
    const wrapper = evalScoped(lit, `${dir}/${ns}/wrapper`);
    if (!wrapper || typeof wrapper !== "object") continue;
    if (!results.find(r => r.ns === ns)) results.push({ package: dir, ns, dicts: {} });
    const rec = results.find(r => r.ns === ns);
    for (const [locale, dict] of Object.entries(wrapper)) {
      if (!/^[a-z-]{2,10}$/.test(locale)) continue;
      if (dict && typeof dict === "object" && !rec.dicts[locale]) rec.dicts[locale] = dict;
    }
  }
  // Single-locale registration: .locale.register("ns", "ru", dictIdOrLiteral)
  for (const m of code.matchAll(/[^\w$]locale\.register\(\s*("[^"]+")\s*,\s*("[a-z-]+")\s*,\s*([A-Za-z_$][\w$]*|\{)/g)) {
    const ns = m[1].slice(1, -1), locale = m[2].slice(1, -1);
    let expr = m[3];
    if (expr === "{") expr = findLiteral(code, code.indexOf("{", m.index + m[0].length - 1));
    else expr = resolveLit(expr) ?? expr;
    if (!expr) { console.error(`  ?? ${dir}: ns=${ns} locale=${locale} dict not found`); continue; }
    const dict = evalScoped(expr, `${dir}/${ns}/${locale}`);
    if (!dict) continue;
    if (!results.find(r => r.ns === ns)) results.push({ package: dir, ns, dicts: {} });
    const rec = results.find(r => r.ns === ns);
    if (!rec.dicts[locale]) rec.dicts[locale] = dict;
  }
}

function resolveNs(code, constLits, id) {
  // NS const may be a string literal: const NS = "git-graph"
  const esc = id.replace(/[$]/g, "\\$");
  const m = new RegExp(`const ${esc} = "([^"]+)"`).exec(code);
  return m ? m[1] : id;
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(results, null, 2), "utf8");
let total = 0;
for (const r of results) {
  const counts = Object.entries(r.dicts).map(([k, v]) => `${k}:${Object.keys(v).length}`).join(" ");
  total += Object.keys(r.dicts.en ?? Object.values(r.dicts)[0] ?? {}).length;
  console.log(`${r.package.padEnd(36)} ns=${r.ns.padEnd(28)} ${counts}`);
}
console.log(`TOTAL en keys = ${total}`);

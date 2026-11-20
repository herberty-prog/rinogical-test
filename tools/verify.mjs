/* ===========================================================================
   りのじかる 問題の自動チェック（フェーズ3）
   ---------------------------------------------------------------------------
   src/ を build.mjs と同じ順につないで Node 上で読み込み、全教科・全単元の
   「問題をつくる関数」を Lv1〜8 で何百回も呼んで、次のことを調べます。

   ・4択：選択肢がちょうど4つ／同じ選択肢が2つない／正解がちょうど1つ入っている
   ・4択（文字の問題）：選択肢が6文字以内（バトル画面で折り返さない長さ）
   ・強調する言葉（mark）が、問題文の中にちょうど1回だけ出てくる
   ・ならべかえ：札をつなぐと正解の文になる
   ・数学：問題文の式を実際に計算して、答え（a）と合っている
           方程式は、答えを代入すると左辺＝右辺になる
   ・データ表：同じ問題が2回入っていない

   使い方：
     node tools/verify.mjs     … チェックして結果を表示（1つでも問題があれば終了コード1）
   GitHub Actions でも、ビルドの前に毎回これを実行します。問題があると公開されません。
   =========================================================================== */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = path.join(ROOT, "src");
const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8];
const TRIES = 300; // 1レベルあたりの試行回数

/* ---- src/ を読み込んで評価する（画面は描かないので React は空の代役で足りる）---- */
async function loadApp() {
  const Babel = (await import("@babel/standalone")).default;
  const names = (await readdir(SRC_DIR)).filter(n => n.endsWith(".jsx") || n.endsWith(".js")).sort();
  let src = "";
  for (const n of names) src += (await readFile(path.join(SRC_DIR, n), "utf8")).replace(/\r\n/g, "\n") + "\n\n";
  const header = await readFile(path.join(SRC_DIR, names[0]), "utf8");
  const icons = ((header.match(/import \{([^}]*)\} from "lucide-react"/) || [])[1] || "")
    .split(",").map(s => s.trim()).filter(Boolean);
  src = src.replace(/^import .*$/gm, "").replace(/^export default /gm, "").replace(/\bimport\(/g, "__imp(");
  const code = Babel.transform(src, { presets: ["react"], filename: "rinogical.jsx" }).code;

  const React = { createElement: () => null, Fragment: "Fragment" };
  const hook = () => [undefined, () => {}];
  globalThis.window = globalThis.window || {};
  globalThis.localStorage = globalThis.localStorage || { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  globalThis.__imp = async () => { throw new Error("verify では外部モジュールを読まない"); };
  const fn = new Function("React", "useState", "useEffect", "useRef", ...icons,
    code + "\n;return (name) => eval(name);");
  return fn(React, hook, () => {}, () => ({ current: null }), ...icons.map(() => () => null));
}

/* ---- 数学の式を計算する（× ÷ ² ³ | | と、2x のような省略したかけ算に対応）---- */
const SUP = { "²": 2, "³": 3, "⁴": 4, "⁵": 5 };
function toJs(expr) {
  let s = expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
  s = s.replace(/\|([^|]+)\|/g, "Math.abs($1)");
  s = s.replace(/([a-z])([²³⁴⁵])/g, (m, v, p) => `(${v}**${SUP[p]})`);
  s = s.replace(/(\d+)([²³⁴⁵])/g, (m, d, p) => `(${d}**${SUP[p]})`);
  s = s.replace(/\)([²³⁴⁵])/g, (m, p) => `)**${SUP[p]}`);
  s = s.replace(/(\d)\s*([a-z(])/g, "$1*$2");
  s = s.replace(/\)\s*([a-z(\d])/g, ")*$1");
  return s;
}
function evalExpr(expr, vars = {}) {
  const js = toJs(expr);
  if (/[^\d\s+\-*/().a-zA-Z,]/.test(js.replace(/Math\.abs/g, ""))) throw new Error("計算できない記号: " + expr);
  // eslint-disable-next-line no-new-func
  return Function(...Object.keys(vars), `"use strict"; return (${js});`)(...Object.values(vars));
}
const near = (a, b) => Math.abs(Number(a) - Number(b)) < 1e-9;

/* 数学の問題文の形ごとに、答えを確かめる。確かめられない形は null（チェックしない） */
/* フェーズ5の単元は、問題に v（検算用の材料）を持たせてある。それを使って答えを計算し直す */
const piS = (k) => (k === 1 ? "π" : `${k}π`);
const lineS = (a) => (a === 1 ? "y=x" : a === -1 ? "y=-x" : `y=${a}x`);
const r2v = (x) => Math.round(x * 100) / 100;
const r1v = (x) => Math.round(x * 10) / 10;
const sum = (a) => a.reduce((s, x) => s + x, 0);
function expectFromV(v) {
  const sorted = (a) => a.slice().sort((x, y) => x - y);
  switch (v.t) {
    case "hirei_a": return v.y / v.x;
    case "hirei_y": return v.a * v.x;
    case "hanpi_a": return v.x * v.y;
    case "hanpi_y": return v.a / v.x;
    case "hirei_y2": return (v.y1 / v.x1) * v.x2;
    case "hanpi_y2": return (v.x1 * v.y1) / v.x2;
    case "graph_line": return lineS(v.a);
    case "graph_hyper": return `y=${v.a}/x`;
    case "mean": return sum(v.vals) / v.vals.length;
    case "median": { const s = sorted(v.vals), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }
    case "mode": { const c = {}; v.vals.forEach(x => (c[x] = (c[x] || 0) + 1)); const mx = Math.max(...Object.values(c)); const ms = Object.keys(c).filter(k => c[k] === mx); return ms.length === 1 ? Number(ms[0]) : NaN; }
    case "range": return Math.max(...v.vals) - Math.min(...v.vals);
    case "rel": return r2v(v.c / v.total);
    case "classmid": return (v.lo + v.hi) / 2;
    case "bars_count": return v.counts[v.i];
    case "bars_modeclass": { const mx = Math.max(...v.counts); if (v.counts.filter(c => c === mx).length !== 1) return NaN; const i = v.counts.indexOf(mx); return (v.edges[i] + v.edges[i + 1]) / 2; }
    case "bars_cum": return sum(v.counts.slice(0, v.i));
    case "bars_total": return sum(v.counts);
    case "prob": return r2v(v.k / v.n);
    case "vol_cuboid": return v.a * v.b * v.c;
    case "vol_cyl": return piS(v.r * v.r * v.h);
    case "vol_cone": { const k = v.r * v.r * v.h / 3; return Number.isInteger(k) ? piS(k) : NaN; }
    case "vol_pyr": { const k = v.base * v.h / 3; return Number.isInteger(k) ? k : NaN; }
    case "vol_sphere": { const k = 4 * v.r ** 3 / 3; return Number.isInteger(k) ? piS(k) : NaN; }
    case "surf_sphere": return piS(4 * v.r * v.r);
    case "surf_cyl": return piS(2 * v.r * v.r + 2 * v.r * v.h);
    case "surf_cube": return 6 * v.a * v.a;
    case "circ_len": return piS(2 * v.r);
    case "circ_area": return piS(v.r * v.r);
    case "arc": { const k = 2 * v.r * v.deg / 360; return Number.isInteger(k) ? piS(k) : NaN; }
    case "sector": { const k = v.r * v.r * v.deg / 360; return Number.isInteger(k) ? piS(k) : NaN; }
    case "deg_from_arc": return 360 * v.k / (2 * v.r);
    // 理科の計算（フェーズ5）
    case "density": return r1v(v.m / v.V);
    case "mass": return r1v(v.d * v.V);
    case "conc": return v.s / (v.s + v.w) * 100;
    case "sound": return v.s * v.sec;
    case "echo": return v.s * v.sec / 2;
    case "spring": return v.per * v.F;
    case "weight": return v.g / 100;
    case "speed": return v.d / v.sec;
    case "time": return v.d / v.s;
    default: throw new Error("知らない v.t: " + v.t);
  }
}
function checkMath(unit, p) {
  if (p.v) {
    const e = expectFromV(p.v);
    return typeof e === "number" ? near(e, p.a) : String(e) === String(p.a);
  }
  const q = String(p.q).trim();
  if (unit === "houtei") {
    const m = q.match(/^(.+?)\s*=\s*(.+?)\s*を解くと/);
    if (!m) return null;
    return near(evalExpr(m[1], { x: p.a }), evalExpr(m[2], { x: p.a }));
  }
  if (unit === "moji") {
    const m = q.match(/^(.+?)\s*のとき\s*(.+?)\s*の値/);
    if (!m) return null;
    const vars = {};
    for (const part of m[1].split(",")) {
      const mm = part.trim().match(/^([a-z])\s*=\s*(-?\d+)$/);
      if (!mm) return null;
      vars[mm[1]] = Number(mm[2]);
    }
    return near(evalExpr(m[2], vars), p.a);
  }
  if (unit === "seifu") {
    if (!/^[\d\s+\-−×÷()|²³⁴⁵]+$/.test(q)) return null;
    return near(evalExpr(q), p.a);
  }
  return null;
}

const textWidth = (x) => [...String(x)].reduce((w, ch) => w + (ch.charCodeAt(0) < 0x2000 ? 0.6 : 1), 0);

/* ---- 1問ぶんのチェック ---- */
function checkProblem(p, where, fails, opt = {}) {
  if (!p || p.a === undefined || p.a === null || p.a === "") { fails.push(`${where} 答え(a)が空`); return; }
  const ui = p.ui || "choice";
  if (ui === "choice") {
    const c = p.choices || [];
    if (c.length !== 4) fails.push(`${where} 選択肢が4つでない（${c.length}個）`);
    if (new Set(c.map(String)).size !== c.length) fails.push(`${where} 選択肢が重複 ${JSON.stringify([...c].map(String).sort())}`);
    if (c.filter(x => String(x) === String(p.a)).length !== 1) fails.push(`${where} 正解が選択肢にちょうど1つ入っていない ${JSON.stringify([...c].map(String).sort())}`);
    // 6文字＝全角6字ぶんの幅。英字・数字・記号（半角）は0.6字ぶんとして数える（"swimming" は 4.8字ぶん）
    if (p.type !== "number") for (const x of c) if (textWidth(x) > 6) fails.push(`${where} 選択肢が6文字をこえる「${x}」`);
  }
  if (ui === "arrange") {
    // 札（"My friends" のように空白入りの札もある）を何かの順にならべて、スペースでつなぐと正解になるか
    const tiles = (p.tiles || []).map(String);
    const target = String(p.a);
    const canBuild = (rest, built) => {
      if (rest.length === 0) return built === target;
      return rest.some((t, i) => {
        const next = built ? built + " " + t : t;
        return target.startsWith(next) && canBuild(rest.filter((_, j) => j !== i), next);
      });
    };
    if (!canBuild(tiles, "")) fails.push(`${where} 札をならべても正解の文にならない`);
  }
  if (p.mark != null && p.mark !== "") {
    const n = String(p.q).split(p.mark).length - 1;
    if (n !== 1) fails.push(`${where} 強調する言葉「${p.mark}」が問題文に${n}回出てくる（1回にする）`);
  }
  if (opt.mathUnit || p.v) { // 数学と、v（検算用の材料）を持つ理科などの計算問題
    try {
      const ok = checkMath(opt.mathUnit, p);
      if (ok === false) fails.push(`${where} 計算すると答えが合わない（a=${p.a}）`);
    } catch (e) { fails.push(`${where} 式を計算できない（${e.message}）`); }
  }
}

/* ---- データ表の重複チェック ---- */
function checkDuplicates(name, arr, keyOf, fails) {
  if (!Array.isArray(arr)) return;
  const seen = new Map();
  arr.forEach((d, i) => {
    const k = keyOf(d);
    if (seen.has(k)) fails.push(`${name}：${seen.get(k) + 1}番目と${i + 1}番目が同じ問題「${k}」`);
    else seen.set(k, i);
  });
}

/* ---- 本体 ---- */
const ev = await loadApp();
const get = (name) => { try { return ev(name); } catch { return undefined; } };
const fails = [];
const report = [];

// 数学：単元ごと（超基本＝genKihon、標準＝pool の全問）
const MATH_UNITS = get("MATH_UNITS");
/* バトル画面と同じ補い方：type が無ければ数値、選択肢が無ければ makeChoices（4択で確かめる） */
function asBattle(p) {
  p.type = p.type || "number";
  p.ui = "choice";
  if (!p.choices) p.choices = p.type === "number" ? get("makeChoices")(p.a) : [];
  return p;
}
/* 「この円の面積は？」のように文が同じでも、図の数字が違えば別の問題として数える */
const variantKey = (p) => `${p.q}|${p.fig ? JSON.stringify(p.fig) : ""}|${p.a}`;
/* 標準の目標数。フェーズ4の3単元は100通り、フェーズ5の単元は「1単元50問程度」 */
const STD_GOAL = { hirei: 50, heimen: 50, kukan: 50, data: 50 };
for (const key of get("MATH_UNIT_KEYS") || []) {
  const U = MATH_UNITS[key];
  const seen = new Set();
  for (const lv of LEVELS) for (let i = 0; i < TRIES; i++) {
    const p = asBattle(U.genKihon(lv));
    seen.add(variantKey(p));
    checkProblem(p, `数学/${U.name} Lv${lv}「${p.q}」`, fails, { mathUnit: key });
  }
  // 標準（型＋ランダムな数）：答えを検算し、100通り以上あることも確かめる（フェーズ4の目標）
  if (typeof U.genStd === "function") {
    const std = new Set();
    for (const lv of LEVELS) for (let i = 0; i < TRIES; i++) {
      const p = asBattle(U.genStd(lv));
      std.add(variantKey(p));
      checkProblem(p, `数学/${U.name} 標準 Lv${lv}「${p.q}」`, fails, { mathUnit: key });
    }
    const goal = STD_GOAL[key] || 100;
    if (std.size < goal) fails.push(`数学/${U.name}：標準の問題が${std.size}通りしかない（${goal}通り以上にする）`);
    report.push(`数学/${U.name}：標準（型＋数）${std.size}通り`);
  }
  (U.pool || []).forEach((p, i) => {
    const pp = asBattle({ ...p });
    checkProblem(pp, `数学/${U.name} 標準${i + 1}「${p.q}」`, fails, { mathUnit: key });
  });
  checkDuplicates(`数学/${U.name}の標準プール`, U.pool, d => d.q, fails);
  report.push(`数学/${U.name}：超基本 ${seen.size}通り＋標準 ${(U.pool || []).length}問`);
}

// 数学以外：問題をつくる関数をくり返し呼ぶ
const gens = [];
const SUBJECT_NAMES = { english: "英語", kokugo: "国語", rika: "理科", shakai: "社会" };
const ROOMS = get("SUBJECT_ROOMS") || {};
for (const [sk, R] of Object.entries(ROOMS)) {
  if (sk === "math") continue;
  for (const k of R.keys) gens.push([`${SUBJECT_NAMES[sk] || sk}/${R.units[k].name}`, R.units[k].gen]);
}
for (const [name, g] of gens) {
  if (typeof g !== "function") { fails.push(`${name}：問題をつくる関数が見つからない`); continue; }
  const seen = new Set();
  for (const lv of LEVELS) for (let i = 0; i < TRIES; i++) {
    const p = g(lv);
    seen.add(`${p.q}|${p.a}`);
    checkProblem(p, `${name} Lv${lv}「${p.q || p.a}」`, fails);
  }
  report.push(`${name}：${seen.size}通り`);
}

// データ表の重複
const tables = [
  ["KANJI_DATA", d => d.kaki], ["GOI_DATA", d => d.w], ["KIMARI_DATA", d => d.q],
  ["KOBUN_DATA", d => d.q || d.w], ["RIKA_DATA", d => d.q], ["SHAKAI_DATA", d => d.q],
  ["HIREI_TERMS", d => d.q], ["HEIMEN_TERMS", d => d.q], ["KUKAN_TERMS", d => d.q], ["DATA_TERMS", d => d.q],
  ["WH_DATA", d => d.q],
  ["DOUBUTSU_DATA", d => d.q], ["BUSSHITSU_DATA", d => d.q], ["HIKARI_DATA", d => d.q], ["DAICHI_DATA", d => d.q],
];
for (const [name, keyOf] of tables) checkDuplicates(name, get(name), keyOf, fails);

const uniq = [...new Set(fails)];
console.log("りのじかる 問題チェック\n" + report.map(r => "  " + r).join("\n"));
if (uniq.length) {
  console.log(`\n❌ ${uniq.length}件の問題が見つかりました：\n` + uniq.slice(0, 60).map(s => "  ・" + s).join("\n"));
  if (uniq.length > 60) console.log(`  …ほか${uniq.length - 60}件`);
  process.exit(1);
}
console.log("\n✅ すべての問題チェックに合格");

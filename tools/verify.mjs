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
function checkMath(unit, p) {
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

/* ---- 1問ぶんのチェック ---- */
function checkProblem(p, where, fails, opt = {}) {
  if (!p || p.a === undefined || p.a === null || p.a === "") { fails.push(`${where} 答え(a)が空`); return; }
  const ui = p.ui || "choice";
  if (ui === "choice") {
    const c = p.choices || [];
    if (c.length !== 4) fails.push(`${where} 選択肢が4つでない（${c.length}個）`);
    if (new Set(c.map(String)).size !== c.length) fails.push(`${where} 選択肢が重複 ${JSON.stringify([...c].map(String).sort())}`);
    if (c.filter(x => String(x) === String(p.a)).length !== 1) fails.push(`${where} 正解が選択肢にちょうど1つ入っていない ${JSON.stringify([...c].map(String).sort())}`);
    if (p.type !== "number") for (const x of c) if ([...String(x)].length > 6) fails.push(`${where} 選択肢が6文字をこえる「${x}」`);
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
  if (opt.mathUnit) {
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
for (const key of get("MATH_UNIT_KEYS") || []) {
  const U = MATH_UNITS[key];
  const seen = new Set();
  for (const lv of LEVELS) for (let i = 0; i < TRIES; i++) {
    const p = U.genKihon(lv);
    seen.add(p.q);
    p.type = "number";
    p.ui = "choice";
    p.choices = get("makeChoices")(p.a);
    checkProblem(p, `数学/${U.name} Lv${lv}「${p.q}」`, fails, { mathUnit: key });
  }
  (U.pool || []).forEach((p, i) => {
    const pp = { ...p, type: "number", ui: "choice", choices: get("makeChoices")(p.a) };
    checkProblem(pp, `数学/${U.name} 標準${i + 1}「${p.q}」`, fails, { mathUnit: key });
  });
  checkDuplicates(`数学/${U.name}の標準プール`, U.pool, d => d.q, fails);
  report.push(`数学/${U.name}：超基本 ${seen.size}通り＋標準 ${(U.pool || []).length}問`);
}

// 数学以外：問題をつくる関数をくり返し呼ぶ
const gens = [
  ["英語", get("genEnglishProblem")],
  ["理科", get("genRikaProblem")],
  ["社会", get("genShakaiProblem")],
];
const KU = get("KOKUGO_UNITS") || {};
for (const k of get("KOKUGO_UNIT_KEYS") || []) gens.push([`国語/${KU[k].name}`, KU[k].gen]);
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

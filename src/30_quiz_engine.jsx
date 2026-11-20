/* ================= 問題エンジン（正負の数）================= */
const rint = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const fmt = (n) => (n < 0 ? `(${n})` : `${n}`);

function genKihon(level) {
  const r = Math.min(5 + level * 2, 14);
  const a = rint(-r, r), b = rint(-r, r);
  const useMul = level >= 3 && Math.random() < 0.4;
  if (useMul) {
    const x = rint(-6, 6), y = rint(-6, 6);
    return { q: `${fmt(x)} × ${fmt(y)}`, a: x * y, kind: "超基本" };
  }
  const op = Math.random() < 0.5 ? "+" : "-";
  return { q: `${fmt(a)} ${op} ${fmt(b)}`, a: op === "+" ? a + b : a - b, kind: "超基本" };
}

const HYOJUN = [
  // --- 既存の10問 ---
  { q: "(-2) + (-5) + 3", a: -4 }, { q: "8 - 12 + (-4)", a: -8 },
  { q: "(-3) × 4", a: -12 }, { q: "(-6) × (-5)", a: 30 },
  { q: "(-18) ÷ 3", a: -6 }, { q: "20 ÷ (-4)", a: -5 },
  { q: "(-2)³", a: -8 }, { q: "-3²", a: -9 },
  { q: "|-7| + |-3|", a: 10 }, { q: "(-4) - (-9)", a: 5 },

  // --- 足し引き（9問） ---
  { q: "(-7) + (-8)", a: -15 }, { q: "(-15) + 6", a: -9 },
  { q: "12 + (-20)", a: -8 }, { q: "(-9) - (-4)", a: -5 },
  { q: "3 - 11 - (-5)", a: -3 }, { q: "(-6) + (-7) + 10", a: -3 },
  { q: "(-13) - 8", a: -21 }, { q: "5 - (-9) - 7", a: 7 },
  { q: "(-4) + 9 + (-12)", a: -7 },

  // --- かけ割り（9問） ---
  { q: "(-7) × 6", a: -42 }, { q: "(-8) × (-9)", a: 72 },
  { q: "(-48) ÷ 6", a: -8 }, { q: "(-54) ÷ (-9)", a: 6 },
  { q: "(-5) × 4 × (-3)", a: 60 }, { q: "36 ÷ (-12)", a: -3 },
  { q: "(-2) × (-3) × (-5)", a: -30 }, { q: "(-72) ÷ 8", a: -9 },
  { q: "(-6) × 7", a: -42 },

  // --- 累乗（8問） ---
  { q: "(-3)²", a: 9 }, { q: "(-4)²", a: 16 },
  { q: "-4²", a: -16 }, { q: "(-2)⁴", a: 16 },
  { q: "-2³", a: -8 }, { q: "(-5)²", a: 25 },
  { q: "(-1)⁵", a: -1 }, { q: "-3³", a: -27 },

  // --- 絶対値（8問） ---
  { q: "|-12|", a: 12 }, { q: "|-8| - |5|", a: 3 },
  { q: "|3 - 10|", a: 7 }, { q: "|-6| × (-2)", a: -12 },
  { q: "|-15| ÷ (-3)", a: -5 }, { q: "-|-9|", a: -9 },
  { q: "|-4| + |-11|", a: 15 }, { q: "|2 - 9| - |-3|", a: 4 },

  // --- かっこ外し（8問） ---
  { q: "-(-6) + (-4)", a: 2 }, { q: "8 - (3 - 10)", a: 15 },
  { q: "(-5) - (2 - 8)", a: 1 }, { q: "-(7 - 12) - 3", a: 2 },
  { q: "(-4) + (-(-9))", a: 5 }, { q: "10 - (-(-6))", a: 4 },
  { q: "-(2 + (-9))", a: 7 }, { q: "(1 - 7) - (-(-2))", a: -8 },

  // --- 四則混合（8問） ---
  { q: "(-2) × 3 + 5", a: -1 }, { q: "12 ÷ (-4) - 6", a: -9 },
  { q: "(-3)² - 4 × 5", a: -11 }, { q: "8 + (-2) × (-4)", a: 16 },
  { q: "(-10) ÷ 2 + (-3) × 2", a: -11 }, { q: "(-6) + 4² ÷ (-8)", a: -8 },
  { q: "5 × (-2) - (-3) × 4", a: 2 }, { q: "(-1)³ × 7 + 9", a: 2 },
];

/* ---- 数学の「型＋ランダムな数」で標準問題をつくる共通部品（フェーズ4）----
   term(係数, 文字, 先頭か)：2x / -x / x のような項の表示。先頭以外は " + 2x" / " - x" の形。
   cst(定数)：" + 5" / " - 3"（0 のときは空）。
   nz(lo, hi)：0 をのぞいた整数。 */
function term(k, v, first) {
  const abs = Math.abs(k);
  const body = (abs === 1 ? "" : String(abs)) + v;
  if (first) return (k < 0 ? "-" : "") + body;
  return (k < 0 ? " - " : " + ") + body;
}
function cst(n) { return n === 0 ? "" : (n > 0 ? ` + ${n}` : ` - ${-n}`); }
function nz(lo, hi) { let n = 0; while (n === 0) n = rint(lo, hi); return n; }
function pickOne(arr) { return arr[rint(0, arr.length - 1)]; }

/* フェーズ5の数学（比例・データ・図形）で使う部品
   piStr(k)：円周率をふくむ答えの表し方（1 → "π"、6 → "6π"）。tools/verify.mjs も同じ表し方で検算する。
   choices4(答え, 候補)：答え＋候補から重ならない3つで4択をつくる（候補が足りなければ数を足して埋める）。 */
function piStr(k) { return k === 1 ? "π" : `${k}π`; }
function choices4(ans, cands) {
  const out = [ans];
  for (const c of cands) { if (out.length >= 4) break; if (c !== undefined && c !== null && !out.some(o => String(o) === String(c))) out.push(c); }
  let g = 1;
  while (out.length < 4 && typeof ans === "number") { const c = ans + g * 2; if (!out.includes(c)) out.push(c); g++; }
  return shuffle(out);
}

/* 正負の数の標準：型を7つ持ち、数はその場で決める。4回に1回は固定の HYOJUN からも出す。
   答えはすべて整数（わり算は割り切れる数だけ作る）。tools/verify.mjs が式を計算して検算する。 */
function genStd_seifu(level) {
  if (Math.random() < 0.25) return genFromPool(HYOJUN);
  const t = rint(1, 7);
  let q, a;
  if (t === 1) {        // 3つの数のたし算・ひき算
    const x = nz(-15, 15), y = nz(-15, 15), z = nz(-15, 15);
    const o1 = pickOne(["+", "-"]), o2 = pickOne(["+", "-"]);
    q = `${fmt(x)} ${o1} ${fmt(y)} ${o2} ${fmt(z)}`;
    a = (o1 === "+" ? x + y : x - y); a = (o2 === "+" ? a + z : a - z);
  } else if (t === 2) { // 2つの数のかけ算（どちらかは負）
    const x = nz(-9, 9), y = rint(2, 9) * (x > 0 ? -1 : pickOne([1, -1]));
    q = `${fmt(x)} × ${fmt(y)}`; a = x * y;
  } else if (t === 3) { // わり算（割り切れる）
    const d = rint(2, 9) * pickOne([1, -1]), ans = nz(-9, 9);
    q = `${fmt(d * ans)} ÷ ${fmt(d)}`; a = ans;
  } else if (t === 4) { // 3つの数のかけ算
    const x = nz(-5, 5), y = nz(-5, 5), z = nz(-4, 4);
    q = `${fmt(x)} × ${fmt(y)} × ${fmt(z)}`; a = x * y * z;
  } else if (t === 5) { // 累乗：(-n)² / -n² / (-n)³ / -n³
    const f = rint(1, 4), n = f <= 2 ? rint(2, 6) : rint(2, 4);
    if (f === 1) { q = `(-${n})²`; a = n * n; }
    else if (f === 2) { q = `-${n}²`; a = -n * n; }
    else if (f === 3) { q = `(-${n})³`; a = -n * n * n; }
    else { q = `-${n}³`; a = -n * n * n; }
  } else if (t === 6) { // 絶対値
    const x = nz(-12, 12), y = nz(-12, 12), f = rint(1, 3);
    if (f === 1) { q = `|${x}| + |${y}|`; a = Math.abs(x) + Math.abs(y); }
    else if (f === 2) { q = `|${x}| - |${y}|`; a = Math.abs(x) - Math.abs(y); }
    else { q = `|${x} - ${fmt(y)}|`; a = Math.abs(x - y); }
  } else {              // 四則の混じった計算（かけ算を先に）
    const x = nz(-6, 6), y = nz(-6, 6), z = nz(-12, 12);
    if (Math.random() < 0.5) { q = `${fmt(x)} × ${fmt(y)} + ${fmt(z)}`; a = x * y + z; }
    else { q = `${fmt(z)} - ${fmt(x)} × ${fmt(y)}`; a = z - x * y; }
  }
  return { q, a, kind: "標準" };
}
const genHyojun = () => ({ ...HYOJUN[rint(0, HYOJUN.length - 1)], kind: "標準" });

function shuffle(arr) { return arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(v => v[1]); }
function makeChoices(answer) {
  const set = new Set([answer]);
  const cands = [-answer, answer + 1, answer - 1, answer + 2, answer - 2, answer + (answer === 0 ? 3 : 0)];
  for (const c of shuffle(cands)) { if (set.size >= 4) break; if (!set.has(c)) set.add(c); }
  let g = 1; while (set.size < 4) { set.add(answer + g * 3); set.add(answer - g * 3); g++; }
  return shuffle([...set].slice(0, 4));
}

/* 回答方式の決定：答えが整数の問題だけ「入力」にできる（分数・小数・式は4択）。
   レベルが上がるほど入力の比率を上げる（Lv1-2=4択のみ / Lv3-4=約30% / Lv5+=約50%）。 */
function pickAnswerMode(level, ans) {
  if (!Number.isInteger(ans)) return "choice";
  const p = level >= 5 ? 0.5 : level >= 3 ? 0.3 : 0;
  return Math.random() < p ? "input" : "choice";
}

/* 入力をやさしく解釈：全角数字・全角マイナス・空白を吸収して整数に */
function parseInput(s) {
  if (s == null) return null;
  let t = String(s).trim()
    .replace(/[０-９]/g, d => "０１２３４５６７８９".indexOf(d).toString())
    .replace(/[ー－−—‐]/g, "-")
    .replace(/[＋]/g, "+")
    .replace(/\s/g, "");
  if (t === "" || t === "-" || t === "+") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

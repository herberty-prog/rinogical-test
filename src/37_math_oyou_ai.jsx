/* ================= 数学：フェーズ5の単元の「応用」（AIが文章題をつくる）=================
   比例と反比例・平面図形・空間図形・データの活用の Lv5 以降で、半分の確率で出す（バトル側の決まり）。
   ・AIには「問題文」と「計算の材料（v）」だけを作らせ、答えはアプリが v から計算する。
     AIは計算をまちがえることがあるので、AIの答えはそもそも受け取らない。
   ・v の数が問題文の中にちゃんと書かれているかも確かめる（文と材料が食いちがう問題をはじく）。
   ・答えが整数（またはπの整数倍、小数第2位まで）にならない材料、範囲外の数はすべて不合格にして、
     バトル側でふつうの標準問題に切りかえる（throw すると genFromPool にもどる）。
   ・tools/verify.mjs の expectFromV と同じ計算。どちらかを変えたらもう片方も合わせる。
   ・正負の数・文字式・方程式の応用も、下の mathEval / solveLinear で同じ考え方（AIは式だけ、答えはアプリ）にしてある。 */
const OYOU_V = {
  // 比例・反比例（文章題：針金の長さと重さ、水そうに水を入れる時間、歯車、作業の人数と日数 など）
  hirei_y2: { keys: ["x1", "y1", "x2"], ans: v => v.y1 / v.x1 * v.x2, form: "int" },
  hanpi_y2: { keys: ["x1", "y1", "x2"], ans: v => v.x1 * v.y1 / v.x2, form: "int" },
  hirei_a: { keys: ["x", "y"], ans: v => v.y / v.x, form: "int" },
  hanpi_a: { keys: ["x", "y"], ans: v => v.x * v.y, form: "int" },
  // 平面図形（円・おうぎ形。答えは「〇π」）
  circ_len: { keys: ["r"], ans: v => 2 * v.r, form: "pi" },
  circ_area: { keys: ["r"], ans: v => v.r * v.r, form: "pi" },
  arc: { keys: ["r", "deg"], ans: v => 2 * v.r * v.deg / 360, form: "pi" },
  sector: { keys: ["r", "deg"], ans: v => v.r * v.r * v.deg / 360, form: "pi" },
  deg_from_arc: { keys: ["r", "k"], ans: v => 360 * v.k / (2 * v.r), form: "int" },
  // 空間図形（体積・表面積）
  vol_cuboid: { keys: ["a", "b", "c"], ans: v => v.a * v.b * v.c, form: "int" },
  vol_cyl: { keys: ["r", "h"], ans: v => v.r * v.r * v.h, form: "pi" },
  vol_cone: { keys: ["r", "h"], ans: v => v.r * v.r * v.h / 3, form: "pi" },
  vol_pyr: { keys: ["base", "h"], ans: v => v.base * v.h / 3, form: "int" },
  vol_sphere: { keys: ["r"], ans: v => 4 * v.r ** 3 / 3, form: "pi" },
  surf_cube: { keys: ["a"], ans: v => 6 * v.a * v.a, form: "int" },
  surf_cyl: { keys: ["r", "h"], ans: v => 2 * v.r * v.r + 2 * v.r * v.h, form: "pi" },
  surf_sphere: { keys: ["r"], ans: v => 4 * v.r * v.r, form: "pi" },
  // データの活用
  mean: { keys: [], list: "vals", ans: v => v.vals.reduce((s, x) => s + x, 0) / v.vals.length, form: "int" },
  median: { keys: [], list: "vals", ans: v => { const s = v.vals.slice().sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }, form: "int" },
  range: { keys: [], list: "vals", ans: v => Math.max(...v.vals) - Math.min(...v.vals), form: "int" },
  rel: { keys: ["c", "total"], ans: v => v.c / v.total, form: "dec" },
  prob: { keys: ["k", "n"], ans: v => v.k / v.n, form: "dec" },
};

/* v から答えを計算して、合格なら { a, form } を返す。だめなら null */
function oyouAnswer(v, allowed) {
  if (v && OYOU_FORMULA[v.t]) return allowed.includes(v.t) ? oyouFormulaAnswer(v) : null;
  const spec = v && OYOU_V[v.t];
  if (!spec || !allowed.includes(v.t)) return null;
  const nums = spec.keys.map(k => v[k]);
  if (nums.some(x => typeof x !== "number" || !Number.isFinite(x) || x <= 0 || x > 2000)) return null;
  if (spec.list) {
    const L = v[spec.list];
    if (!Array.isArray(L) || L.length < 3 || L.length > 12 || L.some(x => typeof x !== "number" || !Number.isInteger(x) || x < 0 || x > 1000)) return null;
  }
  const a = spec.ans(v);
  if (!Number.isFinite(a) || a <= 0) return null;
  if (spec.form === "dec") { if (a >= 1 || Math.abs(a * 100 - Math.round(a * 100)) > 1e-9) return null; return { a: Math.round(a * 100) / 100, form: "dec" }; }
  if (!Number.isInteger(a) && Math.abs(a - Math.round(a)) > 1e-9) return null;
  return { a: Math.round(a), form: spec.form };
}

/* 問題文に v の数がすべて書かれているか（「12」が「120」の一部として見つかるのは不可） */
function oyouNumbersInText(q, v) {
  const found = (String(q).normalize("NFKC").match(/\d+(\.\d+)?/g) || []).map(Number);
  if (OYOU_FORMULA[v.t]) { // 式の中の数（と代入する数）が、すべて問題文に書かれているか。符号は文章で書かれることがあるので絶対値で見る
    const nums = formulaNumbers(v.t === "eq" ? v.eq : v.expr).concat(v.t === "subst" ? Object.values(v.vars || {}).map(Math.abs) : []);
    return nums.every(n => found.includes(n));
  }
  const spec = OYOU_V[v.t];
  const nums = spec.keys.map(k => v[k]).concat(spec.list ? v[spec.list] : []);
  // deg_from_arc の k は「6π」のように π つきで書かれる。数字の部分だけで見る
  return nums.every(n => found.includes(n));
}

/* AIに文章題を1問つくらせる。allowed＝その単元で使ってよい v の種類 */
async function genOyouV(level, sys, allowed) {
  const txt = await callClaude([{ role: "user", content: `レベル${level}相当の応用問題を1問。` }], sys);
  const obj = JSON.parse(String(txt).replace(/```json|```/g, "").trim());
  const q = typeof obj.q === "string" ? obj.q.trim() : "";
  if (!q || q.length > 120) throw new Error("bad q");
  const v = obj.v || {};
  const r = oyouAnswer(v, allowed);
  if (!r || !oyouNumbersInText(q, v)) throw new Error("bad v");
  if (r.form === "pi") {
    return { q, a: piStr(r.a), type: "text", ui: "choice", choices: piChoices(r.a, [r.a * 2, r.a + 2, Math.max(1, r.a - 2), r.a * 3]),
      kind: "応用", text: true, v };
  }
  if (r.form === "dec") {
    const ch = choices4(r.a, [Math.round((1 - r.a) * 100) / 100, Math.round((r.a + 0.1) * 100) / 100, Math.round(Math.max(0.01, r.a - 0.1) * 100) / 100, Math.round((r.a + 0.2) * 100) / 100].filter(x => x > 0 && x < 1));
    return { q, a: r.a, type: "number", ui: "choice", choices: ch, kind: "応用", text: true, v };
  }
  // 正負の数・文字式・方程式：答えが負の数のこともあるので、ふつうの数学のダミー（符号ちがいなど）を使う
  if (r.form === "intneg") return { q, a: r.a, type: "number", ui: "choice", choices: makeChoices(r.a), kind: "応用", text: true, v };
  // 文章題なので、ダミーも正の数（「−105g」のような答えはありえないので入れない）
  const step = Math.max(1, Math.round(r.a / 10));
  const ch = choices4(r.a, [r.a + step, r.a - step, r.a * 2, Math.round(r.a / 2), r.a + 2 * step, r.a - 2 * step].filter(x => x > 0 && x !== r.a));
  return { q, a: r.a, type: "number", ui: "choice", choices: ch, kind: "応用", text: true, v };
}

/* ---------- 正負の数・文字式・方程式の応用（2026-11-21〜）----------
   AIには式（expr / eq）と、代入する数（vars）を書かせ、アプリが式を計算して答えを出す。
   expr：「(-3)×4+5」のような計算式 → 答え＝その値（整数）
   subst：expr に文字（x, a など）をふくむ式、vars に代入する数 → 答え＝式の値（整数）
   eq：「3x+5=20」のような1次方程式（文字は1つ）→ 答え＝解（整数）。1次でない式・解が1つに決まらない式ははじく */
const OYOU_FORMULA = { expr: true, subst: true, eq: true };

/* 分数のまま正確に計算する（0.1+0.2 のような誤差を出さない）。{ n: 分子, d: 分母 } */
const frGcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
function fr(n, d = 1) {
  if (d === 0) throw new Error("÷0");
  if (d < 0) { n = -n; d = -d; }
  const g = frGcd(n, d); n /= g; d /= g;
  if (Math.abs(n) > 1e12 || d > 1e9) throw new Error("大きすぎる");
  return { n, d };
}
const frAdd = (a, b) => fr(a.n * b.d + b.n * a.d, a.d * b.d);
const frSub = (a, b) => fr(a.n * b.d - b.n * a.d, a.d * b.d);
const frMul = (a, b) => fr(a.n * b.n, a.d * b.d);
const frDiv = (a, b) => fr(a.n * b.d, a.d * b.n);
function frPow(a, k) { if (!Number.isInteger(k) || k < 0 || k > 6) throw new Error("指数"); let r = fr(1); for (let i = 0; i < k; i++) r = frMul(r, a); return r; }

/* 式を字句に分ける。× ÷ − （）全角数字なども読む。使える文字は a〜z の1文字ずつ */
function mathTokens(src) {
  // ² ⁴ などの右上の小さな数字は NFKC でふつうの数字に変わってしまうので、先に ^2 ^4 に直す
  const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const s = String(src).replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, m => "^" + [...m].map(c => SUP.indexOf(c)).join("")).normalize("NFKC").replace(/[−‐‑–—ー]/g, "-").replace(/×|✕/g, "*").replace(/÷/g, "/").replace(/\s+/g, "");
  const out = []; let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) { let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++; const t = s.slice(i, j); if (!/^\d+(\.\d+)?$/.test(t)) throw new Error("数"); out.push({ k: "num", v: t }); i = j; continue; }
    if (/[a-z]/.test(c)) { out.push({ k: "var", v: c }); i++; continue; }
    if ("+-*/^()=".includes(c)) { out.push({ k: c }); i++; continue; }
    throw new Error("使えない文字: " + c);
  }
  return out;
}
const decToFr = (t) => { const [a, b = ""] = t.split("."); return fr(Number(a + b), 10 ** b.length); };

/* 式を計算する。vars＝文字の値（{x: 3}）。文字どうし・数と文字のあいだの × は省略してよい（3x, 2ab, 2(x+1)）。
   省略した × は ÷ より先に計算する（6÷2x ＝ 6÷(2x)）。累乗は符号より先（-3² ＝ -(3²)） */
function mathEval(src, vars = {}) {
  const tk = mathTokens(src); let p = 0;
  const peek = () => tk[p] && tk[p].k;
  const atomStart = () => ["num", "var", "("].includes(peek());
  function atom() {
    const t = tk[p++];
    if (!t) throw new Error("式が途中で終わっている");
    if (t.k === "num") return decToFr(t.v);
    if (t.k === "var") { if (!(t.v in vars)) throw new Error("値のない文字: " + t.v); return fr(vars[t.v]); }
    if (t.k === "(") { const v = sum(); if (peek() !== ")") throw new Error(")"); p++; return v; }
    throw new Error("記号の位置");
  }
  function power() {
    let b = atom();
    while (peek() === "^") { p++; const e = unary(); if (e.d !== 1) throw new Error("指数"); b = frPow(b, e.n); }
    return b;
  }
  function unary() { if (peek() === "-") { p++; return frMul(fr(-1), unary()); } if (peek() === "+") { p++; return unary(); } return power(); }
  function factor() { let v = unary(); while (atomStart()) v = frMul(v, power()); return v; }
  function term() { let v = factor(); while (peek() === "*" || peek() === "/") { const op = tk[p++].k; const r = factor(); v = op === "*" ? frMul(v, r) : frDiv(v, r); } return v; }
  function sum() { let v = term(); while (peek() === "+" || peek() === "-") { const op = tk[p++].k; const r = term(); v = op === "+" ? frAdd(v, r) : frSub(v, r); } return v; }
  const v = sum();
  if (p !== tk.length) throw new Error("式のあとに余分なもの");
  return v;
}
/* 式の中に書かれている数（絶対値）。問題文に全部あるかを確かめるのに使う */
function formulaNumbers(src) { return mathTokens(src).filter(t => t.k === "num").map(t => Number(t.v)); }
const formulaVars = (src) => [...new Set(mathTokens(src).filter(t => t.k === "var").map(t => t.v))];

/* 1次方程式を解く（文字は1つ）。左辺−右辺を f(x) として、f が1次（傾きが一定で0でない）なら解は −f(0)/傾き */
function solveLinear(eq) {
  const sides = String(eq).split("=");
  if (sides.length !== 2 || !sides[0].trim() || !sides[1].trim()) throw new Error("＝が1つの式ではない");
  const vs = formulaVars(eq);
  if (vs.length !== 1) throw new Error("文字は1つだけ");
  const x = vs[0];
  const f = (n) => frSub(mathEval(sides[0], { [x]: n }), mathEval(sides[1], { [x]: n }));
  const f0 = f(0), m = frSub(f(1), f0);
  if (m.n === 0) throw new Error("解が1つに決まらない");
  for (const k of [2, 3, -5]) { const fk = frSub(f(k), f0), want = frMul(m, fr(k)); if (fk.n !== want.n || fk.d !== want.d) throw new Error("1次方程式ではない"); }
  return frDiv(frMul(fr(-1), f0), m);
}

/* expr / subst / eq の答え。整数（負の数も可・絶対値10000まで）だけ合格 */
function oyouFormulaAnswer(v) {
  try {
    let r;
    if (v.t === "expr") {
      if (typeof v.expr !== "string" || v.expr.length > 60 || formulaVars(v.expr).length) return null;
      r = mathEval(v.expr);
    } else if (v.t === "subst") {
      if (typeof v.expr !== "string" || v.expr.length > 60 || !v.vars || typeof v.vars !== "object") return null;
      const names = formulaVars(v.expr);
      if (!names.length || names.some(n => !Number.isInteger(v.vars[n]) || Math.abs(v.vars[n]) > 10000)) return null;
      r = mathEval(v.expr, v.vars);
    } else {
      if (typeof v.eq !== "string" || v.eq.length > 60) return null;
      r = solveLinear(v.eq);
    }
    if (r.d !== 1 || Math.abs(r.n) > 10000) return null;
    return { a: r.n, form: "intneg" };
  } catch (e) { return null; }
}

/* AIへの指示。共通の決まり＋単元ごとの材料の説明 */
const oyouSys = (unit, types) =>
  `あなたは中学1年生（東京書籍・${unit}）の数学問題を作る出題者です。` +
  "身近な場面の、少し考える文章題を1問だけ作ってください。答えは書かないでください（アプリが計算します）。" +
  "かわりに、答えを計算するための材料 v を必ずつけてください。v の数はすべて問題文の中に数字で書くこと。" +
  "数はすべて正の数。答えが整数（または π の整数倍）になる数にすること。問題文は80文字以内。" +
  "出力はJSONのみ。前置き・マークダウン・コードフェンス禁止。" +
  `フォーマット: {"q":"問題文","v":{"t":"種類", ...材料}}。使える種類：${types}`;

const OYOU_HIREI_SYS = oyouSys("比例と反比例",
  "hirei_y2（yはxに比例。x1のときy1、x2のときのyを聞く。材料 x1,y1,x2）／" +
  "hanpi_y2（yはxに反比例。x1のときy1、x2のときのyを聞く。材料 x1,y1,x2。例：歯車の歯数と回転数、人数と日数）／" +
  "hirei_a（比例定数を聞く。材料 x,y）／hanpi_a（反比例の比例定数を聞く。材料 x,y）。" +
  '例：{"q":"針金4mの重さが60gのとき、同じ針金7mの重さは何g？","v":{"t":"hirei_y2","x1":4,"y1":60,"x2":7}}');
const OYOU_HEIMEN_SYS = oyouSys("平面図形・おうぎ形",
  "circ_len（円周。材料 r）／circ_area（円の面積。材料 r）／arc（おうぎ形の弧の長さ。材料 r,deg）／" +
  "sector（おうぎ形の面積。材料 r,deg）／deg_from_arc（弧の長さkπから中心角を聞く。材料 r,k）。" +
  "長さ・面積は「〇πcm」の形で答える問題にする。" +
  '例：{"q":"半径6cm、中心角120°のおうぎ形のピザの、ふちの長さ（弧の長さ）は何cm？","v":{"t":"arc","r":6,"deg":120}}');
const OYOU_KUKAN_SYS = oyouSys("空間図形",
  "vol_cuboid（直方体の体積。材料 a,b,c）／vol_cyl（円柱の体積。材料 r,h）／vol_cone（円錐の体積。材料 r,h）／" +
  "vol_pyr（角錐の体積。材料 base＝底面積,h）／vol_sphere（球の体積。材料 r）／surf_cube（立方体の表面積。材料 a）／" +
  "surf_cyl（円柱の表面積。材料 r,h）／surf_sphere（球の表面積。材料 r）。円周率をふくむ答えは「〇π」の形。" +
  '例：{"q":"底面の半径3cm、高さ8cmの円柱の形をした缶の体積は何cm³？","v":{"t":"vol_cyl","r":3,"h":8}}');
const OYOU_DATA_SYS = oyouSys("データの活用",
  "mean（平均値。材料 vals＝整数の配列3〜8個。平均が整数になること）／median（中央値。材料 vals）／" +
  "range（範囲。材料 vals）／rel（相対度数。材料 c＝度数, total＝合計。小数第2位までで割り切れること）／" +
  "prob（多数回の実験から確率を求める。材料 k＝回数, n＝試行回数。小数第2位までで割り切れること）。" +
  '例：{"q":"5人の握力は 24、30、27、33、21 kg。平均値は何kg？","v":{"t":"mean","vals":[24,30,27,33,21]}}');

/* 正負の数・文字式・方程式の指示（32 の genOyou から使う）。oyouSys は「数はすべて正の数」なので使わず、別に書く */
const oyouFormulaSys = (unit, what, fmt, ex) =>
  `あなたは中学1年生（東京書籍・${unit}）の数学問題を作る出題者です。` +
  `${what}を1問だけ作ってください。答えは書かないでください（アプリが計算します）。` +
  "かわりに、答えを計算するための式を v に必ずつけてください。式の中の数は、すべて問題文の中に数字で書くこと。" +
  "掛け算は ×、割り算は ÷、マイナスは - で書く。問題文は80文字以内。" +
  "出力はJSONのみ。前置き・マークダウン・コードフェンス禁止。" +
  `フォーマット: ${fmt}。例：${ex}`;
const OYOU_SEIFU_SYS = oyouFormulaSys("正負の数",
  "正負の数を使う、少し考える応用問題（気温の変化、得点の合計、基準との差など）。答えが整数になること",
  '{"q":"問題文","v":{"t":"expr","expr":"答えを求める式"}}',
  '{"q":"朝の気温は-3℃で、昼までに8℃上がり、夜までに6℃下がった。夜の気温は何℃？","v":{"t":"expr","expr":"-3+8-6"}}');
const OYOU_MOJI_SYS = oyouFormulaSys("文字式／式の値",
  "x や a に数を代入して値を求める、少し考える文章題。答えが整数になること",
  '{"q":"問題文","v":{"t":"subst","expr":"文字をふくむ式","vars":{"文字":代入する整数}}}',
  '{"q":"1個x円のパンを3個と、120円のジュースを買う。x=150のときの代金は何円？","v":{"t":"subst","expr":"3x+120","vars":{"x":150}}}');
const OYOU_HOUTEI_SYS = oyouFormulaSys("1次方程式",
  "文章から1次方程式を立てて解く文章題。求める数（解）が1つの整数になること",
  '{"q":"問題文","v":{"t":"eq","eq":"xを使った1次方程式"}}',
  '{"q":"ある数の3倍に5を加えると20になる。ある数はいくつ？","v":{"t":"eq","eq":"3x+5=20"}}');

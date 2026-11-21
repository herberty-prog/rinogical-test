/* ================= 数学：フェーズ5の単元の「応用」（AIが文章題をつくる）=================
   比例と反比例・平面図形・空間図形・データの活用の Lv5 以降で、半分の確率で出す（バトル側の決まり）。
   ・AIには「問題文」と「計算の材料（v）」だけを作らせ、答えはアプリが v から計算する。
     AIは計算をまちがえることがあるので、AIの答えはそもそも受け取らない。
   ・v の数が問題文の中にちゃんと書かれているかも確かめる（文と材料が食いちがう問題をはじく）。
   ・答えが整数（またはπの整数倍、小数第2位まで）にならない材料、範囲外の数はすべて不合格にして、
     バトル側でふつうの標準問題に切りかえる（throw すると genFromPool にもどる）。
   ・tools/verify.mjs の expectFromV と同じ計算。どちらかを変えたらもう片方も合わせる。 */
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
  const spec = OYOU_V[v.t];
  const nums = spec.keys.map(k => v[k]).concat(spec.list ? v[spec.list] : []);
  const found = (String(q).normalize("NFKC").match(/\d+(\.\d+)?/g) || []).map(Number);
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
  // 文章題なので、ダミーも正の数（「−105g」のような答えはありえないので入れない）
  const step = Math.max(1, Math.round(r.a / 10));
  const ch = choices4(r.a, [r.a + step, r.a - step, r.a * 2, Math.round(r.a / 2), r.a + 2 * step, r.a - 2 * step].filter(x => x > 0 && x !== r.a));
  return { q, a: r.a, type: "number", ui: "choice", choices: ch, kind: "応用", text: true, v };
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

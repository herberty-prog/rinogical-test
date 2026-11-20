/* ================= 数学：空間図形（フェーズ5）=================
   ・図（見取図）つきで体積・表面積を求める。円周率をふくむ答えは「36π」の形（単位は問題文に書く）。
   ・超基本（Lv1-2）：直方体・立方体・円柱の体積、立体の面・辺・頂点の数、回転体
   ・標準（Lv3〜）：角錐・円錐・球の体積、円柱・立方体・球の表面積、用語
   ・角錐・円錐は「×1/3」で割り切れる数だけ使う。v（検算用の材料）を持たせ、tools/verify.mjs が計算し直す。 */
const KUKAN_TERMS = [
  { q: "三角柱の面の数は？", a: "5", ng: ["3", "6", "9"], why: "三角柱は、三角形2つと長方形3つで5面。" },
  { q: "三角柱の辺の数は？", a: "9", ng: ["6", "5", "12"], why: "上の三角形3本＋下の三角形3本＋横の3本で9本。" },
  { q: "三角柱の頂点の数は？", a: "6", ng: ["5", "9", "3"], why: "上の三角形に3つ、下の三角形に3つで6つ。" },
  { q: "四角錐の面の数は？", a: "5", ng: ["4", "6", "8"], why: "底の四角形1つと、側面の三角形4つで5面。" },
  { q: "立方体の辺の数は？", a: "12", ng: ["6", "8", "24"], why: "上4本・下4本・たて4本で12本。" },
  { q: "正多面体は、全部で何種類ある？", a: "5種類", ng: ["4種類", "6種類", "無数"], why: "正四面体・正六面体・正八面体・正十二面体・正二十面体の5種類だけ。" },
  { q: "長方形を、1辺を軸に1回転させてできる立体は？", a: "円柱", ng: ["円錐", "球", "角柱"], why: "長方形をくるっと回すと円柱になるよ。" },
  { q: "直角三角形を、直角をはさむ1辺を軸に1回転させてできる立体は？", a: "円錐", ng: ["円柱", "球", "角錐"], why: "直角三角形を回すと、とんがった円錐になるよ。" },
  { q: "半円を、直径を軸に1回転させてできる立体は？", a: "球", ng: ["円柱", "円錐", "半球"], why: "半円を直径のまわりに回すと球になるよ。" },
  { q: "立体を真上から見た図を何という？", a: "平面図", ng: ["立面図", "見取図", "展開図"], why: "真上から見た図が平面図、正面から見た図が立面図。" },
  { q: "立体を正面から見た図を何という？", a: "立面図", ng: ["平面図", "見取図", "展開図"], why: "正面から見た図が立面図、真上から見た図が平面図。" },
  { q: "角錐の体積は、同じ底面・高さの角柱の何倍？", a: "1/3倍", ng: ["1/2倍", "2倍", "3倍"], why: "錐（すい）の体積は柱の1/3。だから「×1/3」をつけるよ。" },
];

function kukanTerm() {
  const d = pickOne(KUKAN_TERMS);
  return { q: d.q, a: d.a, type: "text", ui: "choice", choices: shuffle([d.a].concat(d.ng)), kind: "用語", why: d.why, text: true };
}
/* π をふくむ答えの4択。まちがえやすい値（alts）が重なって足りないときは、近い数で埋める */
const piChoices = (k, alts) => choices4(piStr(k), alts.concat([k * 2, k + 1, k + 2, k * 3, k + 4])
  .filter(x => Number.isInteger(x) && x > 0 && x !== k).map(piStr));

function genKihon_kukan(level) {
  const t = rint(1, 4);
  if (t === 1) { // 直方体の体積
    const a = rint(2, 9), b = rint(2, 9), c = rint(2, 9);
    return { q: `この直方体の体積は何cm³？`, a: a * b * c, kind: "超基本", text: true,
      fig: { type: "solid", kind: "cuboid", labels: { w: `${a}cm`, h: `${c}cm`, d: `${b}cm` } }, v: { t: "vol_cuboid", a, b, c } };
  }
  if (t === 2) { // 立方体の体積
    const a = rint(2, 9);
    return { q: `1辺が${a}cmの立方体の体積は何cm³？`, a: a * a * a, kind: "超基本", text: true,
      fig: { type: "solid", kind: "cube", labels: { w: `${a}cm` } }, v: { t: "vol_cuboid", a, b: a, c: a } };
  }
  if (t === 3) { // 円柱の体積
    const r = rint(1, 6), h = rint(2, 10), k = r * r * h;
    return { q: "この円柱の体積は何cm³？", a: piStr(k), type: "text", ui: "choice", choices: piChoices(k, [2 * r * h, r * h, k * 2, k + r * r]), kind: "超基本", text: true,
      fig: { type: "solid", kind: "cylinder", labels: { r: `${r}cm`, h: `${h}cm` } }, v: { t: "vol_cyl", r, h } };
  }
  return kukanTerm();
}

function genStd_kukan(level) {
  const t = rint(1, 7);
  if (t === 1) { // 円錐の体積（r²h が3の倍数）
    let r, h; do { r = rint(2, 6); h = rint(2, 12); } while ((r * r * h) % 3 !== 0);
    const k = r * r * h / 3;
    return { q: "この円錐の体積は何cm³？", a: piStr(k), type: "text", ui: "choice", choices: piChoices(k, [r * r * h, k * 2, r * h, k + 3]), kind: "標準", text: true,
      fig: { type: "solid", kind: "cone", labels: { r: `${r}cm`, h: `${h}cm` } }, v: { t: "vol_cone", r, h } };
  }
  if (t === 2) { // 正四角錐の体積（a²h が3の倍数）
    let a, h; do { a = rint(2, 9); h = rint(2, 12); } while ((a * a * h) % 3 !== 0);
    return { q: `底面が1辺${a}cmの正方形、高さ${h}cmの正四角錐の体積は何cm³？`, a: a * a * h / 3, kind: "標準", text: true,
      fig: { type: "solid", kind: "pyramid", labels: { base: `${a}cm`, h: `${h}cm` } }, v: { t: "vol_pyr", base: a * a, h } };
  }
  if (t === 3) { // 球の体積（r = 3, 6 で割り切れる）
    const r = pickOne([3, 6]), k = 4 * r * r * r / 3;
    return { q: `半径${r}cmの球の体積は何cm³？`, a: piStr(k), type: "text", ui: "choice", choices: piChoices(k, [4 * r * r, r * r * r, k * 2, 4 * r * r * r]), kind: "標準", text: true,
      fig: { type: "solid", kind: "sphere", labels: { r: `${r}cm` } }, v: { t: "vol_sphere", r } };
  }
  if (t === 4) { // 球の表面積
    const r = rint(1, 6), k = 4 * r * r;
    return { q: `半径${r}cmの球の表面積は何cm²？`, a: piStr(k), type: "text", ui: "choice", choices: piChoices(k, [2 * r * r, r * r, 4 * r, 8 * r * r]), kind: "標準", text: true,
      fig: { type: "solid", kind: "sphere", labels: { r: `${r}cm` } }, v: { t: "surf_sphere", r } };
  }
  if (t === 5) { // 円柱の表面積
    const r = rint(1, 5), h = rint(2, 8), k = 2 * r * r + 2 * r * h;
    return { q: "この円柱の表面積は何cm²？", a: piStr(k), type: "text", ui: "choice", choices: piChoices(k, [r * r * h, 2 * r * h, r * r + 2 * r * h, 2 * r * r + r * h]), kind: "標準", text: true,
      fig: { type: "solid", kind: "cylinder", labels: { r: `${r}cm`, h: `${h}cm` } }, v: { t: "surf_cyl", r, h } };
  }
  if (t === 6) { // 立方体の表面積
    const a = rint(2, 9);
    return { q: `1辺が${a}cmの立方体の表面積は何cm²？`, a: 6 * a * a, kind: "標準", text: true,
      fig: { type: "solid", kind: "cube", labels: { w: `${a}cm` } }, v: { t: "surf_cube", a } };
  }
  return kukanTerm();
}

function localExplainKukan(p) {
  return [
    "ナイスチャレンジ！👏 いっしょに見直そう。",
    p.why ? `・${p.why}` : "・柱の体積＝底面積×高さ、錐の体積＝底面積×高さ×1/3、球の体積＝4/3×π×r³。",
    "・円の面積は π×半径×半径。円周率はπのまま残して答えるよ。",
    `・答えは「${p.a}」。`,
    "もう一回いける！🌟",
  ].join("\n");
}

const EXPLAIN_KUKAN =
  "あなたは中学1年生のための、やさしい数学の先生「マギ先生」です。" +
  "解説スタイル：①短文で ②箇条書きは行頭に「・」だけ ③むずかしい漢字にはふりがな ④まず良いところを褒める ⑤絶対に責めない・否定しない。" +
  "重要：マークダウン記号（** や * や # や ```）は絶対に使わない。" +
  "単元は空間図形（立体の面・辺・頂点、回転体、投影図、柱・錐・球の体積と表面積）。公式は「底面積×高さ（錐は×1/3）」のように言葉で示し、円周率πはそのまま残して答えることを伝える。" +
  "三平方の定理（中3）など中1で習わない考え方には立ち入らない。絵文字は1〜2個までOK。毎回みじかく。";

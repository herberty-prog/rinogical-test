/* ================= 数学：比例と反比例（フェーズ5）=================
   ・超基本（Lv1-2）：比例定数を求める／式に代入して y を求める（比例・反比例）
   ・標準（Lv3〜）：別の x のときの y、グラフ（図つき）から式を読む、グラフ上の点、用語
   ・答えは整数か「y=3x」のような短い式。v（検算用の材料）を持たせ、tools/verify.mjs が計算し直して確かめる。
   ・反比例の比例定数は 6・8・12・18・24 など約数の多い数にして、y が整数になる x だけを使う。 */
const HIREI_TERMS = [
  { q: "y = ax の a を何という？", a: "比例定数", ng: ["変数", "座標", "原点"], why: "y = ax（反比例は y = a/x）の a を比例定数というよ。" },
  { q: "x 軸と y 軸が交わる点を何という？", a: "原点", ng: ["頂点", "中心", "交点O"], why: "x軸とy軸の交わる点が原点O。座標は(0, 0)だよ。" },
  { q: "比例のグラフは、どんな線になる？", a: "直線", ng: ["双曲線", "円", "折れ線"], why: "比例のグラフは原点を通る直線だよ。" },
  { q: "反比例のグラフの名前は？", a: "双曲線", ng: ["直線", "放物線", "円"], why: "反比例のグラフは、なめらかな2本の曲線＝双曲線。" },
  { q: "比例のグラフは、かならずどの点を通る？", a: "原点", ng: ["(1, 1)", "(0, 1)", "(1, 0)"], why: "y = ax に x = 0 を入れると y = 0。だから原点を通るよ。" },
  { q: "y = ax で a が負のとき、x がふえると y は？", a: "へる", ng: ["ふえる", "変わらない", "0になる"], why: "a が負だとグラフは右下がり。x がふえると y はへるよ。" },
  { q: "反比例で、x の値が2倍になると y の値は？", a: "1/2倍", ng: ["2倍", "4倍", "変わらない"], why: "反比例は xy = a で一定。x が2倍なら y は1/2倍。" },
  { q: "比例で、x の値が3倍になると y の値は？", a: "3倍", ng: ["1/3倍", "9倍", "変わらない"], why: "比例は y = ax。x が3倍なら y も3倍。" },
  { q: "点(3, -2)の x 座標は？", a: "3", ng: ["-2", "1", "5"], why: "(x座標, y座標)の順に書くよ。前が x 座標。", type: "text" },
  { q: "点(-4, 5)の y 座標は？", a: "5", ng: ["-4", "1", "9"], why: "(x座標, y座標)の順。後ろが y 座標。", type: "text" },
];
const HANPI_A = [6, 8, 12, 18, 24];
const divisors = (n) => { const out = []; for (let i = 1; i <= n; i++) if (n % i === 0) out.push(i); return out; };
const lineStr = (a) => a === 1 ? "y=x" : a === -1 ? "y=-x" : `y=${a}x`;
const hyperStr = (a) => `y=${a}/x`;

function hireiTerm() {
  const d = pickOne(HIREI_TERMS);
  return { q: d.q, a: d.a, type: "text", ui: "choice", choices: shuffle([d.a].concat(d.ng)), kind: "用語", why: d.why, text: true };
}

function genKihon_hirei(level) {
  const t = rint(1, 4);
  if (t === 1) { // 比例定数
    const a = nz(-6, 6), x = nz(-5, 5);
    return { q: `y は x に比例し、x = ${x} のとき y = ${a * x}。比例定数は？`, a, kind: "超基本", text: true, v: { t: "hirei_a", x, y: a * x } };
  }
  if (t === 2) { // 比例の式に代入
    const a = nz(-6, 6), x = nz(-6, 6);
    return { q: `${lineStr(a).replace("=", " = ")} で、x = ${x} のときの y は？`, a: a * x, kind: "超基本", text: true, v: { t: "hirei_y", a, x } };
  }
  if (t === 3) { // 反比例の比例定数
    const a = pickOne(HANPI_A) * pickOne([1, -1]), x = pickOne(divisors(Math.abs(a))) * pickOne([1, -1]);
    return { q: `y は x に反比例し、x = ${x} のとき y = ${a / x}。比例定数は？`, a, kind: "超基本", text: true, v: { t: "hanpi_a", x, y: a / x } };
  }
  // 反比例の式に代入
  const a = pickOne(HANPI_A), x = pickOne(divisors(a)) * pickOne([1, -1]);
  return { q: `y = ${a}/x で、x = ${x} のときの y は？`, a: a / x, kind: "超基本", text: true, v: { t: "hanpi_y", a, x } };
}

function genStd_hirei(level) {
  const t = rint(1, 6);
  if (t === 1) { // 比例：別の x のときの y
    const a = nz(-5, 5), x1 = nz(-4, 4); let x2 = nz(-6, 6); if (x2 === x1) x2 = -x1;
    return { q: `y は x に比例し、x = ${x1} のとき y = ${a * x1}。x = ${x2} のときの y は？`, a: a * x2, kind: "標準", text: true, v: { t: "hirei_y2", x1, y1: a * x1, x2 } };
  }
  if (t === 2) { // 反比例：別の x のときの y
    const a = pickOne(HANPI_A) * pickOne([1, -1]);
    const ds = divisors(Math.abs(a));
    const x1 = pickOne(ds); let x2 = pickOne(ds) * pickOne([1, -1]); if (x2 === x1) x2 = -x1;
    return { q: `y は x に反比例し、x = ${x1} のとき y = ${a / x1}。x = ${x2} のときの y は？`, a: a / x2, kind: "標準", text: true, v: { t: "hanpi_y2", x1, y1: a / x1, x2 } };
  }
  if (t === 3) { // 比例のグラフから式（図つき）
    const a = pickOne([1, 2, 3, -1, -2, -3]);
    const x = pickOne([1, 2]); // |a×x| ≤ 6 で図の中に収まる
    const ans = lineStr(a);
    const cands = [lineStr(-a), lineStr(a * 2), hyperStr(a * x)];
    return { q: "このグラフの式はどれ？", a: ans, type: "text", ui: "choice", choices: choices4(ans, cands), kind: "標準",
      fig: { type: "coord", kind: "line", a, pts: [[x, a * x, `(${x}, ${a * x})`]] }, v: { t: "graph_line", a } };
  }
  if (t === 4) { // 反比例のグラフから式（図つき）
    const a = pickOne([4, 6, 8, -4, -6, -8]); // 選択肢を6文字以内にするため2けたは使わない
    const x = pickOne(divisors(Math.abs(a)).filter(d => d >= 2 && Math.abs(a / d) <= 6));
    const ans = hyperStr(a);
    const cands = [hyperStr(-a), lineStr(a / x > 0 ? 2 : -2), hyperStr(a / 2)];
    return { q: "このグラフの式はどれ？", a: ans, type: "text", ui: "choice", choices: choices4(ans, cands), kind: "標準",
      fig: { type: "coord", kind: "hyper", a, pts: [[x, a / x, `(${x}, ${a / x})`]] }, v: { t: "graph_hyper", a } };
  }
  if (t === 5) { // グラフ上の点
    const a = nz(-4, 4), x = nz(-5, 5);
    return { q: `点(${x}, □)は ${lineStr(a).replace("=", " = ")} のグラフ上にある。□は？`, a: a * x, kind: "標準", text: true, v: { t: "hirei_y", a, x } };
  }
  return hireiTerm();
}

function localExplainHirei(p) {
  return [
    "ナイスチャレンジ！👏 いっしょに見直そう。",
    p.why ? `・${p.why}` : "・比例は y = ax（y ÷ x がいつも同じ）、反比例は y = a/x（x × y がいつも同じ）。",
    "・まず比例定数 a を求めてから、式に x を入れるとまちがえにくいよ。",
    `・答えは「${p.a}」。`,
    "もう一回いける！🌟",
  ].join("\n");
}

const EXPLAIN_HIREI =
  "あなたは中学1年生のための、やさしい数学の先生「マギ先生」です。" +
  "解説スタイル：①短文で ②箇条書きは行頭に「・」だけ ③むずかしい漢字にはふりがな ④まず良いところを褒める ⑤絶対に責めない・否定しない。" +
  "重要：マークダウン記号（** や * や # や ```）は絶対に使わない。" +
  "単元は比例と反比例。比例は y = ax（y÷xが一定）、反比例は y = a/x（x×yが一定）。まず比例定数を求めてから代入する手順を、短い例で示す。" +
  "1次関数（中2）や放物線（中3）の話には立ち入らない。絵文字は1〜2個までOK。毎回みじかく。";

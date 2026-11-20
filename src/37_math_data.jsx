/* ================= 数学：データの活用（フェーズ5）=================
   ・超基本（Lv1-2）：平均値・中央値（個数が奇数）・最頻値・範囲
   ・標準（Lv3〜）：中央値（個数が偶数）、相対度数、階級値、ヒストグラム（図つき）の読み取り、
                   相対度数で表す確率（多数回の試行）、用語
   ・答えが整数にならない相対度数・確率は、4択を問題側で作る（小数 2 けたまで）。
   ・v（検算用の材料）を持たせ、tools/verify.mjs が計算し直して確かめる。 */
const DATA_TERMS = [
  { q: "データを大きさの順に並べたとき、まん中にくる値は？", a: "中央値", ng: ["平均値", "最頻値", "範囲"] },
  { q: "データの中で、いちばん多く出てくる値は？", a: "最頻値", ng: ["中央値", "平均値", "度数"] },
  { q: "最大値と最小値の差を何という？", a: "範囲", ng: ["階級", "度数", "平均値"] },
  { q: "データを整理するために区切った、それぞれの区間を何という？", a: "階級", ng: ["度数", "範囲", "階級値"] },
  { q: "それぞれの階級に入るデータの個数を何という？", a: "度数", ng: ["階級", "相対度数", "累積度数"] },
  { q: "階級のまん中の値を何という？", a: "階級値", ng: ["中央値", "平均値", "度数"] },
  { q: "度数の分布を、柱を並べたグラフで表したものは？", a: "ヒストグラム", ng: ["折れ線グラフ", "円グラフ", "帯グラフ"] },
  { q: "ある階級の度数の、全体の度数に対する割合を何という？", a: "相対度数", ng: ["累積度数", "度数", "階級値"] },
  { q: "最初の階級から、ある階級までの度数を合計したものは？", a: "累積度数", ng: ["相対度数", "度数", "範囲"] },
  { q: "あることがらの起こりやすさの程度を表す数を何という？", a: "確率", ng: ["度数", "範囲", "平均値"] },
];
const r2 = (x) => Math.round(x * 100) / 100;

function dataList(n, lo, hi) { const a = []; for (let i = 0; i < n; i++) a.push(rint(lo, hi)); return a; }
const listStr = (a) => a.join("、");

function genKihon_data(level) {
  const t = rint(1, 4);
  if (t === 1) { // 平均値（割り切れるように最後の1つで調整）
    const n = pickOne([4, 5]), m = rint(4, 8);
    let vals;
    for (;;) { vals = dataList(n - 1, 1, 10); const last = n * m - vals.reduce((s, x) => s + x, 0); if (last >= 1 && last <= 10) { vals.push(last); break; } }
    vals = shuffle(vals);
    return { q: `${n}人のテストの点数「${listStr(vals)}」の平均値は？`, a: m, kind: "超基本", text: true, v: { t: "mean", vals } };
  }
  if (t === 2) { // 中央値（奇数個）
    const vals = dataList(pickOne([5, 7]), 1, 20);
    const med = vals.slice().sort((x, y) => x - y)[(vals.length - 1) / 2];
    return { q: `データ「${listStr(vals)}」の中央値は？`, a: med, kind: "超基本", text: true, v: { t: "median", vals } };
  }
  if (t === 3) { // 最頻値（1つの値だけ3回）
    const m = rint(2, 15);
    const others = shuffle([...Array(20).keys()].map(i => i + 1).filter(x => x !== m)).slice(0, 4);
    const vals = shuffle([m, m, m, others[0], others[1], others[2], others[2] === others[3] ? others[0] : others[3]]);
    return { q: `データ「${listStr(vals)}」の最頻値は？`, a: m, kind: "超基本", text: true, v: { t: "mode", vals } };
  }
  const vals = dataList(6, 1, 30); // 範囲
  return { q: `データ「${listStr(vals)}」の範囲は？`, a: Math.max(...vals) - Math.min(...vals), kind: "超基本", text: true, v: { t: "range", vals } };
}

function genStd_data(level) {
  const t = rint(1, 7);
  if (t === 1) { // 中央値（偶数個・整数になるように）
    for (;;) {
      const vals = dataList(6, 1, 20); const s = vals.slice().sort((x, y) => x - y);
      if ((s[2] + s[3]) % 2 === 0) return { q: `データ「${listStr(vals)}」の中央値は？`, a: (s[2] + s[3]) / 2, kind: "標準", text: true, v: { t: "median", vals } };
    }
  }
  if (t === 2) { // 相対度数
    const total = pickOne([20, 25, 50]), c = rint(1, total - 1), a = r2(c / total);
    const ch = choices4(a, [r2(a + 0.1), r2(Math.max(0.01, a - 0.05)), r2(c / 100), r2(a + 0.2)].filter(x => x > 0 && x < 1));
    return { q: `全体が${total}人で、ある階級の度数が${c}人。この階級の相対度数は？`, a, choices: ch, ui: "choice", kind: "標準", text: true, v: { t: "rel", c, total } };
  }
  if (t === 3) { // 階級値
    const w = pickOne([5, 10, 20]), lo = w * rint(0, 8);
    return { q: `${lo}以上${lo + w}未満の階級の階級値は？`, a: lo + w / 2, kind: "標準", text: true, v: { t: "classmid", lo, hi: lo + w } };
  }
  if (t === 4 || t === 5) { // ヒストグラムの読み取り（図つき）
    const w = 10, off = pickOne([0, 50]), edges = [0, 10, 20, 30, 40, 50].map(x => x + off);
    let counts; do { counts = dataList(5, 1, 9); } while (counts.filter(c => c === Math.max(...counts)).length !== 1);
    const fig = { type: "bars", edges, counts, unit: "点" };
    const f = rint(1, 4);
    if (f === 1) { const i = rint(0, 4); return { q: `${edges[i]}点以上${edges[i + 1]}点未満の人は何人？`, a: counts[i], kind: "標準", text: true, fig, v: { t: "bars_count", counts, i } }; }
    if (f === 2) { const i = counts.indexOf(Math.max(...counts)); return { q: "度数がいちばん多い階級の階級値は？", a: edges[i] + w / 2, kind: "標準", text: true, fig, v: { t: "bars_modeclass", edges, counts } }; }
    if (f === 3) { const i = rint(1, 4); return { q: `${edges[i]}点未満の人は全部で何人？`, a: counts.slice(0, i).reduce((s, x) => s + x, 0), kind: "標準", text: true, fig, v: { t: "bars_cum", counts, i } }; }
    return { q: "全体の人数は何人？", a: counts.reduce((s, x) => s + x, 0), kind: "標準", text: true, fig, v: { t: "bars_total", counts } };
  }
  if (t === 6) { // 相対度数で表す確率
    const n = pickOne([500, 1000, 2000]), a = r2(rint(20, 80) / 100), k = Math.round(n * a);
    const ch = choices4(a, [r2(1 - a), r2(a + 0.1), r2(Math.max(0.05, a - 0.1))].filter(x => x > 0 && x < 1));
    return { q: `ペットボトルのキャップを${n}回投げたら、表が${k}回出た。表が出る確率はおよそいくつ？`, a, choices: ch, ui: "choice", kind: "標準", text: true, v: { t: "prob", k, n } };
  }
  const d = pickOne(DATA_TERMS);
  return { q: d.q, a: d.a, type: "text", ui: "choice", choices: shuffle([d.a].concat(d.ng)), kind: "用語", text: true };
}

function localExplainData(p) {
  return [
    "ナイスチャレンジ！👏 いっしょに見直そう。",
    "・平均値＝合計÷個数、中央値＝並べてまん中、最頻値＝いちばん多い値、範囲＝最大−最小。",
    "・相対度数＝その階級の度数÷全体の度数。",
    `・答えは「${p.a}」。`,
    "もう一回いける！🌟",
  ].join("\n");
}

const EXPLAIN_DATA =
  "あなたは中学1年生のための、やさしい数学の先生「マギ先生」です。" +
  "解説スタイル：①短文で ②箇条書きは行頭に「・」だけ ③むずかしい漢字にはふりがな ④まず良いところを褒める ⑤絶対に責めない・否定しない。" +
  "重要：マークダウン記号（** や * や # や ```）は絶対に使わない。" +
  "単元はデータの活用（平均値・中央値・最頻値・範囲、度数分布とヒストグラム、相対度数・累積度数、多数回の試行による確率）。値を並べる、合計を数えるなど手順を順に示す。" +
  "四分位数（中2）や場合の数を使う確率（中2）には立ち入らない。絵文字は1〜2個までOK。毎回みじかく。";

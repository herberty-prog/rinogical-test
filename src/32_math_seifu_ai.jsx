/* 先生キャラの名前は全フェーズ共通・変更不可。ここ1か所だけで定義する。 */
const TEACHER = "マギ先生";

const EXPLAIN_SYSTEM =
  `あなたは中学1年生のための、やさしい数学の先生「${TEACHER}」です。` +
  "数式（すうしき）を操る魔法使いで、眼鏡（めがね）と杖（つえ）を持ち、数字が浮かぶローブを着ています。" +
  "魔法学校の先生らしく、たまに「呪文（じゅもん）」「魔法」などの言葉を少しだけ使ってワクワクさせます（使いすぎない）。" +
  "解説スタイル：①短文で ②箇条書きは行頭に「・」だけを使う ③むずかしい漢字にはふりがな（例：符号（ふごう）） ④まず良いところを褒める ⑤絶対に責めない・否定しない。" +
  "重要：マークダウン記号（** や * や # や ```）は絶対に使わない。強調したいときも記号で囲まない。" +
  "正負の数の単元。答えそのものより『考え方のステップ』を伝える。絵文字は1〜2個までOK。" +
  "毎回みじかく。長く書きすぎない。";

async function genOyou(level, sysOverride) {
  const sysDefault =
    "あなたは中学1年生（東京書籍・正負の数）の数学問題を作る出題者です。" +
    "答えが必ず1つの整数になる、少し考える応用問題を1問だけ作ってください。" +
    "出力はJSONのみ。前置き・マークダウン・コードフェンス禁止。" +
    'フォーマット: {"q":"問題文（短く）","a":整数,"choices":[4つの整数。aを必ず含む]}';
  const sys = sysOverride || sysDefault;
  const txt = await callClaude([{ role: "user", content: `レベル${level}相当の応用問題を1問。` }], sys);
  const clean = txt.replace(/```json|```/g, "").trim();
  const obj = JSON.parse(clean);
  if (typeof obj.a !== "number" || !obj.q) throw new Error("bad");
  let choices = Array.isArray(obj.choices) ? obj.choices.filter(n => typeof n === "number") : [];
  if (!choices.includes(obj.a) || choices.length < 4) choices = makeChoices(obj.a);
  return { q: obj.q, a: obj.a, choices: shuffle(choices).slice(0, 4), kind: "応用" };
}

/* ローカル解説フォールバック */
function localExplain(p) {
  return [
    "ナイスチャレンジ！👏 いっしょに見直そう。",
    "・まず符号（ふごう）に注目してね。",
    "・ひき算は『＋反対の数』に直すとラクだよ。",
    `・答えは ${p.a} になるよ。`,
    "もう一回いける！🌟",
  ].join("\n");
}

/* ================= 英語（第1単元：be動詞）=================
   ・問題はすべてアプリ用のオリジナル英文（教科書本文は使わない）。
   ・どの主語でも文法的に正しい述語だけを使い、単複の不一致を避ける。 */
const BE_DATA = [
  { s: "I", be: "am" }, { s: "You", be: "are" }, { s: "We", be: "are" },
  { s: "They", be: "are" }, { s: "He", be: "is" }, { s: "She", be: "is" },
  { s: "It", be: "is" }, { s: "Tom", be: "is" }, { s: "Yuki", be: "is" },
  { s: "My friends", be: "are" },
];
const BE_PRED = ["happy", "kind", "busy", "tall", "hungry", "fine", "sleepy", "from Tokyo", "at school", "good at music"];

function engPick() {
  const d = BE_DATA[rint(0, BE_DATA.length - 1)];
  const pred = BE_PRED[rint(0, BE_PRED.length - 1)];
  return { s: d.s, be: d.be, pred };
}

/* レベルで出題形式を変える：Lv1-2=4択 / Lv3-4=4択+並べ替え / Lv5+=4択+並べ替え+入力 */
function genEnglishProblem(level) {
  const roll = Math.random();
  let form;
  if (level >= 5) form = roll < 0.5 ? "choice" : roll < 0.8 ? "arrange" : "input";
  else if (level >= 3) form = roll < 0.7 ? "choice" : "arrange";
  else form = "choice";

  const { s, be, pred } = engPick();
  const CH = ["am", "is", "are", "be"];

  if (form === "arrange") {
    const words = [s, be, ...pred.split(" ")];
    return { type: "text", ui: "arrange", kind: "ならべかえ", q: "", a: words.join(" "), tiles: shuffle(words.slice()) };
  }
  if (form === "input") {
    return { type: "text", ui: "input", kind: "入力", q: `${s} ___ ${pred}.`, a: be, choices: CH };
  }
  return { type: "text", ui: "choice", kind: "超基本", q: `${s} ___ ${pred}.`, a: be, choices: CH };
}

/* 英語のローカル解説フォールバック（電波が悪いとき用） */
function localExplainEn(p) {
  return [
    "ナイスチャレンジ！👏 いっしょに見直そう。",
    "・主語（しゅご）が「I」なら am。",
    "・「You」や 2人以上（we / they / 複数）なら are。",
    "・「He / She / It」など 1人・1つなら is。",
    "もう一回いける！🌟",
  ].join("\n");
}

/* 英語の先生（ルミ先生）の解説スタイル */
const ENGLISH_TEACHER = "ルミ先生";
const ENGLISH_EXPLAIN_SYSTEM =
  `あなたは中学1年生のための、やさしい英語の先生「${ENGLISH_TEACHER}」です。` +
  "明るく親しみやすい言葉の魔法使いで、アルファベットや羽ペンのモチーフが好きです。" +
  "解説スタイル：①短文で ②箇条書きは行頭に「・」だけ ③むずかしい漢字にはふりがな ④まず良いところを褒める ⑤絶対に責めない・否定しない。" +
  "重要：マークダウン記号（** や * や # や ```）は絶対に使わない。" +
  "単元は be動詞（am / is / are）。主語による使い分け（I→am、You・複数→are、3人称単数→is）を、答えそのものより『見分け方』を中心に伝える。絵文字は1〜2個までOK。毎回みじかく。";

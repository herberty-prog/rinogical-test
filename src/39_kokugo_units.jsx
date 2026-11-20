/* ================= 国語の単元（部屋）の表 =================
   数学の MATH_UNITS（38_math_units.jsx）と同じ考え方。Battle は unitKey でここを引き、
   問題の作り方・ボス名・解説を部屋ごとに切り替える。
   部屋を足すときは：①ここに1項目足す ②KOKUGO_UNIT_KEYS に並べる ③40_i18n.jsx の kokugoRooms に部屋名を足す。
   レベル・XPは部屋ごとに分けず、国語全体で1つ（数学と同じ）。 */
const KOKUGO_UNITS = {
  kanji: {
    name: "漢字", bossName: SUBJECT_META.kokugo.bossName, tokens: SUBJECT_META.kokugo.tokens,
    gen: genKokugoProblem, explain: KOKUGO_EXPLAIN_SYSTEM, localExplain: localExplainKokugo,
    easier: "「もっとかんたんに」と言われました。その漢字の覚え方を、別の切り口（へん・つくりの意味、にた形の漢字とのくらべ方、送りがなの見分け方など）から1つだけ選んで、いちばんやさしく説明して。同じ説明のくり返しは避けて。",
  },
  goi: {
    name: "語彙", bossName: "ツイン・ミラージュ", tokens: ["対", "類", "義", "語", "四", "字", "熟", "反"],
    gen: genGoiProblem, explain: GOI_EXPLAIN_SYSTEM, localExplain: localExplainGoi,
    easier: "「もっとかんたんに」と言われました。そのことばの意味を、身近な場面の短い例文を1つだけ使って、いちばんやさしく説明して。漢字1文字ずつの意味から考えるヒントも1つ添えて。同じ説明のくり返しは避けて。",
  },
};
/* 部屋の並び順（試練の間の上から）。i 番目 → 単元キー */
const KOKUGO_UNIT_KEYS = ["kanji", "goi"];

/* 試練の間（単元選択）を持つ教科の一覧。ここに無い教科は「科目選択→すぐバトル」のまま。
   roomsKey は 40_i18n.jsx の部屋名リストのキー。 */
const SUBJECT_ROOMS = {
  math: { keys: MATH_UNIT_KEYS, roomsKey: "rooms" },
  kokugo: { keys: KOKUGO_UNIT_KEYS, roomsKey: "kokugoRooms" },
};

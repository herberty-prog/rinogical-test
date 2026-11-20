/* ================= 教科ごとの単元（部屋）の表 =================
   数学は 38_math_units.jsx の MATH_UNITS（つくり方がちがうので別）。それ以外の教科はこのファイル。
   1つの単元＝{ name, bossName, tokens, gen(問題をつくる), explain(AI先生の設定), localExplain(通信なし時), easier(「もっとかんたんに」) }
   単元を足すときは：①その教科の 〇〇_UNITS に1項目 ②〇〇_UNIT_KEYS に並べる ③40_i18n.jsx の部屋名リストに1行。
   ---- 以下、もとは国語用に作った表（2026-11-21 フェーズ1）----
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
  kimari: {
    name: "文法", bossName: "ブロークン・シンタクス", tokens: ["主", "述", "文", "節", "品", "詞", "敬", "語"],
    gen: genKimariProblem, explain: KIMARI_EXPLAIN_SYSTEM, localExplain: localExplainKimari,
    easier: "「もっとかんたんに」と言われました。見分け方の手順（文節は「ネ」を入れて区切る、品詞は自立語か→活用するか→言い切りの形）のうち、この問題に関係する1つだけを、ごく短い例文で、いちばんやさしく説明して。同じ説明のくり返しは避けて。",
  },
  kobun: {
    name: "古文", bossName: "エンシェント・ムーン", tokens: ["昔", "月", "竹", "姫", "翁", "いと", "ゐ", "ゑ"],
    gen: genKobunProblem, explain: KOBUN_EXPLAIN_SYSTEM, localExplain: localExplainKobun,
    easier: "「もっとかんたんに」と言われました。この問題に関係するルールか意味を1つだけ選んで、今のことばとくらべながら、いちばんやさしく説明して。同じ説明のくり返しは避けて。中1で習わない古典文法には立ち入らないで。",
  },
};
/* 部屋の並び順（試練の間の上から）。i 番目 → 単元キー */
const KOKUGO_UNIT_KEYS = ["kanji", "goi", "kimari", "kobun"];

/* ---- 英語 ---- */
const ENGLISH_UNITS = {
  be: {
    name: "be動詞", bossName: SUBJECT_META.english.bossName, tokens: SUBJECT_META.english.tokens,
    gen: genEnglishProblem, explain: ENGLISH_EXPLAIN_SYSTEM, localExplain: localExplainEn,
    easier: "「もっとかんたんに」と言われました。主語による be動詞の見分け方を、別の身近な言い方で、いちばんやさしく説明して。同じ説明のくり返しは避けて。",
  },
  ippan: {
    name: "一般動詞", bossName: "アイドル・ゴーレム", tokens: ["play", "like", "do", "don't", "have", "go", "?", "eat"],
    gen: genEnIppan, explain: EN_IPPAN_SYSTEM, localExplain: enLocalExplain("ippan"),
    easier: "「もっとかんたんに」と言われました。be動詞の文と一般動詞の文のちがいを、身近な短い例文2つでくらべて、いちばんやさしく説明して。同じ説明のくり返しは避けて。",
  },
  can: {
    name: "can", bossName: "ロックド・ゲート", tokens: ["can", "can't", "Can", "swim", "run", "?", "fast", "well"],
    gen: genEnCan, explain: EN_CAN_SYSTEM, localExplain: enLocalExplain("can"),
    easier: "「もっとかんたんに」と言われました。can のあとの動詞はいつももとの形になることを、「can は動詞の前に立つカギ」のようなたとえで、いちばんやさしく説明して。同じ説明のくり返しは避けて。",
  },
  sansho: {
    name: "三人称単数", bossName: "エス・サーペント", tokens: ["s", "es", "ies", "has", "does", "he", "she", "Tom"],
    gen: genEnSansho, explain: EN_SANSHO_SYSTEM, localExplain: enLocalExplain("sansho"),
    easier: "「もっとかんたんに」と言われました。「自分と相手以外の1人・1つが主語なら動詞に s」のルールを、身近な人を主語にした短い例文で、いちばんやさしく説明して。同じ説明のくり返しは避けて。",
  },
  gimon: {
    name: "疑問詞", bossName: "ハテナ・ウィスプ", tokens: ["What", "Who", "Where", "When", "How", "Whose", "?", "?"],
    gen: genEnWh, explain: EN_WH_SYSTEM, localExplain: localExplainEnWh,
    easier: "「もっとかんたんに」と言われました。答えの文のどこを見れば疑問詞が決まるかを、場所・時・人・ものの4つに分けて、いちばんやさしく説明して。同じ説明のくり返しは避けて。",
  },
  shinkou: {
    name: "現在進行形", bossName: "ナウ・ループ", tokens: ["ing", "now", "am", "is", "are", "-ing", "...", "now"],
    gen: genEnShinkou, explain: EN_SHINKOU_SYSTEM, localExplain: enLocalExplain("shinkou"),
    easier: "「もっとかんたんに」と言われました。「いつもすること」と「いま、しているところ」のちがいを、身近な短い例文2つでくらべて、いちばんやさしく説明して。同じ説明のくり返しは避けて。",
  },
  kako: {
    name: "過去形", bossName: "メモリー・レイス", tokens: ["ed", "did", "was", "were", "went", "ate", "made", "had"],
    gen: genEnKako, explain: EN_KAKO_SYSTEM, localExplain: enLocalExplain("kako"),
    easier: "「もっとかんたんに」と言われました。yesterday などの『過去のしるし』を見つけたら動詞を過去形にする、という見分け方を、短い例文で、いちばんやさしく説明して。同じ説明のくり返しは避けて。",
  },
};
const ENGLISH_UNIT_KEYS = ["be", "ippan", "can", "sansho", "gimon", "shinkou", "kako"];

/* ---- 理科 ---- */
const RIKA_UNITS = {
  shokubutsu: {
    name: "植物のなかま", bossName: SUBJECT_META.rika.bossName, tokens: SUBJECT_META.rika.tokens,
    gen: genRikaProblem, explain: RIKA_EXPLAIN_SYSTEM, localExplain: localExplainRika,
    easier: "「もっとかんたんに」と言われました。その用語の覚え方を、別の切り口（名前の漢字の意味、対になる用語とのセット、身近な植物での例えなど）から1つだけ選んで、いちばんやさしく説明して。同じ説明のくり返しは避けて。中学1年で習わない光合成や蒸散のくわしい話には立ち入らないで。",
  },
  doubutsu: {
    name: "動物のなかま", bossName: "キメラ・ファング", tokens: ["魚", "鳥", "肺", "えら", "毛", "卵", "骨", "牙"],
    gen: (lv) => genTableProblem(DOUBUTSU_DATA, lv), explain: DOUBUTSU_EXPLAIN_SYSTEM, localExplain: localExplainDoubutsu,
    easier: "「もっとかんたんに」と言われました。その用語や考え方の覚え方を、別の切り口（名前の漢字の意味、対になる用語とのセット、身近な例えなど）から1つだけ選んで、いちばんやさしく説明して。同じ説明のくり返しは避けて。恒温・変温や進化の話には立ち入らないで。",
  },
  busshitsu: {
    name: "身のまわりの物質", bossName: "フラスコ・ミミック", tokens: ["O₂", "CO₂", "H₂", "g/cm³", "%", "℃", "泡", "結晶"],
    gen: genBusshitsuProblem, explain: BUSSHITSU_EXPLAIN_SYSTEM, localExplain: localExplainBusshitsu,
    easier: "「もっとかんたんに」と言われました。その用語や考え方の覚え方を、別の切り口（名前の漢字の意味、対になる用語とのセット、身近な例えなど）から1つだけ選んで、いちばんやさしく説明して。同じ説明のくり返しは避けて。計算の問題なら、式を言葉で1行で示してから数を入れて。原子・分子の話には立ち入らないで。",
  },
  hikari: {
    name: "光・音・力", bossName: "プリズム・ナイト", tokens: ["光", "音", "N", "Hz", "焦点", "反射", "ばね", "屈折"],
    gen: genHikariProblem, explain: HIKARI_EXPLAIN_SYSTEM, localExplain: localExplainHikari,
    easier: "「もっとかんたんに」と言われました。その用語や考え方の覚え方を、別の切り口（名前の漢字の意味、対になる用語とのセット、身近な例えなど）から1つだけ選んで、いちばんやさしく説明して。同じ説明のくり返しは避けて。計算の問題なら、式を言葉で1行で示してから数を入れて。電流やエネルギーの話には立ち入らないで。",
  },
  daichi: {
    name: "大地の変化", bossName: "ガイア・タイタン", tokens: ["P波", "S波", "震度", "岩", "化石", "火山", "層", "断層"],
    gen: genDaichiProblem, explain: DAICHI_EXPLAIN_SYSTEM, localExplain: localExplainDaichi,
    easier: "「もっとかんたんに」と言われました。その用語や考え方の覚え方を、別の切り口（名前の漢字の意味、対になる用語とのセット、身近な例えなど）から1つだけ選んで、いちばんやさしく説明して。同じ説明のくり返しは避けて。天気や天体の話には立ち入らないで。",
  },
};
const RIKA_UNIT_KEYS = ["shokubutsu", "doubutsu", "busshitsu", "hikari", "daichi"];

/* ---- 社会 ---- */
const SHAKAI_UNITS = {
  sekai: {
    name: "世界の姿", bossName: SUBJECT_META.shakai.bossName, tokens: SUBJECT_META.shakai.tokens,
    gen: genShakaiProblem, explain: SHAKAI_EXPLAIN_SYSTEM, localExplain: localExplainShakai,
    easier: "「もっとかんたんに」と言われました。その用語の覚え方を、別の切り口（言葉の意味、地球儀や地図でのイメージ、対になる知識とのセットなど）から1つだけ選んで、いちばんやさしく説明して。同じ説明のくり返しは避けて。政治や歴史の話には立ち入らないで。",
  },
};
const SHAKAI_UNIT_KEYS = ["sekai"];

/* 試練の間（単元選択）の一覧。全教科が「科目→試練の間→バトル」（2026-11-21 フェーズ5-0〜）。
   units は単元の表（数学は MATH_UNITS）、keys は部屋の並び順、roomsKey は 40_i18n.jsx の部屋名リストのキー。 */
const SUBJECT_ROOMS = {
  math: { units: MATH_UNITS, keys: MATH_UNIT_KEYS, roomsKey: "rooms" },
  english: { units: ENGLISH_UNITS, keys: ENGLISH_UNIT_KEYS, roomsKey: "englishRooms" },
  kokugo: { units: KOKUGO_UNITS, keys: KOKUGO_UNIT_KEYS, roomsKey: "kokugoRooms" },
  rika: { units: RIKA_UNITS, keys: RIKA_UNIT_KEYS, roomsKey: "rikaRooms" },
  shakai: { units: SHAKAI_UNITS, keys: SHAKAI_UNIT_KEYS, roomsKey: "shakaiRooms" },
};

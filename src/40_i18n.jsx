/* ===========================================================================
   多言語の土台（i18n）
   - 画面に出る文章は、すべてこの STR 辞書にまとめる。
   - LANG を変えると言語が切り替わる（今は "ja" だけ。英語を足すなら STR.en を埋めて "en" に）。
   - en などに無いキーは自動で ja にフォールバックする（途中まで翻訳でも壊れない）。
   - t("キー") で取り出す。変数が要る文は関数で持つ：t("hpOf", name) など。
   - 注意：AI解説のプロンプトは「先生が話す言語」なので、英語追加時にここへ一緒に移す。
   =========================================================================== */
const LANG = "ja";

const STR = {
  ja: {
    appSubtitle: "りのじかる魔法学校",
    tipLabel: "豆知識：",
    tips: [
      "マイナス×マイナスは…なんとプラス！",
      "0より小さい数を『負（ふ）の数』というよ。",
      "符号がそろえば、足すだけでOK。",
      "ひき算は『反対の数をたす』とカンタンに。",
      "数直線を思いうかべると間違えにくいよ。",
    ],
    chooseBuddy: "あいぼうをえらぶ",
    chooseBuddySub: "いっしょに「無知の呪い」をとこう",
    charDesc: { myao: "ねこ耳の見習い魔導士", ruu: "しっぽが自慢の魔法使い" },
    nameTitle: "なんて呼べばいい？",
    nameSub: "この呼び方で、ゲーム中も親画面でも呼ぶよ",
    nickLabel: "呼ばれ方（ニックネーム）",
    nickPlaceholder: "例：けいくん",
    next: "すすむ",
    tutHello: "ようこそ、",
    tutHelloEnd: "。",
    tutCurse: "りのじかる魔法学校に「無知の呪い」がかけられた。",
    tutSeal: "７つの試練の間にある封印を解き、守護者を元にもどそう。",
    tutMechanism: "問題を解く＝魔法の力で呪いを解く。さあ、最初の間へ。",
    startAdventure: "ぼうけんをはじめる ✦",
    chooseTrial: "試練の間をえらぶ",
    chooseSubject: "きょうは どれに ちょうせん？",
    subjects: [
      { name: "数学", teacher: "マギ先生" },
      { name: "英語", teacher: "ルミ先生" },
      { name: "国語", teacher: "ソラ先生" },
      { name: "理科", teacher: "ミルス先生" },
      { name: "社会", teacher: "クロス先生" },
    ],
    comingSoon: "準備中だよ！ もうすこし まってね 🌱",
    backToSubjects: "← 科目にもどる",
    arrangeHint: "ことばを ならべて 文を つくろう",
    arrangeTrayHint: "下の カード を タップして ならべよう",
    clearBtn: "けす",
    rooms: [
      { name: "暗黒の数字の間", sub: "正負の数 / ボス：ダーク・ナンバー" },
      { name: "文字式の回廊", sub: "式の値（代入）/ ボス：シャドウ・レター" },
      { name: "方程式の聖堂", sub: "1次方程式 / ボス：バランス・ロード" },
    ],
    bossName: "ダーク・ナンバー",
    bossHP: "ボスHP",
    hpOf: (n) => `${n} のHP`,
    deadMsg: "だいじょうぶ、まだいける！🌱",
    deadMsg2: "もう一度ちょうせんしよう。",
    retry: "もう一回",
    callingProblem: "魔法の問題を よびだし中…",
    attackHint: "正解で攻撃 / 不正解でダメージ",
    inputHint: "数字で答えてね（マイナスは ± ボタン）",
    inputHintText: "英語で答えてね（スペルに気をつけて）",
    inputPlaceholder: "答えを入力",
    answerBtn: "こたえる",
    yourAnswer: "あなたの答え：",
    correctMark: " ⭕",
    answerWas: (a) => ` ／ 正解は ${a}`,
    correctPlus: "せいかい！ +10",
    nextSpell: "つぎの呪文へ ✦",
    teacherIntro: "おしい！いっしょに見直そう 🌟",
    thinking: "が考え中…",
    why: "なんで？",
    easier: "もっとかんたんに",
    nextProblem: "つぎの問題にすすむ →",
    backToTrials: "← 試練の間にもどる",
    sealBroken: "封印を解いた！",
    guardianReturned: "試練の間の守護者がもどってきた。",
    wellDone: (n) => `よくやったね、${n}！`,
    clear: "クリア",
    backToTrialsBtn: "試練の間にもどる",
  },
  en: {
    // ここに英語を追加すると英語版になります（未訳のキーは日本語が出ます）。
    // 例：appSubtitle: "Rinogical Magic School",
  },
};

function t(key, ...args) {
  const table = STR[LANG] || STR.ja;
  let v = table[key];
  if (v === undefined) v = STR.ja[key];
  return typeof v === "function" ? v(...args) : v;
}

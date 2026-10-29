/* 科目ごとの設定（ボス名・浮遊トークン・先生・解説）をここ1か所で管理 */
const SUBJECT_META = {
  math: { bossName: "ダーク・ナンバー", tokens: ["7", "-3", "5", "-8", "0", "-1", "9", "-4"], teacher: TEACHER, explain: EXPLAIN_SYSTEM, teacherImg: assetUrl(ASSETS.teachers.magi), emoji: "➗" },
  english: { bossName: "ミステイク・スペクター", tokens: ["A", "B", "is", "am", "are", "?", "the", "be"], teacher: ENGLISH_TEACHER, explain: ENGLISH_EXPLAIN_SYSTEM, teacherImg: assetUrl(ASSETS.teachers.rumi), emoji: "🔤" },
  kokugo: { bossName: "サイレント・ワード", tokens: ["漢", "字", "音", "訓", "読", "書", "文", "語"], teacher: KOKUGO_TEACHER, explain: KOKUGO_EXPLAIN_SYSTEM, teacherImg: assetUrl(ASSETS.teachers.sora), emoji: "✍️" },
  rika: { bossName: "ウィザリング・ブルーム", tokens: ["花", "葉", "根", "茎", "種", "実", "芽", "脈"], teacher: RIKA_TEACHER, explain: RIKA_EXPLAIN_SYSTEM, teacherImg: assetUrl(ASSETS.teachers.mils), emoji: "🔬" },
  shakai: { bossName: "ロスト・メリディアン", tokens: ["緯", "経", "度", "州", "海", "陸", "地", "球"], teacher: SHAKAI_TEACHER, explain: SHAKAI_EXPLAIN_SYSTEM, teacherImg: assetUrl(ASSETS.teachers.kros), emoji: "🌏" },
};

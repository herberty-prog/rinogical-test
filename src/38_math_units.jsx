/* 共通：標準プールからランダムに1問選ぶ */
const genFromPool = (pool) => ({ ...pool[rint(0, pool.length - 1)], kind: "標準" });

/* 単元データ本体。Battle はここを見て問題・ボス名・解説を切り替える */
const MATH_UNITS = {
  seifu: {
    name: "正負の数", bossName: "ダーク・ナンバー",
    tokens: SUBJECT_META.math.tokens,
    genKihon: genKihon, pool: HYOJUN,
    genOyou: (lv) => genOyou(lv),
    explain: EXPLAIN_SYSTEM, localExplain: localExplain,
  },
  moji: {
    name: "文字式", bossName: "シャドウ・レター",
    tokens: ["x", "a", "2x", "y", "-3", "x+1", "5", "-x"],
    genKihon: genKihon_moji, pool: MOJI,
    genOyou: (lv) => genOyou(lv, MOJI_OYOU_SYS),
    explain: EXPLAIN_MOJI, localExplain: localExplainMoji,
  },
  houtei: {
    name: "方程式", bossName: "バランス・ロード",
    tokens: ["x", "2x", "=", "+3", "-5", "x=?", "7", "-x"],
    genKihon: genKihon_houtei, pool: HOUTEI,
    genOyou: (lv) => genOyou(lv, HOUTEI_OYOU_SYS),
    explain: EXPLAIN_HOUTEI, localExplain: localExplainHoutei,
  },
};
/* 部屋の並び順（試練の間の上から）。i 番目 → 単元キー */
const MATH_UNIT_KEYS = ["seifu", "moji", "houtei"];

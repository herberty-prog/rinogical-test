/* 共通：標準プールからランダムに1問選ぶ */
const genFromPool = (pool) => ({ ...pool[rint(0, pool.length - 1)], kind: "標準" });
/* フェーズ5の単元：用語の表を、うまく作れなかったときの予備プール（4択）にする */
const termPool = (terms) => terms.map(d => ({ q: d.q, a: d.a, type: "text", ui: "choice", choices: shuffle([d.a].concat(d.ng)), why: d.why, text: true }));

/* 単元データ本体。Battle はここを見て問題・ボス名・解説を切り替える */
const MATH_UNITS = {
  seifu: {
    name: "正負の数", bossName: "ダーク・ナンバー",
    tokens: SUBJECT_META.math.tokens,
    genKihon: genKihon, pool: HYOJUN, genStd: genStd_seifu,
    genOyou: (lv) => genOyou(lv, OYOU_SEIFU_SYS, ["expr"]),
    explain: EXPLAIN_SYSTEM, localExplain: localExplain,
  },
  moji: {
    name: "文字式", bossName: "シャドウ・レター",
    tokens: ["x", "a", "2x", "y", "-3", "x+1", "5", "-x"],
    genKihon: genKihon_moji, pool: MOJI, genStd: genStd_moji,
    genOyou: (lv) => genOyou(lv, OYOU_MOJI_SYS, ["subst"]),
    explain: EXPLAIN_MOJI, localExplain: localExplainMoji,
  },
  houtei: {
    name: "方程式", bossName: "バランス・ロード",
    tokens: ["x", "2x", "=", "+3", "-5", "x=?", "7", "-x"],
    genKihon: genKihon_houtei, pool: HOUTEI, genStd: genStd_houtei,
    genOyou: (lv) => genOyou(lv, OYOU_HOUTEI_SYS, ["eq"]),
    explain: EXPLAIN_HOUTEI, localExplain: localExplainHoutei,
  },
  hirei: {
    name: "比例と反比例", bossName: "グラフ・ファントム",
    tokens: ["y=ax", "x", "y", "a", "(2,4)", "O", "y=6/x", "-x"],
    genKihon: genKihon_hirei, pool: termPool(HIREI_TERMS), genStd: genStd_hirei,
    genOyou: (lv) => genOyouV(lv, OYOU_HIREI_SYS, ["hirei_y2", "hanpi_y2", "hirei_a", "hanpi_a"]), // 37_math_oyou_ai.jsx（答えはアプリが計算）
    explain: EXPLAIN_HIREI, localExplain: localExplainHirei,
  },
  heimen: {
    name: "平面図形", bossName: "コンパス・レイス",
    tokens: ["π", "⊥", "//", "弧", "弦", "90°", "r", "360°"],
    genKihon: genKihon_heimen, pool: termPool(HEIMEN_TERMS), genStd: genStd_heimen,
    genOyou: (lv) => genOyouV(lv, OYOU_HEIMEN_SYS, ["circ_len", "circ_area", "arc", "sector", "deg_from_arc"]), // 37_math_oyou_ai.jsx（答えはアプリが計算）
    explain: EXPLAIN_HEIMEN, localExplain: localExplainHeimen,
  },
  kukan: {
    name: "空間図形", bossName: "ヴォイド・キューブ",
    tokens: ["cm³", "π", "1/3", "面", "辺", "r", "h", "球"],
    genKihon: genKihon_kukan, pool: termPool(KUKAN_TERMS), genStd: genStd_kukan,
    genOyou: (lv) => genOyouV(lv, OYOU_KUKAN_SYS, ["vol_cuboid", "vol_cyl", "vol_cone", "vol_pyr", "vol_sphere", "surf_cube", "surf_cyl", "surf_sphere"]), // 37_math_oyou_ai.jsx（答えはアプリが計算）
    explain: EXPLAIN_KUKAN, localExplain: localExplainKukan,
  },
  data: {
    name: "データの活用", bossName: "ノイズ・ゴーレム",
    tokens: ["平均", "中央", "最頻", "範囲", "度数", "0.25", "%", "階級"],
    genKihon: genKihon_data, pool: termPool(DATA_TERMS), genStd: genStd_data,
    genOyou: (lv) => genOyouV(lv, OYOU_DATA_SYS, ["mean", "median", "range", "rel", "prob"]), // 37_math_oyou_ai.jsx（答えはアプリが計算）
    explain: EXPLAIN_DATA, localExplain: localExplainData,
  },
};
/* 部屋の並び順（試練の間の上から）。i 番目 → 単元キー */
const MATH_UNIT_KEYS = ["seifu", "moji", "houtei", "hirei", "heimen", "kukan", "data"];

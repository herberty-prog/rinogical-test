/* ================= 素材パス（画像をここに置けば自動で差し替わる）=================
   ・置き場所：リポジトリ直下の assets/ フォルダ（index.html と同じ階層に作る）。
   ・ファイルが無い／読めない場合は、今までのSVGが自動で表示される（真っ白にならない）。
   ・1枚ずつ足してOK。足したパスのキャラ・ボスだけ絵に入れ替わる。
   ・背景・Lottie は次のステップで実装予定（ここに足していく）。 */
const ASSET_BASE = "assets/";
const assetUrl = (rel) => (rel ? ASSET_BASE + rel : null);
const ASSETS = {
  bosses: {
    darknumber: "bosses/darknumber.png", // ダーク・ナンバー（正負の数のボス）
  },
  backgrounds: {
    adventure: "bg/adventure.png", // 全画面の背景（無ければ今までのグラデーション）
  },
  teachers: {
    magi: "teachers/magi.png", // マギ（数学）
    rumi: "teachers/rumi.png", // ルミ（英語）
    sora: "teachers/sora.png", // ソラ（国語）
    mils: "teachers/mils.png", // ミルス（理科）
    kros: "teachers/kros.png", // クロス（社会）
  },
};

/* ================= Lottie素材パス（あれば使う／無ければ画像→SVGへ自動で戻る）=========
   ・置き場所：assets/lottie/ 配下に .json（または .lottie）を置く。
   ・assetUrl() で参照する（例：assetUrl(LOTTIE.chars.myao) → "assets/lottie/myao.json"）。
   ・ファイルが無い／読めない場合は onFail が呼ばれ、Heroが従来の画像/SVGに自動で戻る。 */
const LOTTIE = {
  chars: {
    // 表情ごとにファイルを分ける。無いものは idle にフォールバック→それも無ければ画像/SVG。
    myao: { idle: "lottie/myao_idle.json", happy: "lottie/myao_happy.json", sad: "lottie/myao_sad.json" },
    ruu:  { idle: "lottie/ruu_idle.json",  happy: "lottie/ruu_happy.json",  sad: "lottie/ruu_sad.json" },
  },
};

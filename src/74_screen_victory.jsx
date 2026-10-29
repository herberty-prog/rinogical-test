/* ---------- 勝利 ---------- */
function Victory({ char, level, coins, nickname, onHome }) {
  // 勝利画面のキャラだけ Lottie を試す（無ければ従来の画像/SVGに自動で戻る）
  const heroLottie = char && char.id ? LOTTIE.chars[char.id] : null;
  const heroLottieSet = heroLottie ? {
    idle: assetUrl(heroLottie.idle), happy: assetUrl(heroLottie.happy), sad: assetUrl(heroLottie.sad),
  } : null;
  return (
    <div style={{ textAlign: "center", animation: "rino-pop .4s ease" }}>
      <div style={{ position: "relative" }}>
        <Hero accent={char?.accent} mood="happy" size={170} src={assetUrl(char?.img)} lottieSet={heroLottieSet} />
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 900, color: C.gold, textShadow: `0 0 20px ${C.gold}` }}>{t("sealBroken")}</h2>
      <p style={{ color: C.inkDim, margin: "6px 0 18px" }}>{t("guardianReturned")}<br />{t("wellDone", nickname)}</p>
      <div style={{ ...clay(C.bg1), padding: 18, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-around", fontWeight: 900 }}>
          <span><Star size={18} color={C.butter} style={{ verticalAlign: "-3px" }} /> Lv.{level}</span>
          <span><Coins size={18} color={C.gold} style={{ verticalAlign: "-3px" }} /> {coins}</span>
          <span><Heart size={18} color={C.danger} style={{ verticalAlign: "-3px" }} /> {t("clear")}</span>
        </div>
      </div>
      <Btn full bg={C.aqua} onClick={onHome}>{t("backToTrialsBtn")}</Btn>
    </div>
  );
}

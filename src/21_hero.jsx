/* ================= キャラクター（猫耳・セーラー）================= */
function Hero({ mood = "idle", accent = C.lav, size = 200, src = null, lottieSet = null }) {
  const [imgErr, setImgErr] = useState(false);
  const [lottieErr, setLottieErr] = useState(false);
  const anim =
    mood === "happy" ? "rino-happy .9s ease" :
    mood === "sad" ? "rino-sad .7s ease" :
    "rino-float 3.2s ease-in-out infinite";
  const mouth =
    mood === "happy" ? "M78 138 Q100 168 122 138" :
    mood === "sad" ? "M80 150 Q100 134 120 150" :
    "M84 142 Q100 156 116 142";
  // ① Lottieがあればそれを再生（mood別→idle→画像→SVG の順にフォールバック）
  const lottiePick = lottieSet ? (lottieSet[mood] || lottieSet.idle || null) : null;
  if (lottiePick && !lottieErr) {
    return (
      <div style={{ width: size, height: size, position: "relative" }}>
        {mood === "happy" && [0, 1, 2, 3].map(i => (
          <Sparkles key={i} size={20 + i * 4} color={C.gold}
            style={{ position: "absolute", top: 10 + (i % 2) * 120, left: i < 2 ? -6 : size - 26,
              animation: `rino-spark .9s ease ${i * 0.08}s` }} />
        ))}
        <LottieView src={lottiePick} size={size} loop={mood === "idle"} onFail={() => setLottieErr(true)} />
      </div>
    );
  }
  // ② 画像があればそれを表示（読み込み失敗時は下のSVGに自動フォールバック）
  if (src && !imgErr) {
    return (
      <div style={{ width: size, height: size, position: "relative" }}>
        {mood === "happy" && [0, 1, 2, 3].map(i => (
          <Sparkles key={i} size={20 + i * 4} color={C.gold}
            style={{ position: "absolute", top: 10 + (i % 2) * 120, left: i < 2 ? -6 : size - 26,
              animation: `rino-spark .9s ease ${i * 0.08}s` }} />
        ))}
        <img src={src} alt="" width={size} height={size} onError={() => setImgErr(true)}
          style={{ width: size, height: size, objectFit: "contain", display: "block", animation: anim }} />
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      {mood === "happy" && [0, 1, 2, 3].map(i => (
        <Sparkles key={i} size={20 + i * 4} color={C.gold}
          style={{ position: "absolute", top: 10 + (i % 2) * 120, left: i < 2 ? -6 : size - 26,
            animation: `rino-spark .9s ease ${i * 0.08}s` }} />
      ))}
      <svg viewBox="0 0 200 210" width={size} height={size} style={{ animation: anim, overflow: "visible" }}>
        <defs>
          <radialGradient id="hg" cx="40%" cy="32%"><stop offset="0%" stopColor="#fffdf8" /><stop offset="100%" stopColor="#ffe8d6" /></radialGradient>
          <radialGradient id="ha" cx="38%" cy="30%"><stop offset="0%" stopColor="#fff" stopOpacity=".85" /><stop offset="60%" stopColor={accent} /><stop offset="100%" stopColor="#7d63c4" /></radialGradient>
        </defs>
        {/* 影 */}
        <ellipse cx="100" cy="198" rx="52" ry="10" fill="#000" opacity=".28" />
        {/* 猫耳 */}
        <path d="M52 56 L40 16 L84 44 Z" fill="url(#ha)" />
        <path d="M148 56 L160 16 L116 44 Z" fill="url(#ha)" />
        <path d="M54 50 L48 28 L74 44 Z" fill={C.pink} opacity=".8" />
        <path d="M146 50 L152 28 L126 44 Z" fill={C.pink} opacity=".8" />
        {/* 体・セーラー */}
        <path d="M58 150 Q100 130 142 150 L150 196 Q100 208 50 196 Z" fill="url(#ha)" />
        <path d="M70 142 L100 168 L130 142 L122 178 L78 178 Z" fill="#fbf7ff" />
        <rect x="92" y="150" width="16" height="26" rx="6" fill={C.aqua} />
        {/* 頭 */}
        <circle cx="100" cy="96" r="56" fill="url(#hg)" />
        {/* 前髪 */}
        <path d="M44 92 Q46 44 100 42 Q154 44 156 92 Q150 70 128 66 Q132 80 116 82 Q118 64 100 62 Q102 80 84 82 Q88 66 72 68 Q52 74 44 92 Z" fill="url(#ha)" />
        {/* 目 */}
        <ellipse cx="80" cy="104" rx="9" ry="12" fill="#2b1f4a" />
        <ellipse cx="120" cy="104" rx="9" ry="12" fill="#2b1f4a" />
        <circle cx="83" cy="100" r="3.4" fill="#fff" />
        <circle cx="123" cy="100" r="3.4" fill="#fff" />
        {/* ほっぺ */}
        <circle cx="64" cy="118" r="8" fill={C.pink} opacity=".7" />
        <circle cx="136" cy="118" r="8" fill={C.pink} opacity=".7" />
        {/* 口 */}
        <path d={mouth} fill="none" stroke="#b56a7e" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

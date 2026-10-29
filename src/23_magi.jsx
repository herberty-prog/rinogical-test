/* ================= 先生キャラ：マギ先生（眼鏡・杖・数字が浮かぶローブ）================= */
function Magi({ size = 116 }) {
  return (
    <div style={{ width: size, height: size * 1.18, position: "relative", animation: "rino-float 3.6s ease-in-out infinite" }}>
      <svg viewBox="0 0 160 190" width={size} height={size * 1.18} style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id="mrobe" cx="40%" cy="22%"><stop offset="0%" stopColor="#d8caf6" /><stop offset="100%" stopColor="#6f56b8" /></radialGradient>
          <radialGradient id="mskin" cx="40%" cy="32%"><stop offset="0%" stopColor="#fffdf8" /><stop offset="100%" stopColor="#ffe8d6" /></radialGradient>
          <radialGradient id="morb" cx="38%" cy="32%"><stop offset="0%" stopColor="#fff" /><stop offset="55%" stopColor={C.aqua} /><stop offset="100%" stopColor="#2a8f8a" /></radialGradient>
        </defs>
        <ellipse cx="80" cy="180" rx="46" ry="9" fill="#000" opacity=".3" />
        {/* 杖（つえ）＋光る玉 */}
        <line x1="126" y1="58" x2="120" y2="178" stroke="#9a774f" strokeWidth="7" strokeLinecap="round" />
        <circle cx="128" cy="50" r="13" fill="url(#morb)" style={{ animation: "rino-rune 2.4s ease-in-out infinite" }} />
        {/* ローブ（数字が浮かぶ）*/}
        <path d="M48 116 Q80 100 112 116 L126 178 Q80 190 34 178 Z" fill="url(#mrobe)" stroke="#5f47a3" strokeWidth="2" />
        {["3", "-2", "5", "-1", "7"].map((n, i) => (
          <text key={i} x={44 + i * 17} y={168} fontSize="13" fontWeight="800" fill={i % 2 ? C.aqua : C.gold}
            style={{ animation: `rino-numrise ${2.6 + i * 0.4}s ease-in-out ${i * 0.4}s infinite` }}>{n}</text>
        ))}
        {/* 杖を持つ腕 */}
        <path d="M104 124 Q120 116 122 86" fill="none" stroke="#7d63c4" strokeWidth="12" strokeLinecap="round" />
        {/* 頭 */}
        <circle cx="80" cy="74" r="40" fill="url(#mskin)" />
        {/* 髪 */}
        <path d="M42 76 Q44 34 80 32 Q116 34 118 76 Q112 56 96 54 Q98 46 80 46 Q62 46 64 54 Q48 56 42 76 Z" fill="#574675" />
        {/* 眼鏡（めがね）*/}
        <circle cx="66" cy="80" r="13" fill="#bfe9ff" opacity=".35" stroke="#3a2f5c" strokeWidth="3" />
        <circle cx="94" cy="80" r="13" fill="#bfe9ff" opacity=".35" stroke="#3a2f5c" strokeWidth="3" />
        <line x1="78" y1="80" x2="82" y2="80" stroke="#3a2f5c" strokeWidth="3" />
        {/* 目・口 */}
        <circle cx="66" cy="82" r="4" fill="#2b1f4a" />
        <circle cx="94" cy="82" r="4" fill="#2b1f4a" />
        <path d="M70 100 Q80 108 90 100" fill="none" stroke="#b56a7e" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

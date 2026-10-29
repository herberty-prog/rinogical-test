/* ================= ボス：ダーク・ナンバー ================= */
function DarkNumber({ hit, src = assetUrl(ASSETS.bosses.darknumber), tokens }) {
  const [imgErr, setImgErr] = useState(false);
  const useImg = src && !imgErr;
  const nums = tokens && tokens.length ? tokens : ["7", "-3", "5", "-8", "0", "-1", "9", "-4"];
  return (
    <div style={{ width: 240, height: 200, position: "relative", margin: "0 auto" }}>
      {nums.map((n, i) => (
        <span key={i} style={{
          position: "absolute", left: 24 + (i * 27) % 200, top: 120,
          fontWeight: 800, fontSize: 18 + (i % 3) * 6, color: i % 2 ? C.aqua : C.gold,
          textShadow: "0 0 10px rgba(110,231,224,.7)",
          animation: `rino-numrise ${2.4 + (i % 4) * 0.5}s ease-in-out ${i * 0.3}s infinite`,
        }}>{n}</span>
      ))}
      <div style={{ animation: hit ? "rino-hit .45s ease" : "rino-slime 2.6s ease-in-out infinite" }}>
        {useImg ? (
          <img src={src} alt="" width={200} height={170} onError={() => setImgErr(true)}
            style={{ objectFit: "contain", display: "block", margin: "0 auto" }} />
        ) : (
        <svg viewBox="0 0 240 200" width={240} height={200} style={{ overflow: "visible" }}>
          <defs>
            <radialGradient id="sl" cx="42%" cy="34%"><stop offset="0%" stopColor="#3a2a63" /><stop offset="100%" stopColor={C.slime} /></radialGradient>
          </defs>
          <ellipse cx="120" cy="182" rx="74" ry="12" fill="#000" opacity=".35" />
          <path d="M40 150 Q26 96 70 78 Q92 40 120 64 Q150 40 172 80 Q216 98 200 152 Q204 184 120 184 Q36 184 40 150 Z" fill="url(#sl)" stroke="#5b3fa0" strokeWidth="3" />
          <ellipse cx="86" cy="92" rx="16" ry="10" fill="#fff" opacity=".12" />
          <circle cx="96" cy="128" r="13" fill={C.gold} /><circle cx="98" cy="130" r="6" fill="#1a1430" />
          <circle cx="148" cy="128" r="13" fill={C.gold} /><circle cx="150" cy="130" r="6" fill="#1a1430" />
          <path d="M96 158 Q120 146 144 158" fill="none" stroke="#9b7fd6" strokeWidth="4" strokeLinecap="round" />
        </svg>
        )}
      </div>
    </div>
  );
}

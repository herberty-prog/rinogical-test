/* ================= ヘッダーHUD ================= */
function HUD({ level, coins, name }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center", flexWrap: "wrap", marginBottom: 14 }}>
      {level != null && <Pill icon={<Star size={16} color={C.bg0} />} text={`Lv.${level}`} bg={C.butter} />}
      <Pill icon={<Coins size={16} color={C.bg0} />} text={`${coins}`} bg={C.gold} />
      <span style={{ color: C.inkDim, fontWeight: 700, fontSize: 14 }}>{name}</span>
    </div>
  );
}
function Pill({ icon, text, bg }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, background: bg,
      color: C.bg0, fontWeight: 800, fontSize: 14, boxShadow: "inset 3px 3px 6px rgba(255,255,255,.5), 3px 4px 9px rgba(0,0,0,.35)" }}>
      {icon}{text}
    </span>
  );
}

/* ボタン */
function Btn({ children, onClick, bg = C.lav, color = C.bg0, full, style, disabled }) {
  return (
    <button className="rino-btn" onClick={onClick} disabled={disabled}
      style={{ ...clay(disabled ? "#6b5f8f" : bg), color, border: "none", padding: "14px 22px", fontSize: 17, fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer", width: full ? "100%" : "auto", opacity: disabled ? .6 : 1, ...style }}>
      {children}
    </button>
  );
}

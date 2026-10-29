/* ================= HPゲージ ================= */
function HPBar({ label, value, max, color }) {
  const pct = Math.max(0, (value / max) * 100);
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.inkDim, marginBottom: 4, fontWeight: 700 }}>
        <span>{label}</span><span>{Math.max(0, value)}/{max}</span>
      </div>
      <div style={{ height: 18, borderRadius: 12, background: "rgba(0,0,0,.4)", boxShadow: "inset 2px 2px 6px rgba(0,0,0,.6)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 12, background: color, transition: "width .5s ease", boxShadow: "inset 0 2px 4px rgba(255,255,255,.5)" }} />
      </div>
    </div>
  );
}

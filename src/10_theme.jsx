/* ---------- パレット（粘土風パステル × 暗黒）---------- */
const C = {
  bg0: "#160f2e",
  bg1: "#241844",
  bg2: "#2e1f57",
  ink: "#f6f1ff",
  inkDim: "#c9bdf0",
  lav: "#b9a7e8",
  mint: "#a7e8cf",
  peach: "#f5c6a5",
  pink: "#f4b8d6",
  butter: "#f6e4a4",
  aqua: "#6ee7e0",
  gold: "#ffd56b",
  danger: "#ff8fb0",
  slime: "#1c1330",
};

/* 粘土ぷっくり影 */
const clay = (base, raised = true) => ({
  background: base,
  borderRadius: 28,
  boxShadow: raised
    ? "inset 5px 5px 10px rgba(255,255,255,.45), inset -6px -6px 12px rgba(0,0,0,.22), 8px 10px 22px rgba(0,0,0,.45)"
    : "inset -5px -5px 10px rgba(255,255,255,.35), inset 6px 6px 12px rgba(0,0,0,.28), 4px 5px 12px rgba(0,0,0,.4)",
});

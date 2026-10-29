/* ================= 答え合わせ（数値／文字 両対応）================= */
function normText(s) {
  return String(s == null ? "" : s).trim().toLowerCase()
    .replace(/\s+/g, " ").replace(/[.．。!?！？]+$/,"");
}
function sameAns(val, p) {
  return p && p.type === "number" ? val === p.a : normText(val) === normText(p.a);
}

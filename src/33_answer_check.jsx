/* ================= 答え合わせ（数値／文字 両対応）================= */
/* iPhone のキーボードは ' を ’ に変えることがある（don’t）。どちらも同じ ' として扱う */
function normText(s) {
  return String(s == null ? "" : s).trim().toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/\s+/g, " ").replace(/[.．。!?！？]+$/,"");
}
/* p.alts … 入力問題で、正解として認める別の書き方（例：can't のほかに cannot）。4択では使わない */
function sameAns(val, p) {
  if (p && p.type === "number") return val === p.a;
  const v = normText(val);
  return v === normText(p.a) || (p && p.ui === "input" && (p.alts || []).some(x => v === normText(x)));
}

/* ---------- 先生アイコン（画像があれば画像／無ければ絵文字）---------- */
function TeacherIcon({ src, emoji, size = 50, dim = false }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return (
      <img src={src} alt="" width={size} height={size} onError={() => setErr(true)}
        style={{ width: size, height: size, objectFit: "contain", display: "block",
          filter: dim ? "grayscale(.55) brightness(.85)" : "none" }} />
    );
  }
  return <div style={{ fontSize: size * 0.72, lineHeight: 1, opacity: dim ? .85 : 1 }}>{emoji}</div>;
}

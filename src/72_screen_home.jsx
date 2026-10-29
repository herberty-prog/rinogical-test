/* ---------- 科目をえらぶ（Phase2 ホーム）---------- */
function SubjectHome({ char, coins, nickname, onMath, onEnglish, onKokugo, onRika, onShakai }) {
  const [soon, setSoon] = useState(false);
  const emojis = ["➗", "🔤", "✍️", "🔬", "🌏"];
  const teacherIds = ["magi", "rumi", "sora", "mils", "kros"];
  const open = [true, true, true, true, true]; // 数学・英語・国語・理科・社会を開放
  const handlers = [onMath, onEnglish, onKokugo, onRika, onShakai];
  const subs = t("subjects").map((s, i) => ({
    ...s, emoji: emojis[i], open: open[i],
    teacherImg: assetUrl(ASSETS.teachers[teacherIds[i]]),
  }));
  return (
    <div style={{ animation: "rino-pop .4s ease", position: "relative", minHeight: 520 }}>
      <HUD level={null} coins={coins} name={nickname} />
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <Hero accent={char?.accent} size={110} src={assetUrl(char?.img)} />
      </div>
      <h2 style={{ textAlign: "center", fontSize: 20, fontWeight: 900, marginBottom: 14 }}>{t("chooseSubject")}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {subs.map((s, i) => (
          <button key={i} className="rino-btn"
            onClick={s.open ? (handlers[i] || onMath) : () => setSoon(true)}
            style={{ ...clay(s.open ? C.bg1 : "#221a3d"), border: "none", padding: "16px 12px", textAlign: "center",
              cursor: "pointer", opacity: s.open ? 1 : .6,
              ...(s.open ? { animation: "rino-glow 2.6s ease-in-out infinite" } : {}) }}>
            <div style={{ position: "relative", display: "inline-block", marginBottom: 4 }}>
              <TeacherIcon src={s.teacherImg} emoji={s.emoji} size={52} dim={!s.open} />
              {!s.open && <span style={{ position: "absolute", top: -6, right: -10, fontSize: 16 }}>🔒</span>}
            </div>
            <div style={{ fontWeight: 900, fontSize: 16, color: s.open ? C.aqua : C.inkDim }}>{s.name}</div>
            <div style={{ fontSize: 11, color: C.inkDim, marginTop: 2 }}>{s.teacher}</div>
          </button>
        ))}
      </div>
      {soon && (
        <div style={{ ...clay(C.bg1), marginTop: 14, padding: "12px 16px", textAlign: "center",
          color: C.gold, fontWeight: 800, fontSize: 14, animation: "rino-pop .3s ease" }}>
          {t("comingSoon")}
        </div>
      )}
    </div>
  );
}

/* ---------- ホーム（試練の間）---------- */
function Home({ char, level, coins, nickname, onBoss, onBack }) {
  const [devOpen, setDevOpen] = useState(false);
  // 開放フラグだけコード側に残し、name/sub は辞書（t("rooms")）から取る
  const roomOpen = [true, true, true];
  const rooms = t("rooms").map((r, i) => ({ ...r, open: roomOpen[i] }));
  return (
    <div style={{ animation: "rino-pop .4s ease", position: "relative", minHeight: 520 }}>
      <HUD level={level} coins={coins} name={nickname} />
      <div style={{ textAlign: "center", marginBottom: 6 }}><Hero accent={char?.accent} size={120} src={assetUrl(char?.img)} /></div>
      <h2 style={{ textAlign: "center", fontSize: 20, fontWeight: 900, marginBottom: 14 }}>{t("chooseTrial")}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {rooms.map((r, i) => (
          <button key={i} className="rino-btn" disabled={!r.open} onClick={r.open ? () => onBoss(i) : undefined}
            style={{ ...clay(r.open ? C.bg1 : "#221a3d"), border: "none", padding: "16px 18px", textAlign: "left",
              display: "flex", alignItems: "center", gap: 12, cursor: r.open ? "pointer" : "default", opacity: r.open ? 1 : .55,
              ...(r.open ? { animation: "rino-glow 2.6s ease-in-out infinite" } : {}) }}>
            <div style={{ fontSize: 30 }}>{r.open ? "🗝️" : <Lock size={26} color={C.inkDim} />}</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 16, color: r.open ? C.aqua : C.inkDim }}>{r.name}</div>
              <div style={{ fontSize: 12, color: C.inkDim }}>{r.sub}</div>
            </div>
          </button>
        ))}
      </div>

      {onBack && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={onBack} className="rino-btn"
            style={{ background: "transparent", border: "none", color: C.inkDim, fontWeight: 700,
              fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
            {t("backToSubjects")}
          </button>
        </div>
      )}

      {/* 開発者用：極小・薄色の隠しボタン（右下隅）。DEV_PANEL_ENABLED=false で消える */}
      {DEV_PANEL_ENABLED && (
        <button onClick={() => setDevOpen(true)} aria-label="dev"
          style={{ position: "absolute", right: 2, bottom: 2, width: 22, height: 16, padding: 0,
            background: "transparent", border: "none", color: "rgba(255,255,255,.12)",
            fontSize: 9, fontWeight: 700, letterSpacing: .5, cursor: "pointer", lineHeight: "16px" }}>
          dev
        </button>
      )}
      {DEV_PANEL_ENABLED && devOpen && <DevPanel onClose={() => setDevOpen(false)} />}
    </div>
  );
}

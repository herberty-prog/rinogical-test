/* ---------- ローディング ---------- */
function Loading({ tip }) {
  return (
    <div style={{ textAlign: "center", paddingTop: 80 }}>
      <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: 1, color: C.ink, textShadow: `0 0 24px ${C.lav}` }}>Rinogical</div>
      <div style={{ color: C.inkDim, marginTop: 4, fontWeight: 700 }}>{t("appSubtitle")}</div>
      <div style={{ margin: "34px auto", width: 70, height: 70, borderRadius: "50%",
        border: `7px solid rgba(255,255,255,.12)`, borderTopColor: C.aqua, animation: "rino-spin 1s linear infinite" }} />
      <div style={{ ...clay(C.bg1), padding: "12px 16px", color: C.inkDim, fontSize: 14, fontWeight: 700, maxWidth: 320, margin: "0 auto" }}>
        <span style={{ color: C.gold }}>{t("tipLabel")}</span>{tip}
      </div>
    </div>
  );
}

/* ---------- キャラ選択 ---------- */
const CHARACTERS = [
  { id: "myao", name: "ミャオ", accent: C.lav, desc: "ねこ耳の見習い魔導士", img: "chars/myao.png" },
  { id: "ruu", name: "ルゥ", accent: C.mint, desc: "しっぽが自慢の魔法使い", img: "chars/ruu.png" },
];

function CharacterSelect({ onPick }) {
  const chars = CHARACTERS;
  return (
    <div style={{ textAlign: "center", animation: "rino-pop .4s ease" }}>
      <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{t("chooseBuddy")}</h2>
      <p style={{ color: C.inkDim, marginBottom: 18, fontSize: 14 }}>{t("chooseBuddySub")}</p>
      <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
        {chars.map(c => (
          <button key={c.id} className="rino-btn" onClick={() => onPick(c)}
            style={{ ...clay(C.bg1), border: "none", padding: 14, cursor: "pointer", width: 180 }}>
            <Hero accent={c.accent} size={150} src={assetUrl(c.img)} />
            <div style={{ fontWeight: 900, fontSize: 18, color: c.accent }}>{c.name}</div>
            <div style={{ fontSize: 12, color: C.inkDim, marginTop: 2 }}>{t("charDesc")[c.id]}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- 名前入力 ---------- */
function NameInput({ accent, imgSrc, nickname, setNickname, onNext }) {
  const field = { ...clay(C.bg1, false), border: "none", outline: "none", color: C.ink, fontSize: 16,
    padding: "13px 16px", width: "100%", fontWeight: 700, marginTop: 6 };
  return (
    <div style={{ textAlign: "center", animation: "rino-pop .4s ease" }}>
      <Hero accent={accent} size={130} src={imgSrc} />
      <h2 style={{ fontSize: 22, fontWeight: 900, margin: "8px 0 6px" }}>{t("nameTitle")}</h2>
      <p style={{ color: C.inkDim, fontSize: 13, marginBottom: 18 }}>{t("nameSub")}</p>
      <div style={{ textAlign: "left", marginBottom: 22 }}>
        <label style={{ fontWeight: 800, color: C.inkDim, fontSize: 14 }}>{t("nickLabel")}</label>
        <input style={field} value={nickname} onChange={e => setNickname(e.target.value)} placeholder={t("nickPlaceholder")} maxLength={16} />
      </div>
      <Btn full bg={accent} onClick={onNext} disabled={!nickname.trim()}>
        {t("next")} <ArrowRight size={18} style={{ verticalAlign: "-3px" }} />
      </Btn>
    </div>
  );
}

/* ---------- ログインし直し（11_firebase.jsx の fb.needLogin のとき） ----------
   メール登録済みのセーブがあった端末でログインが切れたときに出す。ここでは新しいセーブを作らない
   （作ると空のセーブで始まり、本物のセーブが見えなくなるため）。ログインできたら再起動する */
function ReLogin({ email0 }) {
  const [email, setEmail] = useState(email0 || "");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const field = { ...clay(C.bg1, false), border: "none", outline: "none", color: C.ink, fontSize: 16,
    padding: "13px 16px", width: "100%", fontWeight: 700, marginTop: 6, marginBottom: 12, boxSizing: "border-box" };
  const doLogin = async () => {
    setBusy(true); setMsg("");
    try { await loginEmail(email, pw); location.reload(); }
    catch (e) { setMsg(authErrorText(e)); setBusy(false); }
  };
  const doReset = async () => {
    if (!email.trim()) { setMsg(authErrorText({ code: "auth/missing-email" })); return; }
    setBusy(true); setMsg("");
    try { await resetPassword(email); setMsg(t("reloginSent")); }
    catch (e) { setMsg(authErrorText(e)); }
    setBusy(false);
  };
  return (
    <div style={{ textAlign: "center", animation: "rino-pop .4s ease" }}>
      <h2 style={{ fontSize: 22, fontWeight: 900, margin: "8px 0 6px" }}>{t("reloginTitle")}</h2>
      <p style={{ color: C.inkDim, fontSize: 13, marginBottom: 18, lineHeight: 1.6 }}>{t("reloginSub")}</p>
      <div style={{ textAlign: "left" }}>
        <label style={{ fontWeight: 800, color: C.inkDim, fontSize: 14 }}>{t("reloginEmail")}</label>
        <input style={field} type="email" value={email} onChange={e => setEmail(e.target.value)} autoCapitalize="off" autoCorrect="off" spellCheck={false} />
        <label style={{ fontWeight: 800, color: C.inkDim, fontSize: 14 }}>{t("reloginPw")}</label>
        <input style={field} type="password" value={pw} onChange={e => setPw(e.target.value)} />
      </div>
      <Btn full bg={C.aqua} onClick={doLogin} disabled={busy || !email.trim() || pw.length < 6}>{t("reloginBtn")}</Btn>
      <button onClick={doReset} disabled={busy} style={{ background: "none", border: "none", color: C.inkDim, fontSize: 13, fontWeight: 700,
        textDecoration: "underline", marginTop: 14, cursor: "pointer", fontFamily: "inherit" }}>{t("reloginForgot")}</button>
      {msg && <div style={{ fontSize: 13, color: C.gold, marginTop: 10, lineHeight: 1.6 }}>{msg}</div>}
    </div>
  );
}

/* ---------- チュートリアル ---------- */
function Tutorial({ char, nickname, onStart }) {
  return (
    <div style={{ textAlign: "center", animation: "rino-pop .4s ease" }}>
      <Hero accent={char?.accent} mood="idle" size={140} src={assetUrl(char?.img)} />
      <div style={{ ...clay(C.bg1), padding: 20, textAlign: "left", margin: "10px 0 18px", lineHeight: 1.8, fontSize: 15 }}>
        <p>{t("tutHello")}<b style={{ color: char?.accent }}>{nickname}</b>{t("tutHelloEnd")}</p>
        <p style={{ marginTop: 8 }}>{t("tutCurse")}</p>
        <p style={{ marginTop: 8 }}>{t("tutSeal")}</p>
        <p style={{ marginTop: 8 }}>{t("tutMechanism")}</p>
      </div>
      <Btn full bg={C.aqua} onClick={onStart}>{t("startAdventure")}</Btn>
    </div>
  );
}

/* ===========================================================================
   開発者用：隠し進捗パネル
   ▼ 本番リリース時はここを false にするだけで「dev」ボタンごと消えます ▼
   =========================================================================== */
const DEV_PANEL_ENABLED = true;

/* 進捗チェックリスト。最新の設計図＝CLAUDE.md「開発ロードマップ（最新の設計図）」と同じ並び・同じ内容にそろえること。
   future: true のグループは「時期未定の構想」なので、上の「全体 ○/○ 完了」の数には入れない。 */
const PROGRESS = [
  { phase: "土台（できていること）", items: [
    { t: "ローディング画面＋豆知識", done: true },
    { t: "キャラクター選択（2体）・ニックネーム・チュートリアル", done: true },
    { t: "科目選択ホーム＋試練の間（単元選択）", done: true },
    { t: "バトル（4択・数値入力・ならべかえ）", done: true },
    { t: "AI解説（先生ごと・なんで？／もっとかんたんに）", done: true },
    { t: "コイン・レベル（科目ごと）・勝利画面", done: true },
    { t: "5教科：数学3単元・英語・国語（漢字）・理科（植物）・社会（世界の姿）", done: true },
    { t: "PWA（ホーム画面に追加）", done: true },
    { t: "Lottieアニメ（キャラの待機）", done: true },
    { t: "ファイル分割＋push時の自動ビルド", done: true },
    { t: "iPhoneの全画面表示の調整", done: true },
  ]},
  { phase: "フェーズ0：セキュリティ（ログイン・ロック）", items: [
    { t: "匿名ログイン＋セーブの自動引っ越し", done: true },
    { t: "メール＋パスワードの登録・ログイン", done: true },
    { t: "Firestoreのルールをロック（本人だけ読み書き）", done: true },
    { t: "メールアドレス変更・パスワード再設定", done: false },
    { t: "娘のアカウント登録（娘のiPhoneで）", done: false },
  ]},
  { phase: "フェーズ1：国語の構造整理＋語彙", items: [
    { t: "国語を2段構成に（科目→単元選択→バトル）", done: true },
    { t: "語彙ユニット（対義語・類義語・四字熟語）", done: true },
  ]},
  { phase: "フェーズ2：国語の文法・古文", items: [
    { t: "文法（言葉の単位・文の成分・品詞・敬語の基本）", done: true },
    { t: "古文（歴史的仮名遣い・古語・竹取物語）", done: true },
  ]},
  { phase: "フェーズ3：検証のしくみ＋漢字の差し替え", items: [
    { t: "問題の自動チェック（正解が1つか・選択肢の重複など）", done: false },
    { t: "漢字を中1の392字から50字ずつ差し替え", done: false },
  ]},
  { phase: "フェーズ4：問題数を増やす", items: [
    { t: "数学を型・数値生成で100問以上に", done: false },
    { t: "選択肢のシャッフル（丸暗記の防止）", done: false },
    { t: "英語・国語・理科・社会の問題数を増やす", done: false },
  ]},
  { phase: "フェーズ5：単元を増やす", items: [
    { t: "学校の進度に合わせて各教科の単元を追加", done: false },
    { t: "社会の歴史分野（東京書籍）", done: false },
  ]},
  { phase: "フェーズ6：整理", items: [
    { t: "多言語対応の仕上げ（残りの画面を t() に）", done: false },
    { t: "単元・教科の並べ替え", done: false },
  ]},
  { phase: "フェーズ7：読解ユニット", items: [
    { t: "設計を決める（短文4択か、読解の間か）", done: false },
    { t: "実装（規模は設計のあとで判断）", done: false },
  ]},
  { phase: "フェーズ8：親の確認画面", items: [
    { t: "何を表示するか決める打ち合わせ", done: false },
    { t: "親の確認画面を作る", done: false },
  ]},
  { phase: "並行：素材", items: [
    { t: "キャラクター2体の画像", done: true },
    { t: "先生7人の画像", done: true },
    { t: "背景（冒険）1枚", done: true },
    { t: "ボスの絵：ダーク・ナンバー", done: true },
    { t: "残りのボスの絵", done: false },
    { t: "科目ごとの背景", done: false },
  ]},
  { phase: "将来の構想（最初の仕様書より・時期未定）", future: true, items: [
    { t: "音・BGM（オン/オフ）", done: false },
    { t: "文字サイズ・夜間モード・ヘルプ", done: false },
    { t: "キャラクターを6種類に", done: false },
    { t: "ショップ・レアリティ", done: false },
    { t: "ボス戦の強化（難易度・タイムアタック）", done: false },
    { t: "復習モード・間違いノート", done: false },
    { t: "気分転換ミニゲーム", done: false },
    { t: "目標設定・救済カード", done: false },
    { t: "デイリーボーナス・通知", done: false },
    { t: "LINE週次レポート・API費用表示", done: false },
    { t: "成長アルバム・親子メッセージ", done: false },
    { t: "プリント読み取り（AI）", done: false },
    { t: "AI・お金の授業（ナビス先生・ルーナ先生）", done: false },
    { t: "次女向け（小学生版は別リポジトリの予定）", done: false },
  ]},
];

/* セーブの引き継ぎ：セーブはFirebaseの users/{端末ID} にあり、端末IDはこの端末のlocalStorageにだけある。
   ホーム画面のアイコンを消すと端末IDが消えて新規扱いになるため、番号の確認と切り替えをここでできるようにする。
   iOSのホーム画面アプリでは window.confirm が効かないことがあるので、2回タップで確定する。 */
function DeviceTransfer() {
  const cur = getDeviceId();
  const [v, setV] = useState("");
  const [msg, setMsg] = useState("");
  const [armed, setArmed] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(cur); setMsg("今の番号をコピーしました。メモ帳などに保存しておいてください"); }
    catch (e) { setMsg("コピーできませんでした。番号を長押しして選んでください"); }
  };
  const apply = () => {
    const id = v.trim();
    if (!/^dev-[0-9a-z-]{8,}$/i.test(id)) { setMsg("番号の形がちがいます。dev- で始まる番号をそのまま貼り付けてください"); setArmed(false); return; }
    if (id === cur) { setMsg("今と同じ番号です"); setArmed(false); return; }
    if (!armed) { setArmed(true); setMsg("もう一度押すと切り替えて再起動します（今のセーブは使われなくなります）"); setTimeout(() => setArmed(false), 5000); return; }
    try { localStorage.setItem("rino_device_id", id); localStorage.setItem("rino_force_migrate", "1"); }
    catch (e) { setMsg("保存できませんでした"); return; }
    location.reload();
  };
  const box = { background: "#1b1828", border: "1px solid #34304a", borderRadius: 12, padding: 12, marginBottom: 14 };
  const btn = { border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 800, cursor: "pointer", fontSize: 12 };
  return (
    <div style={box}>
      <div style={{ fontWeight: 800, color: "#ffd56b", fontSize: 13, marginBottom: 6 }}>セーブの引き継ぎ</div>
      <div style={{ fontSize: 11, color: "#8a83a8", marginBottom: 4 }}>この端末の番号（控えておけばアイコンを消しても戻せます）</div>
      <div style={{ fontSize: 11, color: "#cfc7e6", wordBreak: "break-all", userSelect: "all", WebkitUserSelect: "all", marginBottom: 6 }}>{cur}</div>
      <button onClick={copy} style={{ ...btn, background: "#2a2740", color: "#cfc7e6", marginBottom: 10 }}>番号をコピー</button>
      <div style={{ fontSize: 11, color: "#8a83a8", marginBottom: 4 }}>前の番号に切り替える</div>
      <input value={v} onChange={e => { setV(e.target.value); setArmed(false); }} placeholder="dev-xxxxxxxx-xxxx-..."
        autoCapitalize="off" autoCorrect="off" spellCheck={false}
        style={{ width: "100%", boxSizing: "border-box", background: "#0e0c16", color: "#cfc7e6", border: "1px solid #34304a",
          borderRadius: 8, padding: "8px 10px", fontSize: 16, marginBottom: 8, fontFamily: "inherit" }} />
      <button onClick={apply} style={{ ...btn, background: armed ? "#e8a33a" : "#8be9c0", color: "#12101c" }}>
        {armed ? "もう一度押して確定" : "この番号に切り替える"}
      </button>
      {msg && <div style={{ fontSize: 11, color: "#ffd56b", marginTop: 8, lineHeight: 1.5 }}>{msg}</div>}
    </div>
  );
}

/* アカウント（親用）：匿名セーブにメール＋パスワードを登録しておくと、アイコンを消しても・別のiPhoneでも同じセーブに戻れる。
   ⚠ いまはdevパネルの中にある。DEV_PANEL_ENABLED を false にする前に、親が使える場所へ移すこと */
function AccountBox() {
  const [, force] = useState(0);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [armed, setArmed] = useState(false);
  const linked = fb.uid && !fb.isAnonymous;
  const status = !fb.uid ? "ログインしていません（Firebaseの設定待ち。今は端末IDで保存中）"
    : linked ? "登録済み：" + fb.email : "匿名でログイン中（メール未登録）";
  const check = () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { setMsg("メールアドレスの形がちがいます"); return false; }
    if (pw.length < 6) { setMsg("パスワードは6文字以上にしてください"); return false; }
    return true;
  };
  const doRegister = async () => {
    if (!check()) return;
    setBusy(true); setMsg("");
    try { await registerEmail(email, pw); setPw(""); setMsg("登録しました。このメールとパスワードを忘れないように控えてください"); force(n => n + 1); }
    catch (e) { setMsg(authErrorText(e)); }
    setBusy(false);
  };
  const doLogin = async () => {
    if (!check()) return;
    if (!armed) { setArmed(true); setMsg("もう一度押すとログインして再起動します（いまのセーブからそのメールのセーブに切り替わります）"); setTimeout(() => setArmed(false), 5000); return; }
    setBusy(true); setMsg("");
    try { await loginEmail(email, pw); location.reload(); }
    catch (e) { setMsg(authErrorText(e)); setArmed(false); setBusy(false); }
  };
  const box = { background: "#1b1828", border: "1px solid #34304a", borderRadius: 12, padding: 12, marginBottom: 14 };
  const btn = { border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 800, cursor: "pointer", fontSize: 12, marginRight: 8, marginBottom: 6 };
  const inp = { width: "100%", boxSizing: "border-box", background: "#0e0c16", color: "#cfc7e6", border: "1px solid #34304a",
    borderRadius: 8, padding: "8px 10px", fontSize: 16, marginBottom: 8, fontFamily: "inherit" };
  return (
    <div style={box}>
      <div style={{ fontWeight: 800, color: "#ffd56b", fontSize: 13, marginBottom: 6 }}>アカウント（親用）</div>
      <div style={{ fontSize: 11, color: linked ? "#9fe8c6" : "#cfc7e6", marginBottom: 8, lineHeight: 1.5 }}>{status}</div>
      <div style={{ fontSize: 11, color: "#8a83a8", marginBottom: 8, lineHeight: 1.5 }}>
        メールとパスワードを登録しておくと、アイコンを消しても・別のiPhoneでも「ログイン」で同じセーブに戻れます。
      </div>
      <input type="email" value={email} onChange={e => { setEmail(e.target.value); setArmed(false); }} placeholder="メールアドレス"
        autoCapitalize="off" autoCorrect="off" spellCheck={false} style={inp} />
      <input type="password" value={pw} onChange={e => { setPw(e.target.value); setArmed(false); }} placeholder="パスワード（6文字以上）" style={inp} />
      {fb.uid && !linked && (
        <button disabled={busy} onClick={doRegister} style={{ ...btn, background: "#8be9c0", color: "#12101c" }}>このセーブに登録</button>
      )}
      <button disabled={busy} onClick={doLogin} style={{ ...btn, background: armed ? "#e8a33a" : "#2a2740", color: armed ? "#12101c" : "#cfc7e6" }}>
        {armed ? "もう一度押して確定" : "登録済みのメールでログイン"}
      </button>
      {msg && <div style={{ fontSize: 11, color: "#ffd56b", marginTop: 4, lineHeight: 1.5 }}>{msg}</div>}
    </div>
  );
}

function DevPanel({ onClose }) {
  const allItems = PROGRESS.filter(p => !p.future).flatMap(p => p.items);
  const doneAll = allItems.filter(i => i.done).length;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(8,5,20,.82)",
      display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box",
      padding: "calc(env(safe-area-inset-top, 0px) + 12px) 12px calc(env(safe-area-inset-bottom, 0px) + 12px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, maxHeight: "100%", overflowY: "auto", boxSizing: "border-box",
        background: "#12101c", borderRadius: 18, border: "1px solid #34304a", padding: 16,
        fontFamily: "ui-monospace,Menlo,Consolas,monospace", color: "#cfc7e6" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontWeight: 800, color: "#8be9c0", fontSize: 14 }}>DEV / 進捗チェックリスト</span>
          <button onClick={onClose} style={{ background: "#2a2740", color: "#cfc7e6", border: "none", borderRadius: 8,
            padding: "5px 12px", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>閉じる ✕</button>
        </div>
        <div style={{ fontSize: 12, color: "#8a83a8", marginBottom: 12 }}>全体 {doneAll}/{allItems.length} 完了</div>
        <AccountBox />
        <DeviceTransfer />
        {PROGRESS.map((p, pi) => {
          const d = p.items.filter(i => i.done).length;
          return (
            <div key={pi} style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 800, color: "#ffd56b", fontSize: 13, marginBottom: 6, borderBottom: "1px solid #2a2740", paddingBottom: 4 }}>
                {p.phase}　<span style={{ color: "#6f6a88", fontWeight: 600 }}>({d}/{p.items.length})</span>
              </div>
              {p.items.map((it, ii) => (
                <div key={ii} style={{ display: "flex", gap: 8, fontSize: 13, lineHeight: 1.9,
                  color: it.done ? "#9fe8c6" : "#9b95b4" }}>
                  <span>{it.done ? "✅" : "⬜"}</span><span>{it.t}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

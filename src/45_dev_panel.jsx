/* ===========================================================================
   開発者用：隠し進捗パネル
   ▼ 本番リリース時はここを false にするだけで「dev」ボタンごと消えます ▼
   =========================================================================== */
const DEV_PANEL_ENABLED = true;

const PROGRESS = [
  { phase: "Phase 1", items: [
    { t: "ローディング画面＋豆知識", done: true },
    { t: "キャラクター選択（2体）", done: true },
    { t: "ニックネーム入力", done: true },
    { t: "チュートリアル", done: true },
    { t: "ホーム画面（試練の間）", done: true },
    { t: "バトル画面（正負の数）", done: true },
    { t: "超基本・標準・応用問題", done: true },
    { t: "Claude AI解説（マギ先生）", done: true },
    { t: "なんで？・もっとかんたんに2段階", done: true },
    { t: "コイン・レベルシステム", done: true },
    { t: "勝利画面", done: true },
    { t: "Firebase連携（データ保存）", done: true },
    { t: "PWA対応", done: false },
    { t: "Lottieアニメーション", done: false },
    { t: "キャラクター6種類", done: false },
    { t: "音・BGM", done: false },
  ]},
  { phase: "Phase 2", items: [
    { t: "全科目ホーム画面UI", done: false },
    { t: "ホーム画面背景6種類", done: false },
    { t: "文字サイズ設定（小・中・大）", done: false },
    { t: "夜間モード", done: false },
    { t: "ヘルプ機能", done: false },
  ]},
  { phase: "Phase 3", items: [
    { t: "ゲームシステム強化（ショップ・レアリティ）", done: false },
    { t: "Lottieアニメーション本実装", done: false },
    { t: "ボス戦強化（難易度選択・タイムアタック）", done: false },
    { t: "復習モード・間違いノート", done: false },
    { t: "気分転換ミニゲーム", done: false },
    { t: "目標設定システム", done: false },
    { t: "救済カード", done: false },
  ]},
  { phase: "Phase 4", items: [
    { t: "英語追加（光村図書）", done: false },
    { t: "国語追加（光村図書）", done: false },
    { t: "理科追加（東京書籍）", done: false },
    { t: "社会追加（帝国書院・東京書籍）", done: false },
    { t: "各科目の背景・先生キャラ追加", done: false },
  ]},
  { phase: "Phase 5", items: [
    { t: "親画面（別URL）", done: false },
    { t: "進捗管理・能力レベル判定", done: false },
    { t: "Firebase完全連携", done: false },
    { t: "プリント読取（Claude API）", done: false },
    { t: "成長アルバム", done: false },
  ]},
  { phase: "Phase 6", items: [
    { t: "音・BGM（オン/オフ切替）", done: false },
    { t: "LINE週次レポート", done: false },
    { t: "通知機能", done: false },
    { t: "デイリーボーナス", done: false },
    { t: "親子メッセージ機能", done: false },
    { t: "API費用表示", done: false },
  ]},
  { phase: "Phase 7", items: [
    { t: "AI世界・お金の授業", done: false },
    { t: "マルチユーザー対応", done: false },
    { t: "Stripe決済・サブスク化", done: false },
    { t: "次女アカウント追加", done: false },
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
    try { localStorage.setItem("rino_device_id", id); }
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
          borderRadius: 8, padding: "8px 10px", fontSize: 12, marginBottom: 8, fontFamily: "inherit" }} />
      <button onClick={apply} style={{ ...btn, background: armed ? "#e8a33a" : "#8be9c0", color: "#12101c" }}>
        {armed ? "もう一度押して確定" : "この番号に切り替える"}
      </button>
      {msg && <div style={{ fontSize: 11, color: "#ffd56b", marginTop: 8, lineHeight: 1.5 }}>{msg}</div>}
    </div>
  );
}

function DevPanel({ onClose }) {
  const allItems = PROGRESS.flatMap(p => p.items);
  const doneAll = allItems.filter(i => i.done).length;
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 50, background: "rgba(8,5,20,.82)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 12, borderRadius: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, maxHeight: "88%", overflowY: "auto",
        background: "#12101c", borderRadius: 18, border: "1px solid #34304a", padding: 16,
        fontFamily: "ui-monospace,Menlo,Consolas,monospace", color: "#cfc7e6" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontWeight: 800, color: "#8be9c0", fontSize: 14 }}>DEV / 進捗チェックリスト</span>
          <button onClick={onClose} style={{ background: "#2a2740", color: "#cfc7e6", border: "none", borderRadius: 8,
            padding: "5px 12px", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>閉じる ✕</button>
        </div>
        <div style={{ fontSize: 12, color: "#8a83a8", marginBottom: 12 }}>全体 {doneAll}/{allItems.length} 完了</div>
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

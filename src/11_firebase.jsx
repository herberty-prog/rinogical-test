/* ===========================================================================
   Firebase 連携（設定はここ1か所にまとめる。後から実プロジェクトの値に差し替え）
   - Artifactサンドボックスや未設定時は自動でローカル動作（保存しない）にフォールバック
   - エラーはconsoleに出すだけで、アプリは止めない
   =========================================================================== */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD7uAY50Bef2575lxjzuV5IBdahgzrhV7c",
  authDomain: "rinogical.firebaseapp.com",
  projectId: "rinogical",
  storageBucket: "rinogical.firebasestorage.app",
  messagingSenderId: "510843207944",
  appId: "1:510843207944:web:91a3b0095bd69203e3ecbd",
};

const FIREBASE_VER = "11.0.2"; // CDNから読むSDKのバージョン

/* 実行時に解決される firestore 関数の入れ物 */
const fb = { ready: false, db: null, doc: null, getDoc: null, setDoc: null, serverTimestamp: null,
  auth: null, authMod: null, uid: null, isAnonymous: true, email: null };
let _memDeviceId = null; // localStorageが使えない環境用の一時ID

/* 設定がプレースホルダーのままかどうか */
function firebaseConfigured() {
  return FIREBASE_CONFIG.apiKey && !FIREBASE_CONFIG.apiKey.startsWith("YOUR_");
}

/* デバイスごとのユニークID。localStorageに保存。使えなければメモリに退避 */
function getDeviceId() {
  const KEY = "rino_device_id";
  const make = () => {
    try { if (crypto?.randomUUID) return "dev-" + crypto.randomUUID(); } catch (e) {}
    return "dev-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  };
  try {
    let id = localStorage.getItem(KEY);
    if (!id) { id = make(); localStorage.setItem(KEY, id); }
    return id;
  } catch (e) {
    console.warn("[Rinogical] localStorage不可。一時IDで動作します:", e && e.message);
    if (!_memDeviceId) _memDeviceId = make();
    return _memDeviceId;
  }
}

/* Firebase初期化（CDNから動的import）。失敗時はローカル動作 */
async function initFirebase() {
  if (!firebaseConfigured()) {
    console.info("[Rinogical] Firebase未設定 → ローカル動作モード（保存なし）");
    return false;
  }
  try {
    const appMod = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_VER}/firebase-app.js`);
    const fsMod = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_VER}/firebase-firestore.js`);
    const app = appMod.initializeApp(FIREBASE_CONFIG);
    fb.db = fsMod.getFirestore(app);
    fb.doc = fsMod.doc; fb.getDoc = fsMod.getDoc; fb.setDoc = fsMod.setDoc; fb.serverTimestamp = fsMod.serverTimestamp;
    fb.ready = true;
    console.info("[Rinogical] Firebase接続OK");
    await initAuth(app);
    return true;
  } catch (e) {
    console.error("[Rinogical] Firebase初期化に失敗 → ローカル動作で続行:", e);
    return false;
  }
}

/* Firestoreから users/{deviceId} を読む。無ければ null */
async function loadUserData(deviceId) {
  if (!fb.ready) return null;
  try {
    const snap = await fb.getDoc(fb.doc(fb.db, "users", deviceId));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error("[Rinogical] 読み込み失敗:", e);
    return null;
  }
}

/* Firestoreへ保存（merge）。updatedAtはサーバー時刻 */
async function saveUserData(deviceId, data, opt) {
  if (!fb.ready || !deviceId) return;
  try {
    await fb.setDoc(
      fb.doc(fb.db, "users", deviceId),
      { ...data, updatedAt: fb.serverTimestamp() },
      { merge: !(opt && opt.replace) }
    );
  } catch (e) {
    console.error("[Rinogical] 保存失敗:", e);
  }
}


/* ===========================================================================
   ログイン（2026-11〜）：匿名ログインで始め、あとで「メール＋パスワード」をひも付けられる（C方式）
   - セーブの置き場所は users/{ログインのuid}。ログインできないとき（Firebase側で未有効など）は
     従来どおり users/{端末ID} を使う（＝今までと同じ動き。安全に段階導入するため）
   - 初回：uid側にセーブが無く、端末ID側にあれば、uid側へ自動でコピー（端末ID側は消さない）
   =========================================================================== */
async function initAuth(app) {
  try {
    const am = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_VER}/firebase-auth.js`);
    fb.authMod = am;
    fb.auth = am.getAuth(app);
    // 前回のログイン状態の復元を待つ（ここで待たないと毎回新しい匿名ユーザーができてしまう）
    let user = await new Promise(resolve => {
      const off = am.onAuthStateChanged(fb.auth, u => { off(); resolve(u); });
    });
    if (!user) user = (await am.signInAnonymously(fb.auth)).user;
    setAuthUser(user);
    console.info("[Rinogical] ログインOK:", user.isAnonymous ? "匿名" : user.email);
  } catch (e) {
    fb.uid = null;
    console.warn("[Rinogical] ログインできないため端末IDで保存します:", e && (e.code || e.message));
  }
}

function setAuthUser(user) {
  fb.uid = user ? user.uid : null;
  fb.isAnonymous = user ? user.isAnonymous : true;
  fb.email = user ? (user.email || null) : null;
}

/* 起動時に呼ぶ：どこに保存するか（key）と、読み込んだセーブ（data）を返す */
async function loadSaveData() {
  const deviceId = getDeviceId();
  if (!fb.ready || !fb.uid) return { key: deviceId, data: await loadUserData(deviceId) };
  let force = false;
  try { force = localStorage.getItem("rino_force_migrate") === "1"; } catch (e) {}
  let data = force ? null : await loadUserData(fb.uid);
  if (!data || !data.nickname) {
    const legacy = await loadUserData(deviceId);
    if (legacy && legacy.nickname) {
      const copy = { ...legacy };
      delete copy.updatedAt;
      await saveUserData(fb.uid, { ...copy, migratedFrom: deviceId }, { replace: true });
      data = copy;
      console.info("[Rinogical] 端末IDのセーブをログイン側へ引っ越しました:", deviceId);
    } else if (force) {
      data = await loadUserData(fb.uid);
    }
  }
  try { localStorage.removeItem("rino_force_migrate"); } catch (e) {}
  return { key: fb.uid, data };
}

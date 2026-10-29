/* ================= メインアプリ ================= */
export default function Rinogical() {
  const [screen, setScreen] = useState("loading");
  const [tip] = useState(() => { const a = t("tips"); return a[rint(0, a.length - 1)]; });
  const [character, setCharacter] = useState(null);
  const [nickname, setNickname] = useState("");
  // coins は全科目共通。level/xp は科目ごと（数学・英語…）に分けて持つ
  const [player, setPlayer] = useState({ coins: 0, subjects: { math: { level: 1, xp: 0 }, english: { level: 1, xp: 0 }, kokugo: { level: 1, xp: 0 }, rika: { level: 1, xp: 0 }, shakai: { level: 1, xp: 0 } } });
  const [subject, setSubject] = useState("math"); // いまプレイ中の科目
  const [unit, setUnit] = useState("seifu");       // 数学のいまの単元（正負の数 / 文字式 …）
  const [battleReturn, setBattleReturn] = useState("trials"); // バトル後の戻り先
  const prog = (player.subjects && player.subjects[subject]) || { level: 1, xp: 0 };
  const deviceIdRef = useRef(null);
  const persistReady = useRef(false); // 初回読込が終わるまで保存しない（既存データの上書き防止）

  // 背景画像：読み込めたときだけ切り替える（無ければ今までのグラデーションのまま）
  const [bgUrl, setBgUrl] = useState(null);
  useEffect(() => {
    const url = assetUrl(ASSETS.backgrounds && ASSETS.backgrounds.adventure);
    if (!url) return;
    const im = new Image();
    im.onload = () => setBgUrl(url);
    im.src = url;
  }, []);

  /* 起動時：Firebase初期化 → デバイスID取得 → データ読込（無ければ初期設定へ） */
  useEffect(() => {
    let alive = true;
    (async () => {
      const sleep = new Promise(r => setTimeout(r, 1300)); // ローディング演出の最低表示時間
      await initFirebase();
      const id = getDeviceId();
      deviceIdRef.current = id;
      const data = await loadUserData(id);
      await sleep;
      if (!alive) return;
      if (data && data.nickname) {
        const ch = CHARACTERS.find(c => c.id === data.characterId)
          || { id: data.characterId || "myao", accent: data.characterAccent || C.lav };
        setNickname(data.nickname);
        setCharacter(ch);
        // 旧データ（level/xp が直接入っている）→ subjects.math へ自動で引っ越し
        let subjects;
        if (data.subjects && typeof data.subjects === "object") {
          subjects = {
            math: data.subjects.math || { level: 1, xp: 0 },
            english: data.subjects.english || { level: 1, xp: 0 },
            kokugo: data.subjects.kokugo || { level: 1, xp: 0 },
            rika: data.subjects.rika || { level: 1, xp: 0 },
            shakai: data.subjects.shakai || { level: 1, xp: 0 },
          };
        } else {
          subjects = {
            math: { level: data.level ?? 1, xp: data.xp ?? 0 },
            english: { level: 1, xp: 0 },
            kokugo: { level: 1, xp: 0 },
            rika: { level: 1, xp: 0 },
            shakai: { level: 1, xp: 0 },
          };
        }
        setPlayer({ coins: data.coins ?? 0, subjects });
        setScreen("home"); // 続きから
      } else {
        setScreen("character"); // 新規：初期設定へ
      }
      persistReady.current = true; // ここから保存を有効化
    })();
    return () => { alive = false; };
  }, []);

  /* 保存タイミング：レベルアップ・コイン増加・XP変化（=playerの変化）／ニックネーム・キャラ確定時 */
  useEffect(() => {
    if (!persistReady.current) return;
    if (!nickname || !character) return;
    const ch = character || {};
    saveUserData(deviceIdRef.current, {
      nickname,
      characterId: ch.id || null,
      characterAccent: ch.accent || null,
      coins: player.coins,
      subjects: player.subjects,
      // 互換用（古い形式しか見ない処理があっても困らないように、数学の値を残す）
      level: (player.subjects.math || {}).level ?? 1,
      xp: (player.subjects.math || {}).xp ?? 0,
    });
  }, [player, nickname, character]);

  const font = { fontFamily: "'Hiragino Maru Gothic ProN','Yu Gothic UI','M PLUS Rounded 1c',system-ui,sans-serif" };
  const baseGrad = `radial-gradient(1200px 500px at 50% -10%, ${C.bg2}, ${C.bg0} 70%)`;
  // 背景画像が読めた時だけ：上に薄暗いベールを重ねて文字を読みやすくする
  const bgStyle = bgUrl
    ? `linear-gradient(rgba(11,8,26,.30), rgba(11,8,26,.52)), url("${bgUrl}") center/cover no-repeat, ${baseGrad}`
    : baseGrad;

  return (
    <div style={{ ...font, minHeight: 620, color: C.ink, position: "relative", overflow: "hidden",
      background: bgStyle, padding: "26px 18px", borderRadius: 24 }}>
      <Keyframes />
      {/* 背景のルーン */}
      {["✦", "✧", "⚝", "❉", "✺", "✦"].map((r, i) => (
        <span key={i} style={{ position: "absolute", color: C.aqua, fontSize: 16 + (i % 3) * 8,
          left: `${(i * 17 + 5) % 92}%`, top: `${(i * 23 + 8) % 88}%`, animation: `rino-rune ${4 + i}s ease-in-out infinite`, pointerEvents: "none" }}>{r}</span>
      ))}

      <div style={{ maxWidth: 460, margin: "0 auto", position: "relative" }}>
        {screen === "loading" && <Loading tip={tip} />}
        {screen === "character" && <CharacterSelect onPick={(c) => { setCharacter(c); setScreen("name"); }} />}
        {screen === "name" && (
          <NameInput accent={character?.accent} imgSrc={assetUrl(character?.img)}
            nickname={nickname} setNickname={setNickname}
            onNext={() => setScreen("tutorial")} />
        )}
        {screen === "tutorial" && <Tutorial char={character} nickname={nickname} onStart={() => setScreen("home")} />}
        {screen === "home" && <SubjectHome char={character} coins={player.coins} nickname={nickname}
          onMath={() => { setSubject("math"); setScreen("trials"); }}
          onEnglish={() => { setSubject("english"); setBattleReturn("home"); setScreen("battle"); }}
          onKokugo={() => { setSubject("kokugo"); setBattleReturn("home"); setScreen("battle"); }}
          onRika={() => { setSubject("rika"); setBattleReturn("home"); setScreen("battle"); }}
          onShakai={() => { setSubject("shakai"); setBattleReturn("home"); setScreen("battle"); }} />}
        {screen === "trials" && <Home char={character} level={prog.level} coins={player.coins} nickname={nickname} onBoss={(i) => { setUnit(MATH_UNIT_KEYS[i] || "seifu"); setBattleReturn("trials"); setScreen("battle"); }} onBack={() => setScreen("home")} />}
        {screen === "battle" && (
          <Battle char={character} player={player} setPlayer={setPlayer} subjectKey={subject} unitKey={unit} prog={prog} nickname={nickname}
            onWin={() => setScreen("victory")} onHome={() => setScreen(battleReturn)} />
        )}
        {screen === "victory" && <Victory char={character} level={prog.level} coins={player.coins} nickname={nickname} onHome={() => setScreen(battleReturn)} />}
      </div>
    </div>
  );
}

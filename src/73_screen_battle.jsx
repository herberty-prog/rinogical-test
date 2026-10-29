/* ---------- バトル ---------- */
const BOSS_HP = 100, PLAYER_HP = 100, HIT_DMG = 25, TAKE_DMG = 20;

/* 問題文の中の「答える対象の言葉」だけを目立たせる表示部品。
   ・mark を持つのは今のところ国語だけ。数学・英語・理科は mark が無いので、
     下の if で全文をそのまま返す＝表示はこれまでとまったく同じになる。
   ・mark が文中に見つからないときも全文表示に戻す。文章が欠けることは起きない。 */
function MarkedText({ text, mark }) {
  const i = mark ? String(text).indexOf(mark) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span style={{ color: C.gold, borderBottom: `3px solid ${C.gold}`, padding: "0 2px" }}>{mark}</span>
      {text.slice(i + mark.length)}
    </>
  );
}

function Battle({ char, player, setPlayer, subjectKey, unitKey, prog, nickname, onWin, onHome }) {
  // 数学のときは単元（正負の数 / 文字式 …）の設定 U を読む。英語のときは U=null。
  const U = subjectKey === "math" ? (MATH_UNITS[unitKey] || MATH_UNITS.seifu) : null;
  const meta = U
    ? { ...SUBJECT_META.math, bossName: U.bossName, tokens: U.tokens, explain: U.explain }
    : (SUBJECT_META[subjectKey] || SUBJECT_META.math);
  const [bossHP, setBossHP] = useState(BOSS_HP);
  const [hp, setHp] = useState(PLAYER_HP);
  const [problem, setProblem] = useState(null);
  const [choices, setChoices] = useState([]);
  const [mood, setMood] = useState("idle");
  const [bossHit, setBossHit] = useState(false);
  const [phase, setPhase] = useState("loading"); // loading | answer | result
  const [picked, setPicked] = useState(null);
  const [mode, setMode] = useState("choice");   // "choice" | "input" | "arrange"
  const [inputVal, setInputVal] = useState("");
  const [built, setBuilt] = useState([]);        // 並べ替え：選んだ札の並び
  const [explain, setExplain] = useState("");
  const [explaining, setExplaining] = useState(false);
  const convo = useRef([]);

  async function nextProblem() {
    setPhase("loading"); setPicked(null); setExplain(""); setMood("idle"); setBuilt([]);
    let p;
    const lv = prog.level;
    if (subjectKey === "english") {
      p = genEnglishProblem(lv);
    } else if (subjectKey === "kokugo") {
      p = genKokugoProblem(lv);
    } else if (subjectKey === "rika") {
      p = genRikaProblem(lv);
    } else if (subjectKey === "shakai") {
      p = genShakaiProblem(lv);
    } else {
      const roll = Math.random();
      try {
        if (lv >= 5 && roll < 0.5) p = await U.genOyou(lv);
        else if (lv >= 3 && roll < 0.7) p = genFromPool(U.pool);
        else p = U.genKihon(lv);
      } catch { p = genFromPool(U.pool); }
      p.type = "number";
      p.ui = pickAnswerMode(lv, p.a);
    }
    const ch = p.choices || (p.type === "number" ? makeChoices(p.a) : []);
    setProblem(p); setChoices(ch);
    setMode(p.ui || "choice"); setInputVal("");
    setPhase("answer");
  }
  useEffect(() => { nextProblem(); /* eslint-disable-next-line */ }, []);

  async function fetchExplain(extra) {
    setExplaining(true);
    try {
      if (convo.current.length === 0) {
        convo.current = [{ role: "user", content: `問題：${problem.q || problem.a}　正解：${problem.a}。生徒が間違えました。まずは2〜3行だけ。やさしい励ましと、答えにつながる小さなヒントを1つだけ伝えて。くわしい手順はまだ書かないで。` }];
      } else if (extra) {
        convo.current.push({ role: "user", content: extra });
      }
      const txt = await callClaude(convo.current, meta.explain);
      convo.current.push({ role: "assistant", content: txt });
      setExplain(txt);
    } catch {
      setExplain(subjectKey === "english" ? localExplainEn(problem) : subjectKey === "kokugo" ? localExplainKokugo(problem) : subjectKey === "rika" ? localExplainRika(problem) : subjectKey === "shakai" ? localExplainShakai(problem) : (U ? U.localExplain(problem) : localExplain(problem)));
    } finally { setExplaining(false); }
  }

  function answer(val) {
    if (phase !== "answer") return;
    setPicked(val);
    const correct = sameAns(val, problem);
    setPhase("result");
    if (correct) {
      setMood("happy");
      setBossHit(true); setTimeout(() => setBossHit(false), 500);
      const nb = Math.max(0, bossHP - HIT_DMG); setBossHP(nb);
      setPlayer(pl => {
        const cur = (pl.subjects && pl.subjects[subjectKey]) || { level: 1, xp: 0 };
        const xp = cur.xp + 1;
        const need = cur.level * 3;
        const coins = pl.coins + 10;
        const nextCur = xp >= need ? { level: cur.level + 1, xp: 0 } : { level: cur.level, xp };
        return { ...pl, coins, subjects: { ...pl.subjects, [subjectKey]: nextCur } };
      });
      if (nb <= 0) { setTimeout(onWin, 900); }
    } else {
      setMood("sad");
      setHp(h => Math.max(0, h - TAKE_DMG));
      convo.current = [];
      fetchExplain();
    }
  }

  function submitInput() {
    if (phase !== "answer") return;
    if (problem.type === "number") {
      const v = parseInput(inputVal);
      if (v === null) return; // 空や記号だけのときは何もしない
      answer(v);
    } else {
      const s = inputVal.trim();
      if (s === "") return;
      answer(s);
    }
  }
  function toggleSign() {
    setInputVal(s => (s.startsWith("-") ? s.slice(1) : "-" + s));
  }
  // 並べ替え：札をタップで追加／取り消し
  function pickTile(i) {
    if (phase !== "answer") return;
    if (built.includes(i)) return;
    setBuilt(b => [...b, i]);
  }
  function undoTile() {
    if (phase !== "answer") return;
    setBuilt(b => b.slice(0, -1));
  }
  function submitArrange() {
    if (phase !== "answer" || built.length === 0) return;
    const sentence = built.map(i => problem.tiles[i]).join(" ");
    answer(sentence);
  }

  const dead = hp <= 0;

  return (
    <div style={{ animation: "rino-pop .35s ease" }}>
      <HUD level={prog.level} coins={player.coins} name={nickname} />
      <div style={{ ...clay(C.bg1), padding: 14, marginBottom: 12 }}>
        <div style={{ textAlign: "center", fontWeight: 900, color: C.danger, marginBottom: 4 }}>👾 {meta.bossName}</div>
        <DarkNumber hit={bossHit} tokens={meta.tokens} />
        <HPBar label={t("bossHP")} value={bossHP} max={BOSS_HP} color={C.danger} />
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 10 }}>
        <Hero accent={char?.accent} mood={mood} size={92} src={assetUrl(char?.img)}
          lottieSet={char && char.id && LOTTIE.chars[char.id] ? {
            idle: assetUrl(LOTTIE.chars[char.id].idle),
            happy: assetUrl(LOTTIE.chars[char.id].happy),
            sad: assetUrl(LOTTIE.chars[char.id].sad),
          } : null} />
        <div style={{ flex: 1 }}><HPBar label={t("hpOf", nickname)} value={hp} max={PLAYER_HP} color={C.mint} /></div>
      </div>

      {dead ? (
        <div style={{ ...clay(C.bg1), padding: 18, textAlign: "center" }}>
          <p style={{ fontWeight: 800, marginBottom: 12 }}>{t("deadMsg")}<br />{t("deadMsg2")}</p>
          <Btn full bg={C.aqua} onClick={() => { setHp(PLAYER_HP); nextProblem(); }}>
            <RefreshCw size={18} style={{ verticalAlign: "-3px" }} /> {t("retry")}
          </Btn>
        </div>
      ) : phase === "loading" ? (
        <div style={{ ...clay(C.bg1), padding: 26, textAlign: "center" }}>
          <div style={{ margin: "0 auto 10px", width: 40, height: 40, borderRadius: "50%", border: `5px solid rgba(255,255,255,.12)`, borderTopColor: C.aqua, animation: "rino-spin 1s linear infinite" }} />
          <span style={{ color: C.inkDim, fontWeight: 700 }}>{t("callingProblem")}</span>
        </div>
      ) : (
        <div style={{ ...clay(C.bg1), padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: C.bg0, background: C.butter, padding: "3px 10px", borderRadius: 999 }}>{problem.kind}</span>
            <span style={{ fontSize: 12, color: C.inkDim }}>{t("attackHint")}</span>
          </div>
          <div style={{ textAlign: "center", fontSize: problem.type === "number" ? 28 : 22, fontWeight: 900, margin: "10px 0 18px", letterSpacing: problem.type === "number" ? 1 : 0 }}>
            {mode === "arrange" ? t("arrangeHint") : <><MarkedText text={problem.q} mark={problem.mark} />{(problem.type === "number" && problem.kind !== "応用") ? " =" : ""}</>}
          </div>
          {mode === "arrange" ? (
            <div>
              <div style={{ ...clay(C.bg2, false), minHeight: 52, padding: "10px 12px", marginBottom: 10, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "center" }}>
                {built.length === 0
                  ? <span style={{ color: C.inkDim, fontWeight: 700, fontSize: 13 }}>{t("arrangeTrayHint")}</span>
                  : built.map((ti, k) => (
                      <span key={k} style={{ ...clay(C.lav), padding: "6px 12px", fontWeight: 900, color: C.bg0, fontSize: 18 }}>{problem.tiles[ti]}</span>
                    ))}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 10 }}>
                {problem.tiles.map((w, i) => (
                  <button key={i} className="rino-btn" disabled={phase === "result" || built.includes(i)} onClick={() => pickTile(i)}
                    style={{ ...clay(built.includes(i) ? "#5b5080" : C.butter), border: "none", padding: "10px 14px", fontSize: 18, fontWeight: 900, color: C.bg0,
                      opacity: built.includes(i) ? .4 : 1, cursor: phase === "result" ? "default" : "pointer" }}>{w}</button>
                ))}
              </div>
              {phase !== "result"
                ? <div style={{ display: "flex", gap: 8 }}>
                    <Btn bg={C.peach} style={{ flex: "0 0 auto", padding: "12px 16px" }} onClick={undoTile}>{t("clearBtn")}</Btn>
                    <Btn full bg={C.lav} onClick={submitArrange}>{t("answerBtn")}</Btn>
                  </div>
                : <div style={{ textAlign: "center", fontWeight: 800, color: sameAns(picked, problem) ? C.mint : C.danger }}>
                    {t("yourAnswer")}{picked}{sameAns(picked, problem) ? t("correctMark") : t("answerWas", problem.a)}
                  </div>}
            </div>
          ) : mode === "input" ? (
            <div>
              {phase !== "result" && (
                <div style={{ fontSize: 12, color: C.inkDim, textAlign: "center", marginBottom: 8 }}>
                  {t(problem.type === "number" ? "inputHint" : "inputHintText")}
                </div>
              )}
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                {problem.type === "number" && (
                  <button className="rino-btn" onClick={toggleSign} disabled={phase === "result"}
                    style={{ ...clay(C.butter), border: "none", width: 56, fontSize: 22, fontWeight: 900, color: C.bg0, cursor: phase === "result" ? "default" : "pointer" }}>±</button>
                )}
                <input type="text" inputMode={problem.type === "number" ? "numeric" : "text"} value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") submitInput(); }}
                  disabled={phase === "result"} placeholder={t("inputPlaceholder")}
                  style={{ ...clay(C.bg2, false), flex: 1, border: "none", outline: "none", color: C.ink, fontSize: 24, fontWeight: 900, textAlign: "center", padding: "12px 10px" }} />
              </div>
              {phase !== "result"
                ? <Btn full bg={C.lav} onClick={submitInput}>{t("answerBtn")}</Btn>
                : <div style={{ textAlign: "center", fontWeight: 800, color: sameAns(picked, problem) ? C.mint : C.danger }}>
                    {t("yourAnswer")}{picked}{sameAns(picked, problem) ? t("correctMark") : t("answerWas", problem.a)}
                  </div>}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {choices.map((c, i) => {
                const isCorrect = sameAns(c, problem), isPicked = c === picked;
                let bg = C.lav;
                if (phase === "result") { if (isCorrect) bg = C.mint; else if (isPicked) bg = C.danger; else bg = "#5b5080"; }
                return (
                  <button key={i} className="rino-btn" disabled={phase === "result"} onClick={() => answer(c)}
                    style={{ ...clay(bg), border: "none", padding: "16px 0", fontSize: 22, fontWeight: 900, color: C.bg0, cursor: phase === "result" ? "default" : "pointer" }}>
                    {c}
                  </button>
                );
              })}
            </div>
          )}

          {phase === "result" && sameAns(picked, problem) && (
            <div style={{ textAlign: "center", marginTop: 14 }}>
              <p style={{ color: C.mint, fontWeight: 900, fontSize: 18 }}>{t("correctPlus")} <Coins size={16} style={{ verticalAlign: "-2px" }} /></p>
              {bossHP > 0 && <Btn full bg={C.aqua} style={{ marginTop: 10 }} onClick={nextProblem}>{t("nextSpell")}</Btn>}
            </div>
          )}

          {phase === "result" && !sameAns(picked, problem) && (
            <ExplainPanel explain={explain} explaining={explaining} teacher={meta.teacher} teacherImg={meta.teacherImg} teacherEmoji={meta.emoji}
              onWhy={() => fetchExplain("「なんで？」と聞かれました。なぜその答えになるのか、考え方のステップを順番に、わかりやすく説明して。")}
              onEasier={() => fetchExplain(subjectKey === "english"
                ? "「もっとかんたんに」と言われました。主語による be動詞の見分け方を、別の身近な言い方で、いちばんやさしく説明して。同じ説明のくり返しは避けて。"
                : subjectKey === "kokugo"
                ? "「もっとかんたんに」と言われました。その漢字の覚え方を、別の切り口（へん・つくりの意味、にた形の漢字とのくらべ方、送りがなの見分け方など）から1つだけ選んで、いちばんやさしく説明して。同じ説明のくり返しは避けて。"
                : subjectKey === "rika"
                ? "「もっとかんたんに」と言われました。その用語の覚え方を、別の切り口（名前の漢字の意味、対になる用語とのセット、身近な植物での例えなど）から1つだけ選んで、いちばんやさしく説明して。同じ説明のくり返しは避けて。中学1年で習わない光合成や蒸散のくわしい話には立ち入らないで。"
                : subjectKey === "shakai"
                ? "「もっとかんたんに」と言われました。その用語の覚え方を、別の切り口（言葉の意味、地球儀や地図でのイメージ、対になる知識とのセットなど）から1つだけ選んで、いちばんやさしく説明して。同じ説明のくり返しは避けて。政治や歴史の話には立ち入らないで。"
                : "「もっとかんたんに」と言われました。これまでとは別の、身近なたとえ（温度計・エレベーターの階・おこづかいの貸し借りなど）を1つだけ使って、いちばんやさしく説明して。同じ説明のくり返しは避けて。")}
              onNext={nextProblem} />
          )}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 12 }}>
        <button className="rino-btn" onClick={onHome} style={{ background: "none", border: "none", color: C.inkDim, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>{t("backToTrials")}</button>
      </div>
    </div>
  );
}

/* AI解説パネル */
function ExplainPanel({ explain, explaining, onWhy, onEasier, onNext, teacher = TEACHER, teacherImg = null, teacherEmoji = null }) {
  const [imgErr, setImgErr] = useState(false);
  const avatar = teacherImg && !imgErr
    ? <img src={teacherImg} alt="" width={72} height={72} onError={() => setImgErr(true)}
        style={{ width: 72, height: 72, objectFit: "contain", display: "block" }} />
    : teacherEmoji
      ? <div style={{ fontSize: 52, lineHeight: 1 }}>{teacherEmoji}</div>
      : <Magi size={84} />;
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 6 }}>
        {avatar}
        <p style={{ color: C.peach, fontWeight: 900, textAlign: "left", margin: 0 }}>
          {teacher}：<br />{t("teacherIntro")}
        </p>
      </div>
      <div style={{ ...clay(C.bg2, false), padding: 16, minHeight: 70, fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
        {explaining && !explain ? (
          <span style={{ color: C.inkDim, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 16, height: 16, borderRadius: "50%", border: `3px solid rgba(255,255,255,.15)`, borderTopColor: C.aqua, animation: "rino-spin 1s linear infinite", display: "inline-block" }} />
            {teacher}{t("thinking")}
          </span>
        ) : (
          <span><Lightbulb size={16} color={C.gold} style={{ verticalAlign: "-3px", marginRight: 4 }} />{explain}</span>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <Btn bg={C.butter} style={{ flex: 1, padding: "11px 0", fontSize: 14 }} onClick={onWhy} disabled={explaining}>{t("why")}</Btn>
        <Btn bg={C.peach} style={{ flex: 1, padding: "11px 0", fontSize: 14 }} onClick={onEasier} disabled={explaining}>{t("easier")}</Btn>
      </div>
      <Btn full bg={C.aqua} style={{ marginTop: 10 }} onClick={onNext}>{t("nextProblem")}</Btn>
    </div>
  );
}

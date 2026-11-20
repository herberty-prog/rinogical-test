/* ================= 英語（フェーズ5）：動詞の5単元 =================
   一般動詞／can／三人称単数／現在進行形／過去形。英文はすべてアプリ用のオリジナル（教科書本文は使わない）。
   ・動詞の表 EN_VERBS から「主語＋動詞＋目的語」を組み立てる。どの主語でも意味が通る目的語だけを入れる。
   ・4択は「文の中で正しいのが1つだけ」になる選択肢にする。とくに次の別解に注意：
       can の文に do/does を入れない（He does swim. も文として正しい）、
       現在の文に過去形を入れない（I played tennis. も正しい）。時を表す語（now / yesterday）で1つに絞る。
   ・ならべかえは主語（Ken and I など）を1枚の札にする（I and Ken のような別の並べ方を作らない）。
   ・入力は（ ）のヒントで答えが1つに決まる問題だけ。can't / cannot のような別の書き方は alts で認める。 */
const EN_VERBS = [
  { b: "play", s: "plays", p: "played", ing: "playing", objs: ["tennis", "soccer", "the piano", "the guitar", "baseball"], prog: true },
  { b: "like", s: "likes", p: "liked", ing: "liking", objs: ["music", "cats", "dogs", "English", "ramen"], prog: false },
  { b: "have", s: "has", p: "had", ing: "having", objs: ["a dog", "a bike", "a cat"], prog: false },
  { b: "study", s: "studies", p: "studied", ing: "studying", objs: ["English", "math", "science"], prog: true },
  { b: "watch", s: "watches", p: "watched", ing: "watching", objs: ["TV", "movies", "anime"], prog: true },
  { b: "speak", s: "speaks", p: "spoke", ing: "speaking", objs: ["English", "Japanese"], prog: true },
  { b: "eat", s: "eats", p: "ate", ing: "eating", objs: ["breakfast", "rice", "natto"], prog: true },
  { b: "cook", s: "cooks", p: "cooked", ing: "cooking", objs: ["curry", "dinner"], prog: true },
  { b: "go", s: "goes", p: "went", ing: "going", objs: ["to school", "to the park", "to the library"], prog: true },
  { b: "use", s: "uses", p: "used", ing: "using", objs: ["a computer", "this pen"], prog: true },
  { b: "write", s: "writes", p: "wrote", ing: "writing", objs: ["a letter", "an email"], prog: true },
  { b: "make", s: "makes", p: "made", ing: "making", objs: ["a cake", "lunch"], prog: true },
  { b: "wash", s: "washes", p: "washed", ing: "washing", objs: ["the dishes", "the car"], prog: true },
  { b: "clean", s: "cleans", p: "cleaned", ing: "cleaning", objs: ["the room", "the kitchen"], prog: true },
  { b: "teach", s: "teaches", p: "taught", ing: "teaching", objs: ["math", "English"], prog: true },
];
/* can の単元だけで使う「〜できる」の動詞（目的語のかわりに fast / well などがつく） */
const EN_CAN_VERBS = [
  { b: "swim", s: "swims", p: "swam", ing: "swimming", objs: ["fast", "well"] },
  { b: "run", s: "runs", p: "ran", ing: "running", objs: ["fast"] },
  { b: "ride", s: "rides", p: "rode", ing: "riding", objs: ["a bike", "a horse"] },
  { b: "sing", s: "sings", p: "sang", ing: "singing", objs: ["well", "English songs"] },
  { b: "dance", s: "dances", p: "danced", ing: "dancing", objs: ["well"] },
  { b: "play", s: "plays", p: "played", ing: "playing", objs: ["the piano", "the guitar", "shogi"] },
  { b: "speak", s: "speaks", p: "spoke", ing: "speaking", objs: ["English", "French"] },
  { b: "cook", s: "cooks", p: "cooked", ing: "cooking", objs: ["curry", "pancakes"] },
  { b: "make", s: "makes", p: "made", ing: "making", objs: ["a cake", "cookies"] },
  { b: "use", s: "uses", p: "used", ing: "using", objs: ["a computer", "chopsticks"] },
];
/* 主語。pron＝答えの文で使う代名詞、be＝現在の be動詞、was＝過去の be動詞 */
const EN_SUBJ_I = [{ s: "I", pron: "I", be: "am", was: "was" }];
const EN_SUBJ_PL = [
  { s: "You", pron: "I", be: "are", was: "were" }, { s: "We", pron: "we", be: "are", was: "were" },
  { s: "They", pron: "they", be: "are", was: "were" }, { s: "Ken and I", pron: "we", be: "are", was: "were" },
  { s: "My friends", pron: "they", be: "are", was: "were" },
];
const EN_SUBJ_3 = [
  { s: "He", pron: "he", be: "is", was: "was" }, { s: "She", pron: "she", be: "is", was: "was" },
  { s: "Tom", pron: "he", be: "is", was: "was" }, { s: "Yuki", pron: "she", be: "is", was: "was" },
  { s: "My mother", pron: "she", be: "is", was: "was" }, { s: "Mr. Sato", pron: "he", be: "is", was: "was" },
  { s: "My brother", pron: "he", be: "is", was: "was" },
];
const EN_SUBJ_ALL = EN_SUBJ_I.concat(EN_SUBJ_PL, EN_SUBJ_3);
/* 疑問文の主語（Do I 〜? / Are Ken and I 〜? は不自然なので使わない） */
const EN_SUBJ_ASK = EN_SUBJ_ALL.filter(x => x.s !== "I" && x.s !== "Ken and I");
/* 文の途中に置くときの主語（You → you、My friends → my friends。I・Tom・Ken and I・Mr. Sato はそのまま） */
const enLow = (w) => (/^(You|We|They|He|She|It|My)\b/.test(w) ? w.charAt(0).toLowerCase() + w.slice(1) : w);
/* 「Do you 〜? — Yes, I do.」の聞き手と答え手。I は you で聞き、Ken and I は you（あなたたち）で聞いて we で答える */
const enWho = (S) => S.s === "I" ? { q: "you", a: "I" } : S.s === "Ken and I" ? { q: "you", a: "we" } : { q: enLow(S.s), a: S.pron };
/* ほかの動詞を1つ（4択のダミー用） */
const enOtherVerb = (v) => pickOne(EN_VERBS.filter(x => x.b !== v.b));
const enCap = (w) => w.charAt(0).toUpperCase() + w.slice(1);

/* 出題形式をレベルで決める（be動詞の単元と同じ割合）：Lv1-2=4択 / Lv3-4=4択+ならべかえ / Lv5+=4択+ならべかえ+入力 */
function enForm(level) {
  const r = Math.random();
  if (level >= 5) return r < 0.5 ? "choice" : r < 0.8 ? "arrange" : "input";
  if (level >= 3) return r < 0.7 ? "choice" : "arrange";
  return "choice";
}
const enChoice = (q, a, ng, kind) => ({ type: "text", ui: "choice", kind, q, a, choices: shuffle([a].concat(ng)) });
const enInput = (q, a, alts) => ({ type: "text", ui: "input", kind: "入力", q, a, alts: alts || [] });
/* ならべかえ：札の配列（主語は1枚）。正解は札をスペースでつないだ文（文末の . ? はつけない） */
const enArrange = (tiles) => ({ type: "text", ui: "arrange", kind: "ならべかえ", q: "", a: tiles.join(" "), tiles: shuffle(tiles.slice()) });
const enWords = (str) => str.split(" ");

/* ---------- 一般動詞（I / you / 複数の主語。三人称単数は別の単元） ---------- */
function genEnIppan(level) {
  const v = pickOne(EN_VERBS), o = pickOne(v.objs);
  const S = pickOne(EN_SUBJ_I.concat(EN_SUBJ_PL));
  const A = pickOne(EN_SUBJ_PL.filter(x => x.s !== "Ken and I")); // 疑問文の主語
  const form = enForm(level);
  const t = level >= 3 ? rint(1, 5) : 1;
  if (form === "arrange") {
    if (t === 2) return enArrange([S.s, "don't", v.b, ...enWords(o)]);
    if (t >= 3) return enArrange(["Do", enLow(A.s), v.b, ...enWords(o)]);
    return enArrange([S.s, v.b, ...enWords(o)]);
  }
  if (form === "input") {
    return enInput(`（否定文に）${S.s} ${v.b} ${o}. → ${S.s} ___ ${v.b} ${o}.`, "don't", ["do not"]);
  }
  if (t === 2) return enChoice(`${S.s} ___ ${v.b} ${o}.`, "don't", ["doesn't", S.be === "am" ? "am not" : "aren't", "not"], "標準");
  if (t === 3) return enChoice(`___ ${enLow(A.s)} ${v.b} ${o}?`, "Do", ["Does", "Are", "Is"], "標準");
  if (t === 4) {
    const yes = Math.random() < 0.5;
    const who = enWho(S);
    return enChoice(`Do ${who.q} ${v.b} ${o}? — ${yes ? "Yes" : "No"}, ${who.a} ___.`, yes ? "do" : "don't",
      yes ? ["does", who.a === "I" ? "am" : "are", "is"] : ["doesn't", who.a === "I" ? "am not" : "aren't", "isn't"], "標準");
  }
  // be動詞はダミーに使わない（I am a dog. / You are English. のように文として成り立ってしまうことがある）
  return enChoice(`${S.s} ___ ${o}.`, v.b, [v.s, v.ing, enOtherVerb(v).s], "超基本");
}

/* ---------- can ---------- */
function genEnCan(level) {
  const v = pickOne(EN_CAN_VERBS), o = pickOne(v.objs);
  const S = pickOne(EN_SUBJ_ALL);
  const form = enForm(level);
  const t = level >= 3 ? rint(1, 5) : rint(1, 2);
  if (form === "arrange") {
    if (t === 3) return enArrange([S.s, "can't", v.b, ...enWords(o)]);
    if (t >= 4) { const A = pickOne(EN_SUBJ_ASK); return enArrange(["Can", enLow(A.s), v.b, ...enWords(o)]); }
    return enArrange([S.s, "can", v.b, ...enWords(o)]);
  }
  if (form === "input") {
    const neg = Math.random() < 0.5;
    return neg ? enInput(`（〜できない）${S.s} ___ ${v.b} ${o}.`, "can't", ["cannot", "can not"])
      : enInput(`（〜できる）${S.s} ___ ${v.b} ${o}.`, "can");
  }
  // do / does は選択肢に入れない（He does swim fast. も文として正しくなるため）
  if (t === 2) return enChoice(`${S.s} can ___ ${o}.`, v.b, [v.s, v.ing, v.p], "超基本");
  if (t === 3) return enChoice(`${S.s} ___ ${v.b} ${o}.（〜できない）`, "can't", ["isn't", "aren't", "not"], "標準");
  if (t === 4) { const A = pickOne(EN_SUBJ_ASK); return enChoice(`___ ${enLow(A.s)} ${v.b} ${o}?`, "Can", ["Is", "Are", "Am"], "標準"); }
  if (t === 5) {
    const yes = Math.random() < 0.5;
    const who = enWho(S);
    return enChoice(`Can ${who.q} ${v.b} ${o}? — ${yes ? "Yes" : "No"}, ${who.a} ___.`, yes ? "can" : "can't",
      yes ? ["cans", "is", "am"] : ["isn't", "aren't", "not"], "標準");
  }
  return enChoice(`${S.s} ___ ${v.b} ${o}.`, "can", ["cans", S.be, S.be === "is" ? "are" : "is"], "超基本");
}

/* ---------- 三人称単数（he / she / Tom など） ---------- */
function genEnSansho(level) {
  const v = pickOne(EN_VERBS), o = pickOne(v.objs);
  const S = pickOne(EN_SUBJ_3);
  const form = enForm(level);
  const t = level >= 3 ? rint(1, 5) : 1;
  if (form === "arrange") {
    if (t === 2) return enArrange([S.s, "doesn't", v.b, ...enWords(o)]);
    if (t >= 3) return enArrange(["Does", enLow(S.s), v.b, ...enWords(o)]);
    return enArrange([S.s, v.s, ...enWords(o)]);
  }
  if (form === "input") return enInput(`（${v.b}）${S.s} ___ ${o}.`, v.s);
  if (t === 2) return enChoice(`${S.s} ___ ${v.b} ${o}.`, "doesn't", ["don't", "isn't", "not"], "標準");
  if (t === 3) return enChoice(`${S.s} doesn't ___ ${o}.`, v.b, [v.s, v.ing, "is"], "標準");
  if (t === 4) return enChoice(`___ ${enLow(S.s)} ${v.b} ${o}?`, "Does", ["Do", "Is", "Are"], "標準");
  if (t === 5) {
    const yes = Math.random() < 0.5;
    return enChoice(`Does ${enLow(S.s)} ${v.b} ${o}? — ${yes ? "Yes" : "No"}, ${S.pron} ___.`, yes ? "does" : "doesn't",
      yes ? ["do", "is", v.s] : ["don't", "isn't", "not"], "標準");
  }
  // be動詞はダミーに使わない（He is English. のように成り立つことがある）。s のつかない形はどれも不正解
  return enChoice(`${S.s} ___ ${o}.`, v.s, [v.b, v.ing, enOtherVerb(v).b], "超基本");
}

/* ---------- 現在進行形（now をつけて、ふつうの現在形と区別する） ---------- */
function genEnShinkou(level) {
  const v = pickOne(EN_VERBS.filter(x => x.prog)), o = pickOne(v.objs);
  const S = pickOne(EN_SUBJ_ALL);
  const form = enForm(level);
  const t = level >= 3 ? rint(1, 5) : rint(1, 2);
  if (form === "arrange") {
    if (t === 3) return enArrange([S.s, S.be + " not", v.ing, ...enWords(o)]);
    if (t >= 4) { const A = pickOne(EN_SUBJ_ASK); return enArrange([enCap(A.be), enLow(A.s), v.ing, ...enWords(o), "now"]); }
    return enArrange([S.s, S.be, v.ing, ...enWords(o), "now"]);
  }
  if (form === "input") return enInput(`（${v.b}）${S.s} ${S.be} ___ ${o} now.`, v.ing);
  const others = ["am", "is", "are"].filter(x => x !== S.be);
  if (t === 2) return enChoice(`${S.s} ${S.be} ___ ${o} now.`, v.ing, [v.b, v.s, v.p], "超基本");
  if (t === 3) return enChoice(`${S.s} ___ not ${v.ing} ${o} now.`, S.be, others.concat(["do"]), "標準");
  if (t === 4) {
    const A = pickOne(EN_SUBJ_ASK);
    return enChoice(`___ ${enLow(A.s)} ${v.ing} ${o} now?`, enCap(A.be), ["am", "is", "are"].filter(x => x !== A.be).map(enCap).concat(["Do"]), "標準");
  }
  if (t === 5) {
    const T = pickOne(EN_SUBJ_3);
    return enChoice(`What is ${enLow(T.s)} doing now? — ${enCap(T.pron)} is ___ ${o}.`, v.ing, [v.b, v.s, v.p], "標準");
  }
  return enChoice(`${S.s} ___ ${v.ing} ${o} now.`, S.be, others.concat(["be"]), "超基本");
}

/* ---------- 過去形（yesterday などで、現在形と区別する） ---------- */
const EN_PAST_TIME = ["yesterday", "last Sunday", "last night"];
function genEnKako(level) {
  const v = pickOne(EN_VERBS.filter(x => x.prog)), o = pickOne(v.objs); // like / have は「きのう〜した」が不自然なので使わない
  const S = pickOne(EN_SUBJ_ALL);
  const when = pickOne(EN_PAST_TIME);
  const form = enForm(level);
  const t = level >= 3 ? rint(1, 6) : rint(1, 2);
  if (form === "arrange") {
    if (t === 3) return enArrange([S.s, "didn't", v.b, ...enWords(o), ...enWords(when)]);
    if (t >= 4) { const A = pickOne(EN_SUBJ_ASK); return enArrange(["Did", enLow(A.s), v.b, ...enWords(o), ...enWords(when)]); }
    return enArrange([S.s, v.p, ...enWords(o), ...enWords(when)]);
  }
  if (form === "input") return enInput(`（${v.b}）${S.s} ___ ${o} ${when}.`, v.p);
  if (t === 2) { // be動詞の過去
    const adj = pickOne(["busy", "tired", "happy", "sleepy", "at home", "in the gym"]);
    const ng = S.was === "was" ? ["were", S.be, S.be === "is" ? "are" : "is"] : ["was", "are", "is"];
    return enChoice(`${S.s} ___ ${adj} ${when}.`, S.was, ng, "超基本");
  }
  if (t === 3) return enChoice(`${S.s} ___ ${v.b} ${o} ${when}.`, "didn't", ["don't", "doesn't", S.was === "was" ? "wasn't" : "weren't"], "標準");
  if (t === 4) return enChoice(`${S.s} didn't ___ ${o} ${when}.`, v.b, [v.p, v.s, v.ing], "標準");
  if (t === 5) { const A = pickOne(EN_SUBJ_ASK); return enChoice(`___ ${enLow(A.s)} ${v.b} ${o} ${when}?`, "Did", ["Do", "Does", A.was === "was" ? "Was" : "Were"], "標準"); }
  if (t === 6) {
    const yes = Math.random() < 0.5;
    const who = enWho(S);
    return enChoice(`Did ${who.q} ${v.b} ${o} ${when}? — ${yes ? "Yes" : "No"}, ${who.a} ___.`, yes ? "did" : "didn't",
      yes ? ["do", "does", "was"] : ["don't", "doesn't", "wasn't"], "標準");
  }
  // 規則動詞・不規則動詞の過去形（read のように過去形が同じつづりの動詞は表に入れない）
  return enChoice(`${S.s} ___ ${o} ${when}.`, v.p, [v.b, v.s, v.ing], "超基本");
}

/* ---------- 解説（通信なし時）と、AI先生への単元の説明 ---------- */
const EN_LOCAL_TIPS = {
  ippan: ["・一般動詞の否定文は do not（don't）＋動詞のもとの形。", "・疑問文は Do を文の最初に。答えも do / don't を使うよ。"],
  can: ["・can のあとの動詞は、いつも もとの形（swims ではなく swim）。", "・否定は can't（cannot）、疑問文は Can を文の最初に。"],
  sansho: ["・主語が he / she / Tom など1人（1つ）なら、動詞に s をつける。", "・have → has、study → studies、watch → watches のように形が変わる動詞もあるよ。", "・否定・疑問では does を使い、動詞はもとの形にもどる。"],
  shinkou: ["・「いま〜している」は be動詞（am / is / are）＋動詞の ing 形。", "・be動詞は主語で決まる（I → am、he → is、you や複数 → are）。"],
  kako: ["・過去の文は動詞を過去形に（play → played、go → went のように形が変わる動詞もある）。", "・否定・疑問は did を使い、動詞はもとの形にもどる。", "・be動詞の過去は was（I・1人）と were（you・複数）。"],
};
const enLocalExplain = (key) => (p) => [
  "ナイスチャレンジ！👏 いっしょに見直そう。",
  ...EN_LOCAL_TIPS[key],
  p.a ? `・答えは「${p.a}」。` : "",
  "もう一回いける！🌟",
].filter(Boolean).join("\n");

const enExplainSystem = (topic, extra) =>
  `あなたは中学1年生のための、やさしい英語の先生「${ENGLISH_TEACHER}」です。` +
  "明るく親しみやすい言葉の魔法使いで、アルファベットや羽ペンのモチーフが好きです。" +
  "解説スタイル：①短文で ②箇条書きは行頭に「・」だけ ③むずかしい漢字にはふりがな ④まず良いところを褒める ⑤絶対に責めない・否定しない。" +
  "重要：マークダウン記号（** や * や # や ```）は絶対に使わない。" +
  `単元は${topic}。答えそのものより「見分け方」を中心に、短い例文を1つ添えて伝える。${extra}` +
  "中学1年で習わない文法（現在完了・受け身・不定詞など）には立ち入らない。絵文字は1〜2個までOK。毎回みじかく。";
const EN_IPPAN_SYSTEM = enExplainSystem("一般動詞（I・you・複数の主語の肯定文・否定文 don't・疑問文 Do）", "be動詞と一般動詞を同じ文にいっしょに使わないことも伝える。");
const EN_CAN_SYSTEM = enExplainSystem("助動詞 can（〜できる）", "can のあとの動詞はいつももとの形、否定は can't、疑問文は Can を前に出すこと。");
const EN_SANSHO_SYSTEM = enExplainSystem("三人称単数現在（he / she / Tom など＋動詞の s）", "s・es・ies のつけ方と has、否定・疑問では does を使って動詞をもとの形にもどすこと。");
const EN_SHINKOU_SYSTEM = enExplainSystem("現在進行形（be動詞＋ing形）", "ing のつけ方（make → making、swim → swimming）も必要に応じて伝える。");
const EN_KAKO_SYSTEM = enExplainSystem("過去形（一般動詞の過去・be動詞の過去 was / were・did を使う否定と疑問）", "不規則に形が変わる動詞（go → went など）は、まとめて覚えるコツを1つ添える。");

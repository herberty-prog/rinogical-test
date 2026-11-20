/* ================= 英語（フェーズ5）：疑問詞 =================
   答えの文を見て、空らんに入る疑問詞を選ぶ。英文はすべてアプリ用のオリジナル。
   ・ng（ダミー）は1型ずつ手で決める。答えの文と合わないことが確実なものだけ。
     例：「___ bag is this? — It's Ken's.」は Which でも通ってしまうので、Which をダミーに入れない。
         「___ subject do you like? — I like math.」も Which が通るので入れない。
   ・入力で別の疑問詞でも通る型（Which bag / Which subject など）は alts に書いて正解にする。
   ・{ } の部分を入れかえて、1つの型から何問も作る。 */
const WH_FILL = {
  city: ["Osaka", "Kyoto", "Sapporo", "Nagoya", "Fukuoka", "Sendai"],
  month: ["April 5", "May 12", "July 20", "October 3", "December 24", "March 9"],
  family: ["uncle", "father", "teacher", "brother", "cousin"],
  sister: ["sister", "cousin", "friend", "teacher"],
  time: ["6:30", "7:00", "6:45", "7:15"],
  animal: ["cats", "dogs", "fish", "birds"],
  num: ["two", "three", "four", "five"],
  age: ["12", "13"],
  way: ["By bus", "By bike", "By train", "On foot"],
  owner: ["Ken's", "Yuki's", "mine", "Tom's"],
  thing: ["a dictionary", "a pencil case", "a map", "a camera"],
  subject: ["math", "science", "music", "P.E."],
  day: ["On Sundays", "On Saturdays", "After school", "On Fridays"],
  place: ["in the library", "in the gym", "at home", "in the park"],
  name: ["Ken", "Yuki", "Tom", "Mika"],
  food: ["ramen", "curry", "sushi", "pizza"],
};
const WH_DATA = [
  { q: "___ do you live? — I live in {city}.", a: "Where", ng: ["When", "What", "Who"] },
  { q: "___ is your birthday? — It's {month}.", a: "When", ng: ["Where", "Who", "How"] },
  { q: "___ is that man? — He is my {family}.", a: "Who", ng: ["Where", "When", "How"] },
  { q: "___ is that girl? — She is my {sister}.", a: "Who", ng: ["Where", "When", "How"] },
  { q: "___ time do you get up? — At {time}.", a: "What", ng: ["How", "When", "Who"] },
  { q: "___ many {animal} do you have? — I have {num}.", a: "How", ng: ["What", "Who", "Where"] },
  { q: "___ old are you? — I'm {age} years old.", a: "How", ng: ["What", "Who", "When"] },
  { q: "___ do you go to school? — {way}.", a: "How", ng: ["What", "Who", "Whose"] },
  { q: "___ bag is this? — It's {owner}.", a: "Whose", ng: ["Who", "Where", "When"], alts: ["Which"] },
  { q: "___ is this? — It's {thing}.", a: "What", ng: ["Who", "Where", "When"] },
  { q: "___ subject do you like? — I like {subject}.", a: "What", ng: ["Who", "Where", "How"], alts: ["Which"] },
  { q: "___ do you play tennis? — {day}.", a: "When", ng: ["Who", "What", "Whose"] },
  { q: "___ is {name}? — {name0} is {place}.", a: "Where", ng: ["Who", "When", "Whose"] },
  { q: "___ food do you like? — I like {food}.", a: "What", ng: ["Who", "Where", "How"], alts: ["Which"] },
  { q: "___ is your favorite singer? — {name} is.", a: "Who", ng: ["Where", "When", "How"] },
  { q: "___ are you? — I'm fine, thank you.", a: "How", ng: ["What", "Where", "Who"] },
];
const WH_PRON = { Ken: "He", Tom: "He", Yuki: "She", Mika: "She" };

function whFill(d) {
  const used = {};
  const q = d.q.replace(/\{(\w+)\}/g, (m, k) => {
    if (k === "name0") return WH_PRON[used.name];
    used[k] = pickOne(WH_FILL[k]);
    return used[k];
  });
  return q;
}

function genEnWh(level) {
  const pool = level >= 3 ? WH_DATA : WH_DATA.filter(d => ["Where", "When", "Who", "What"].includes(d.a) && !d.q.startsWith("___ time") && !d.q.includes("subject") && !d.q.includes("food"));
  const d = pickOne(pool);
  const q = whFill(d);
  const form = enForm(level);
  if (form === "arrange") {
    // 質問の文だけをならべかえる（— より前。最初の疑問詞は大文字の札なので並べ方は1つ）
    const ask = q.split(" — ")[0].replace("___", d.a).replace(/\?$/, "");
    return enArrange(enWords(ask));
  }
  if (form === "input") return enInput(q, d.a, d.alts); // Which でも通る型は alts で正解にする
  return enChoice(q, d.a, d.ng, level >= 3 ? "標準" : "超基本");
}

function localExplainEnWh(p) {
  return [
    "ナイスチャレンジ！👏 いっしょに見直そう。",
    "・答えの文を先に見ると、何を聞いているかがわかるよ。",
    "・場所→Where、時→When、人→Who、もの→What、だれの→Whose、方法・ようす・数→How。",
    p.a ? `・答えは「${p.a}」。` : "",
    "もう一回いける！🌟",
  ].filter(Boolean).join("\n");
}
const EN_WH_SYSTEM = enExplainSystem("疑問詞（What / Who / Where / When / Whose / How と、What time・How many・How old）",
  "答えの文の『場所・時・人・もの』のどれを聞いているかに注目する見分け方を示す。");

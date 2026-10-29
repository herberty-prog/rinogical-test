/* ===========================================================================
   Rinogical ビルドスクリプト（Node.js 版）
   ---------------------------------------------------------------------------
   やっていること：
     build/head.html  ＋  src/ の中身を番号順に全部つなげたもの  ＋  build/foot.html
     を貼り合わせて index.html を作るだけ。
   これまで手作業で「Rinogical.jsx の中身を index.html に貼る」としていた部分を、
   そのまま自動にしたものです。ビルド方式（Babel standalone / importmap）は変えません。

   使い方：
     node build.mjs                        … index.html を作り直す
     node build.mjs --out test.html        … 別名で出して、今のと見比べる（安全）
     node build.mjs --check-only           … ファイルは書かず、結果の比較だけ表示

   src/ のルール（ここを守れば壊れません）：
     1) ファイル名の先頭の番号が、つなげる順番です（00 → 10 → 11 → ...）。
     2) import 文を書いてよいのは、いちばん最初のファイルだけ。
     3) export default は自動で外されます（1つの大きなファイルになるため）。
     4) const が別の const の中身を使うときだけ、順番が重要です。
   =========================================================================== */

import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(ROOT, "src");
const HEAD_FILE = path.join(ROOT, "build", "head.html");
const FOOT_FILE = path.join(ROOT, "build", "foot.html");

/* 分割後に true にすると、つないだ境目にファイル名のコメントが入ります。
   ブラウザのエラー行番号から「どのファイルか」を探しやすくなります。
   ただし出力が変わるので、いまは false（今の index.html と1バイトも変えないため）。 */
const INSERT_FILE_MARKERS = false;

/* ---- コマンドライン引数 ---- */
const argv = process.argv.slice(2);
const checkOnly = argv.includes("--check-only");
const outIndex = argv.indexOf("--out");
const OUT_FILE = outIndex >= 0 && argv[outIndex + 1]
  ? path.resolve(ROOT, argv[outIndex + 1])
  : path.join(ROOT, "index.html");

/* ---- 読み込みのおまじない（文字化け・改行コードの事故を防ぐ）----
   ・UTF-8 で読む
   ・先頭に BOM（見えない目印）が付いていたら取り除く
   ・Windows の改行 CRLF を LF にそろえる（毎回同じ結果になるように） */
async function readText(file) {
  let s = await readFile(file, "utf8");
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  return s.replace(/\r\n/g, "\n");
}

/* ---- src/ のファイル一覧（名前の順＝つなげる順）---- */
async function listSources() {
  const names = (await readdir(SRC_DIR))
    .filter((n) => n.endsWith(".jsx") || n.endsWith(".js"))
    .sort();
  if (names.length === 0) throw new Error("src/ に .jsx ファイルがありません。");
  return names;
}

/* ---- 1ファイル分を、つなげられる形に整える ---- */
function cleanPart(name, text, isFirst) {
  // export default は、1つのファイルにまとめると不要（あるとエラーになる）
  const out = text.replace(/^export default /gm, "");

  // import 文は最初のファイルだけ。2番目以降にあったら警告する。
  if (!isFirst && /^import\s/m.test(out)) {
    warnings.push(
      `${name} に import 文があります。import は最初のファイルにだけ書いてください。`
    );
  }
  return out;
}

const warnings = [];

/* ---- 構文チェック（@babel/standalone があれば実行）----
   本番の index.html はブラウザ上で Babel が変換します。同じものをここで先に通し、
   構文エラーがあればビルドを止めます（画面真っ白事故の防止）。 */
async function syntaxCheck(code) {
  let Babel;
  try {
    Babel = (await import("@babel/standalone")).default;
  } catch {
    return { ran: false };
  }
  try {
    Babel.transform(code, {
      presets: ["react"],
      sourceType: "module",
      filename: "rinogical.jsx",
    });
    return { ran: true, ok: true };
  } catch (e) {
    return { ran: true, ok: false, message: e.message };
  }
}

/* ---- 本体 ---- */
const head = await readText(HEAD_FILE);
const foot = await readText(FOOT_FILE);
const names = await listSources();

const parts = [];
for (let i = 0; i < names.length; i++) {
  const text = await readText(path.join(SRC_DIR, names[i]));
  const cleaned = cleanPart(names[i], text, i === 0);
  parts.push(INSERT_FILE_MARKERS ? `/* ===== ${names[i]} ===== */\n${cleaned}` : cleaned);
}

/* つなぎ方のルール：
   ・各ファイルの「末尾の改行」は無視する（エディタが勝手に足したり消したりするため）
   ・ファイルとファイルの間は、空行1本（＝改行2つ）でつなぐ
   ・最後に改行3つを付ける（元の index.html がそうなっているため）
   こうすると、元は空行1本で区切られていた場所で切っても、つなぎ直すと元通りになります。 */
const body = parts.map((p) => p.replace(/\n+$/, "")).join("\n\n") + "\n\n\n";
const html = head + body + foot;

/* ---- 構文チェック ---- */
const check = await syntaxCheck(body);
if (check.ran && !check.ok) {
  console.error("\n❌ 構文エラーが見つかりました。index.html は書き換えていません。\n");
  console.error(check.message);
  process.exit(1);
}

/* ---- 今の出力先と比べる ---- */
let compare = "（出力先のファイルはまだありません）";
if (existsSync(OUT_FILE)) {
  const current = await readText(OUT_FILE);
  compare = current === html
    ? "✅ 完全に同一（1文字も違いなし）"
    : `⚠ 差分あり（今 ${current.length} 文字 → 新 ${html.length} 文字）`;
}

/* ---- 書き出し ---- */
if (!checkOnly) {
  await writeFile(OUT_FILE, html, "utf8");
}

/* ---- 結果の表示 ---- */
console.log("\n--- Rinogical ビルド ---");
console.log("つないだファイル :", names.join(" → "));
console.log("本文の長さ       :", body.length, "文字");
console.log("構文チェック     :", check.ran
  ? "✅ OK"
  : "⚠ スキップ（@babel/standalone が未インストール。分割作業を始める前に `npm install --save-dev @babel/standalone` を実行してください）");
for (const w of warnings) console.log("⚠ 警告           :", w);
console.log("出力先と比べて   :", compare);
console.log("出力先           :", checkOnly ? "（--check-only のため書き込みなし）" : OUT_FILE);
console.log("");

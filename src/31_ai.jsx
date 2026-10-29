/* ================= AI（プロキシ経由）================= */
/* 受付係（Cloudflare Worker）のURL。ここ1か所だけで定義する。 */
const AI_PROXY_URL = "https://rinogical-ai.jet-speeder-herberty.workers.dev";

async function callClaude(messages, system) {
  // 1回ぶんのリクエスト
  const once = async () => {
    const res = await fetch(AI_PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system: system, messages: messages }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || ("proxy " + res.status));
    return data.text || "";
  };
  try {
    return await once();
  } catch (e) {
    // 一時的な通信エラーや500のときは、少し待って「1回だけ」自動で再試行する。
    // それでもダメなら投げる（呼び出し側がローカル解説などにフォールバックする）。
    await new Promise(r => setTimeout(r, 600));
    return await once();
  }
}

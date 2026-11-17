const test = require("node:test"),
  assert = require("node:assert/strict");
const R = require("../dist/modules/ai-request.js");
const { app } = require("./helpers.cjs");
test("AI history bounded and starts with user turn", () => {
  const rows = Array.from({ length: 30 }, (_, i) => ({
    role: i % 2 ? "model" : "user",
    text: "x".repeat(2000),
  }));
  const history = R.history(rows);
  assert.ok(history.length <= 12);
  assert.ok(history.reduce((n, m) => n + m.text.length, 0) <= 6000);
  assert.equal(history[0].role, "user");
});
test("request timeout covers response body and explicit cancel aborts outstanding work", async () => {
  const stalled = () => new Promise(() => {}),
    transport = R.create(stalled, 15);
  await assert.rejects(transport.request("fake"), { name: "TimeoutError" });
  const t = R.create(stalled, 1000),
    p = t.request("fake");
  t.cancel();
  await assert.rejects(p, { name: "AbortError" });
});
test("429 shows actionable error without pretending fallback is an AI response", async () => {
  let calls = 0;
  const a = await app({ kla_gemini_api_key: "test-key" }, async () => {
    calls++;
    return { ok: false, status: 429, json: async () => ({}) };
  });
  try {
    a.w.openGlobalAIBot();
    await a.w.KoreanAI.sendMessage("Xin chào");
    assert.equal(calls, 1);
    assert.match(a.w.KoreanAI.chatHistory.at(-1).text, /hạn mức/);
    assert.equal(a.w.KoreanAI.isBusy, false);
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});
test("closing bot cancels pending request and late answer cannot enter new chat", async () => {
  let finish;
  const a = await app(
    { kla_gemini_api_key: "test-key" },
    () => new Promise((r) => (finish = r)),
  );
  try {
    a.w.openGlobalAIBot();
    const pending = a.w.KoreanAI.sendMessage("Chào");
    a.w.closeAiModal();
    a.w.openGlobalAIBot();
    finish({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: "OLD RESPONSE" }] } }],
      }),
    });
    await pending;
    assert.ok(!a.w.KoreanAI.chatHistory.some((m) => m.text === "OLD RESPONSE"));
    assert.equal(a.w.KoreanAI.isBusy, false);
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});
test("book context includes focused lesson and limits prompt size", async () => {
  const a = await app();
  try {
    a.w.go("s1", "b1a");
    a.w.openStudyModal("s1", "b1a", "b1a_l8");
    a.w.openBookAIBot();
    const prompt = a.w.KoreanAI.currentBot.systemPrompt;
    assert.match(prompt, /Bài 8/);
    assert.ok(prompt.length < 9000);
  } finally {
    a.close();
  }
});

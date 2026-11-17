const test = require("node:test");
const assert = require("node:assert/strict");
const { app } = require("./helpers.cjs");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const open = (w) => w.openStudyModal("s1", "b1a", "l_snu1a_01");
function type(w, element, value) {
  element.value = value;
  element.dispatchEvent(new w.Event("input", { bubbles: true }));
}
function speech(w) {
  w.__utterances = [];
  w.speechSynthesis = {
    getVoices: () => [],
    cancel() {},
    speak: (u) => w.__utterances.push(u),
  };
  w.SpeechSynthesisUtterance = class {
    constructor(text) {
      this.text = text;
    }
  };
  w.__recognizers = [];
  w.SpeechRecognition = class {
    constructor() {
      w.__recognizers.push(this);
    }
    start() {
      this.onstart?.();
    }
    abort() {
      this.onend?.();
    }
  };
}

test("filtered drafts survive filtering, lazy tab creation and reopening; reset clears recall only", async () => {
  const a = await app();
  try {
    const w = a.w;
    open(w);
    w.switchStudyTab("production");
    const prod = w.KoreanProduction.exercises.find(
      (e) => e.type === "dialogue",
    );
    const prodId = `prod_input_${prod.id}`;
    type(w, w.document.getElementById(prodId), "제 이름은 민수예요.");
    w.KoreanProduction.setFilter("scenario");
    assert.equal(w.document.getElementById(prodId), null);
    w.closeStudyModal();
    w.load();
    open(w);
    w.KoreanProduction.setFilter("all");
    assert.equal(
      w.document.getElementById(prodId).value,
      "제 이름은 민수예요.",
    );
    type(w, w.document.getElementById(prodId), "새 답변");
    w.switchStudyTab("recall");
    assert.equal(w.document.getElementById(prodId).value, "새 답변");
    const recall = w.KoreanRecall.exercises.find((e) => e.type === "typing");
    const recallId = `input_${recall.id}`;
    type(w, w.document.getElementById(recallId), "기억해요");
    w.KoreanRecall.setFilter("choice");
    w.KoreanRecall.setFilter("typing");
    assert.equal(w.document.getElementById(recallId).value, "기억해요");
    w.KoreanRecall.resetSession();
    w.KoreanRecall.setFilter("all");
    assert.ok(
      [...w.document.querySelectorAll("#recallExercises input")].every(
        (e) => e.value === "",
      ),
    );
    assert.equal(w.document.getElementById(prodId).value, "새 답변");
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});

test("graded recall feedback survives filters and reload without scoring twice", async () => {
  const a = await app();
  try {
    const w = a.w;
    open(w);
    w.switchStudyTab("recall");
    const ex = w.KoreanRecall.exercises.find((e) => e.type === "typing");
    type(w, w.document.getElementById(`input_${ex.id}`), ex.correct);
    w.KoreanRecall.checkTyping(ex.id);
    const total = w.KoreanRecall.stats.total;
    w.KoreanRecall.setFilter("choice");
    w.KoreanRecall.setFilter("typing");
    w.closeStudyModal();
    w.load();
    open(w);
    assert.equal(w.document.getElementById(`input_${ex.id}`).value, ex.correct);
    assert.ok(
      w.document.getElementById(`input_${ex.id}`).classList.contains("correct"),
    );
    assert.ok(w.document.getElementById(`checkBtn_${ex.id}`).disabled);
    assert.ok(
      !w.document
        .getElementById(`feedback_${ex.id}`)
        .classList.contains("hidden"),
    );
    w.KoreanRecall.checkTyping(ex.id);
    assert.equal(w.KoreanRecall.stats.total, total);
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});

test("switching lessons preserves unsaved text and does not leak it to another lesson", async () => {
  const a = await app();
  try {
    const w = a.w;
    open(w);
    w.switchStudyTab("production");
    const field = w.document.querySelector("#productionExercises textarea");
    const id = field.id;
    type(w, field, "이전 수업");
    w.openStudyModal("s1", "b1a", "b1a_l8");
    w.switchStudyTab("production");
    assert.ok(
      [...w.document.querySelectorAll("#productionExercises textarea")].every(
        (e) => e.value === "",
      ),
    );
    open(w);
    assert.equal(w.document.getElementById(id).value, "이전 수업");
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});

test("clearing, escaping or dismissing search cancels pending results", async () => {
  const a = await app();
  try {
    const w = a.w,
      input = w.document.getElementById("globalSearchInput");
    const dropdown = w.document.getElementById("searchResultsDropdown");
    for (const cancel of [
      () => w.clearGlobalSearch(),
      () =>
        w.document.dispatchEvent(
          new w.KeyboardEvent("keydown", { key: "Escape" }),
        ),
      () => w.document.body.click(),
    ]) {
      type(w, input, "한국");
      cancel();
      await wait(180);
      assert.ok(dropdown.classList.contains("hidden"));
    }
    type(w, input, "한국");
    await wait(180);
    assert.ok(!dropdown.classList.contains("hidden"));
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});

test("mistake retest persists correct and incorrect results before feedback delay", async () => {
  const a = await app();
  try {
    const w = a.w;
    w.recordMistake({ korean: "안녕하세요", vi: "Xin chào" });
    const id = w.db.mistakes[0].id;
    w.renderMistakesView();
    type(w, w.document.getElementById(`testInput_${id}`), "안녕하세요");
    w.submitMistakeTest(id);
    w.load();
    assert.equal(w.db.mistakes[0].correctStreak, 1);
    w.renderMistakesView();
    w.openMistakeRetest(id);
    type(w, w.document.getElementById(`testInput_${id}`), "아니요");
    w.submitMistakeTest(id);
    w.load();
    assert.equal(w.db.mistakes[0].correctStreak, 0);
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});

test("stopped TTS callbacks and sequence timers cannot advance a newer playback", async () => {
  const a = await app({}, undefined, speech);
  try {
    const w = a.w,
      tts = w.KoreanVoice.tts;
    let oldDone = 0,
      newDone = 0;
    tts.playSequential(["이전", "오래된 문장"], undefined, () => oldDone++);
    const old = w.__utterances.at(-1);
    old.onend(); // A queued 900ms continuation must be cancelled too.
    tts.playSequential(["새 문장"], undefined, () => newDone++);
    const current = w.__utterances.at(-1);
    old.onend();
    old.onerror();
    current.onend();
    current.onerror();
    await wait(950);
    assert.deepEqual(
      w.__utterances.map((u) => u.text),
      ["이전", "새 문장"],
    );
    assert.equal(oldDone, 0);
    assert.equal(newDone, 1);
    assert.equal(tts.isPlayingAll, false);
    let late = 0;
    tts.speak("한 번", { onEnd: () => late++ });
    const utterance = w.__utterances.at(-1);
    tts.stop();
    utterance.onend();
    assert.equal(late, 0);
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});

test("reopening an AI call cancels the previous greeting and late callbacks cannot reopen mic", async () => {
  const a = await app({}, undefined, speech);
  try {
    const w = a.w;
    w.openGlobalAIBot("call");
    w.KoreanAI.toggleCallMute();
    w.closeAiModal();
    w.openGlobalAIBot("call");
    assert.equal(
      w.document.getElementById("aiCallMicLabel").textContent,
      "Micro: Bật",
    );
    await wait(850);
    assert.equal(w.__utterances.length, 1);
    const previous = w.__utterances[0];
    w.closeAiModal();
    w.openGlobalAIBot("call");
    previous.onend();
    assert.equal(w.__recognizers.length, 0);
    await wait(850);
    w.__utterances.at(-1).onend();
    assert.equal(w.__recognizers.length, 1);
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});

test("stopping or replacing dictation restores the old mic button exactly once", async () => {
  const a = await app({}, undefined, speech);
  try {
    const w = a.w;
    open(w);
    w.switchStudyTab("production");
    const input = w.document.querySelector("#productionExercises textarea");
    const button = input.parentElement.querySelector(".speech-dictate-btn");
    const before = button.innerHTML;
    w.KoreanVoice.dictateToInput(input.id, button);
    const late = w.__recognizers.at(-1).onresult;
    assert.ok(button.classList.contains("recording"));
    w.KoreanVoice.dictateToInput(input.id, button);
    assert.equal(button.innerHTML, before);
    assert.ok(!button.classList.contains("recording"));
    late({ results: [[{ transcript: "늦은 결과" }]] });
    assert.equal(input.value, "");
    w.KoreanVoice.dictateToInput(input.id, button);
    w.KoreanVoice.stt.startRecognition({});
    assert.equal(button.innerHTML, before);
    assert.ok(!button.classList.contains("recording"));
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});

test("dynamic cards and changed controls remain keyboard accessible after incremental rendering", async () => {
  const a = await app();
  try {
    const w = a.w;
    const container = w.document.createElement("div");
    container.innerHTML =
      '<div class="book-card" onclick="this.dataset.opened=1">Book</div><button class="icon-btn" title="Nghe">🔊</button>';
    w.document.body.append(container);
    await wait(0);
    const card = container.firstElementChild;
    assert.equal(card.tabIndex, 0);
    assert.equal(card.getAttribute("role"), "button");
    card.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Enter" }));
    assert.equal(card.dataset.opened, "1");
    assert.equal(
      container.querySelector("button").getAttribute("aria-label"),
      "Nghe",
    );
    assert.ok(container.querySelector("svg"));
    const control = w.document.getElementById("soundToggleBtn");
    control.textContent = "Tắt";
    await wait(0);
    assert.equal(control.getAttribute("aria-checked"), "false");
    control.textContent = "Bật";
    await wait(0);
    assert.equal(control.getAttribute("aria-checked"), "true");
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});

test("changing study tab stops recognition before it can write into a hidden answer", async () => {
  const a = await app({}, undefined, speech);
  try {
    const w = a.w;
    open(w);
    w.switchStudyTab("production");
    const input = w.document.querySelector("#productionExercises textarea");
    const button = input.parentElement.querySelector(".speech-dictate-btn");
    w.KoreanVoice.dictateToInput(input.id, button);
    const late = w.__recognizers.at(-1).onresult;
    w.switchStudyTab("recall");
    late({ results: [[{ transcript: "다른 화면" }]] });
    assert.equal(input.value, "");
    assert.equal(w.KoreanVoice.stt.isBusy, false);
    assert.ok(!button.classList.contains("recording"));
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});

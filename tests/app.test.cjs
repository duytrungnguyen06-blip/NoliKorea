const test = require("node:test"),
  assert = require("node:assert/strict");
const { app } = require("./helpers.cjs");
test("initialization, all eight lesson flows and book-scoped AI", async () => {
  const a = await app();
  try {
    assert.deepEqual(a.errors, []);
    assert.equal(a.eval("db.stages.length"), 3);
    const ids = a.eval("db.stages[0].books[0].lessons.map(l=>l.id)");
    for (const id of ids) {
      a.w.openStudyModal("s1", "b1a", id);
      for (const tab of ["input", "recall", "production"])
        a.w.switchStudyTab(tab);
      a.w.closeStudyModal();
    }
    a.w.go("s1", "b1a");
    a.w.openBookAIBot();
    assert.equal(a.w.KoreanAI.currentBot.type, "book");
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});
test("editing quotes, saving then loading and empty reset stay intact", async () => {
  const a = await app();
  try {
    a.w.openLessonModal("s1", "b1a", "l_snu1a_01");
    a.w.addLessonItem('"한국" \\ 한', "O'Brien", "<img src=x>");
    const values = [
      ...a.w.document.querySelectorAll(
        "#lessonItems .lesson-item-row:last-child input",
      ),
    ].map((e) => e.value);
    assert.equal(values[0], '"한국" \\ 한');
    assert.equal(values[2], "<img src=x>");
    a.eval('db.stages[0].books[0].lessons[0].notes="User notes";save();load()');
    assert.equal(
      a.eval("db.stages[0].books[0].lessons[0].notes"),
      "User notes",
    );
    a.w.resetAllData();
    a.w.load();
    assert.equal(a.eval("db.stages.length"), 0);
    a.w.restoreData();
    assert.equal(a.eval("db.stages.length"), 3);
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});
test("open is not practice; tab, draft and exact exercise order resume", async () => {
  const a = await app();
  try {
    a.w.openStudyModal("s1", "b1a", "l_snu1a_01");
    assert.ok(!a.eval("db.stages[0].books[0].lessons[0].inProgress"));
    a.w.switchStudyTab("production");
    const input = a.w.document.querySelector("#productionExercises textarea");
    assert.ok(input);
    input.value = "내 답변";
    input.dispatchEvent(new a.w.Event("input", { bubbles: true }));
    a.w.StudySession.capture();
    const order = a.w.KoreanRecall.exercises.map((x) => x.id).join();
    const id = input.id;
    a.w.closeStudyModal();
    a.w.load();
    a.w.openStudyModal("s1", "b1a", "l_snu1a_01");
    assert.equal(
      a.w.document.querySelector(".study-tab.active").dataset.tab,
      "production",
    );
    assert.equal(a.w.document.getElementById(id).value, "내 답변");
    assert.equal(a.w.KoreanRecall.exercises.map((x) => x.id).join(), order);
    a.w.KoreanProduction.evaluateSentence(a.w.KoreanProduction.exercises[0].id);
    a.w.showReviewRating();
    a.w.rateLesson("again");
    assert.equal(a.eval("db.stages[0].books[0].lessons[0].session"), null);
    assert.ok(
      a.eval(
        "Date.parse(db.stages[0].books[0].lessons[0].nextReviewAt)-Date.now()",
      ) > 590000,
    );
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});
test("Recall results create real per-item due queue and preserve outcomes", async () => {
  const a = await app();
  try {
    a.w.openStudyModal("s1", "b1a", "l_snu1a_01");
    a.w.switchStudyTab("recall");
    const ex = a.w.KoreanRecall.exercises.find((x) => x.type === "choice");
    const btn = a.w.document.querySelector(".recall-opt-btn");
    a.w.KoreanRecall.checkChoice(ex.id, "wrong", btn);
    assert.equal(Object.keys(a.eval("db.itemReviews")).length, 1);
    a.eval("Object.values(db.itemReviews)[0].dueAt=Date.now()-1");
    a.w.renderReview();
    assert.equal(a.w.ItemReviews.dueItems().length, 1);
    assert.equal(a.w.KoreanRecall.stats.total, 1);
    a.w.closeStudyModal();
    a.w.openStudyModal("s1", "b1a", "l_snu1a_01");
    assert.equal(a.w.KoreanRecall.stats.total, 1);
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});
test("settings/progress navigation and placeholder lesson cannot be completed", async () => {
  const a = await app();
  try {
    for (const v of ["review", "progress", "settings", "curriculum"]) {
      a.w.SeoulUI.navigate(v);
      assert.ok(
        a.w.document.getElementById(v + "View").classList.contains("active"),
      );
    }
    const l = a.eval("db.stages[0].books[1].lessons[0].id");
    a.w.openStudyModal("s1", "b1b", l);
    a.w.showReviewRating();
    assert.ok(
      a.w.document.getElementById("reviewRating").classList.contains("hidden"),
    );
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});
test("delegated choice and voice preserve quotes and backslashes as plain data", async () => {
  const a = await app();
  try {
    const text = 'O\'Brien "한" \\ test';
    a.eval(
      "db.stages[0].books[0].lessons[0].items[0]=" +
        JSON.stringify({ korean: text, vi: text, en: "" }),
    );
    a.w.openStudyModal("s1", "b1a", "l_snu1a_01");
    let spoken;
    a.w.KoreanVoice.speak = (t) => (spoken = t);
    a.w.document.querySelector("#studyContent [data-speak]").click();
    assert.equal(spoken, text);
    a.w.switchStudyTab("recall");
    const ex = a.w.KoreanRecall.exercises.find((e) => e.id === "choice_kv_0");
    const button = [
      ...a.w.document.querySelectorAll('[data-choice="choice_kv_0"]'),
    ].find((b) => b.dataset.val === text);
    assert.ok(button);
    button.click();
    assert.equal(ex.state, "correct");
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});
test("CRUD persists user lesson through save, reload, edit and deletion", async () => {
  const a = await app();
  try {
    a.w.openLessonModal("s1", "b1a");
    const d = a.w.document;
    const fields = [
      ...d.querySelectorAll("#lessonForm input,#lessonForm textarea"),
    ];
    const title = fields.find((e) => e.id === "lessonTitle");
    title.value = "Bài riêng";
    const row = d.querySelector("#lessonItems .lesson-item-row");
    row.querySelector(".item-korean").value = "안녕";
    row.querySelector(".item-vi").value = "Chào";
    a.w.saveLesson({ preventDefault() {} });
    const added = a.eval("db.stages[0].books[0].lessons.at(-1)");
    assert.equal(added.title, "Bài riêng");
    a.w.load();
    a.w.openLessonModal("s1", "b1a", added.id);
    d.getElementById("lessonTitle").value = "Đã sửa";
    a.w.saveLesson({ preventDefault() {} });
    a.w.load();
    assert.equal(
      a.eval("db.stages[0].books[0].lessons.at(-1).title"),
      "Đã sửa",
    );
    a.w.deleteLesson("s1", "b1a", added.id);
    a.w.load();
    assert.ok(
      !a.eval(
        "db.stages[0].books[0].lessons.some(l=>l.id===" +
          JSON.stringify(added.id) +
          ")",
      ),
    );
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});
test("closing study and AI stops microphone capture", async () => {
  const a = await app();
  try {
    let stops = 0;
    a.w.KoreanVoice.stt.stop = () => stops++;
    a.w.openStudyModal("s1", "b1a", "l_snu1a_01");
    a.w.closeStudyModal();
    assert.ok(stops > 0);
    const before = stops;
    a.w.openGlobalAIBot();
    a.w.closeAiModal();
    assert.ok(stops > before);
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});
test("low Production similarity is labeled as difference, not automatically added as error", async () => {
  const a = await app();
  try {
    a.w.openStudyModal("s1", "b1a", "l_snu1a_01");
    a.w.switchStudyTab("production");
    const ex = a.w.KoreanProduction.exercises[0];
    a.w.document.getElementById("prod_input_" + ex.id).value = "맛있어요";
    const before = a.eval("db.mistakes.length");
    a.w.KoreanProduction.evaluateSentence(ex.id);
    assert.match(ex.evaluation.comment, /không kết luận/);
    assert.equal(a.eval("db.mistakes.length"), before);
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});

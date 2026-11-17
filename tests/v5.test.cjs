const test = require("node:test"),
  assert = require("node:assert/strict"),
  { app } = require("./helpers.cjs");
test("NoliKorea settings are compact and preserve metadata on note edits", async () => {
  const a = await app();
  try {
    assert.equal(a.w.document.title, "NoliKorea");
    assert.equal(
      a.w.document.querySelectorAll("#settingsView details").length,
      3,
    );
    a.w.openLessonModal("s1", "b1a", "b1a_l6");
    const before = a.w.db.stages[0].books[0].lessons[5].items.map((i) =>
      JSON.stringify(i),
    );
    a.w.document.getElementById("lessonNotes").value += "\nMy note";
    a.w.saveLesson({ preventDefault() {} });
    assert.deepEqual(
      a.w.db.stages[0].books[0].lessons[5].items.map((i) => JSON.stringify(i)),
      before,
    );
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});
test("annotated vocabulary never generates scramble; completion needs practice", async () => {
  const a = await app();
  try {
    a.w.openStudyModal("s1", "b1a", "b1a_l5");
    a.w.switchStudyTab("recall");
    assert.ok(
      !a.w.KoreanRecall.exercises.some(
        (e) => e.type === "scramble" && /[()\/]/.test(e.correct),
      ),
    );
    a.w.rateLesson("good");
    assert.equal(a.w.db.stages[0].books[0].lessons[4].studied, false);
    assert.equal(a.w.db.streak.count, 0);
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});
test("mistake submission is idempotent; stable review survives translation edits", async () => {
  const a = await app();
  try {
    a.w.recordMistake({ korean: "안녕", vi: "Chào", lessonId: "l_snu1a_01" });
    a.w.renderMistakesView();
    const m = a.w.db.mistakes[0];
    a.w.document.getElementById("testInput_" + m.id).value = "안녕";
    a.w.submitMistakeTest(m.id);
    a.w.submitMistakeTest(m.id);
    assert.equal(m.correctStreak, 1);
    a.w.openStudyModal("s1", "b1a", "l_snu1a_01");
    a.w.switchStudyTab("recall");
    const ex = a.w.KoreanRecall.exercises.find((e) => e.type === "choice");
    a.w.KoreanRecall.checkChoice(
      ex.id,
      "wrong",
      a.w.document.querySelector(".recall-opt-btn"),
    );
    const key = Object.keys(a.w.db.itemReviews)[0],
      record = a.w.db.itemReviews[key];
    const item = a.w.db.stages[0].books[0].lessons[0].items.find(
      (i) => i.id === record.itemId,
    );
    item.vi = "Nghĩa đã sửa";
    a.w.save();
    a.w.load();
    assert.equal(a.w.db.itemReviews[key].vi, "Nghĩa đã sửa");
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});
test("sequential TTS reaches second item and stops on request", async () => {
  const spoken = [];
  const a = await app({}, undefined, (w) => {
    w.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text;
      }
    };
    Object.defineProperty(w, "speechSynthesis", {
      value: { getVoices: () => [], cancel() {}, speak: (u) => spoken.push(u) },
    });
  });
  try {
    a.w.KoreanVoice.tts.playSequential(["하나", "둘"]);
    spoken[0].onend();
    await new Promise((r) => setTimeout(r, 950));
    assert.equal(spoken.length, 2);
    a.w.KoreanVoice.stop();
    assert.equal(a.w.KoreanVoice.tts.isPlayingAll, false);
  } finally {
    a.close();
  }
});
test('backup includes preferences but not the Gemini credential',async()=>{const a=await app();try{a.w.localStorage.setItem('kla_theme','light');a.w.localStorage.setItem('kla_gemini_api_key','test-private-key');let text;a.w.downloadJSON=t=>text=t;a.w.exportData();const exported=JSON.parse(text);assert.equal(exported.extra.preferences.kla_theme,'light');assert.ok(!text.includes('test-private-key'));const next=a.w.KLAStore.parse(text,a.w.CURRICULUM_DATA);assert.equal(a.w.replaceData(next,'test import'),true);assert.equal(a.w.document.documentElement.dataset.theme,'light');assert.deepEqual(a.errors,[]);}finally{a.close();}});
test('PWA resolves under a GitHub repository subpath and source IDs are unique',()=>{const fs=require('node:fs');const manifest=JSON.parse(fs.readFileSync('dist/manifest.json'));for(const url of [manifest.start_url,manifest.scope,manifest.id,...manifest.icons.map(i=>i.src)])assert.ok(new URL(url,'https://example.github.io/nolikorea/').pathname.startsWith('/nolikorea/'));const source=JSON.parse(fs.readFileSync('data/curriculum.json'));assert.deepEqual(source,JSON.parse(fs.readFileSync('dist/curriculum.json')));const ids=source.stages.flatMap(s=>s.books.flatMap(b=>b.lessons.flatMap(l=>l.items.map(i=>i.id))));assert.equal(ids.length,224);assert.equal(new Set(ids).size,224);});

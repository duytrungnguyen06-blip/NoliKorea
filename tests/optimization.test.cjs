const test = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs");
const { app } = require("./helpers.cjs"),
  L = require("../dist/modules/learning-content.js"),
  Store = require("../dist/modules/data-store.js");
const base = JSON.parse(fs.readFileSync("dist/curriculum.json"));
test("lazy exercise tabs render once and resume saved answers and drafts", async () => {
  const a = await app();
  try {
    a.w.openStudyModal("s1", "b1a", "l_snu1a_01");
    assert.equal(a.w.KoreanRecall.exercises.length, 0);
    assert.equal(a.w.KoreanProduction.exercises.length, 0);
    a.w.switchStudyTab("recall");
    const order = a.w.KoreanRecall.exercises.map((x) => x.id).join();
    const ex = a.w.KoreanRecall.exercises.find((x) => x.type === "choice");
    a.w.KoreanRecall.checkChoice(
      ex.id,
      ex.correct,
      a.w.document.querySelector(".recall-opt-btn"),
    );
    a.w.switchStudyTab("production");
    a.w.closeStudyModal();
    a.w.load();
    a.w.openStudyModal("s1", "b1a", "l_snu1a_01");
    assert.equal(a.w.KoreanRecall.exercises.length, 0);
    a.w.switchStudyTab("recall");
    assert.equal(a.w.KoreanRecall.exercises.map((x) => x.id).join(), order);
    assert.equal(
      a.w.KoreanRecall.exercises.find((x) => x.id === ex.id).state,
      "correct",
    );
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});
test("daily session separates first score, retry, writing and completion; resumes draft", async () => {
  const a = await app();
  try {
    const w = a.w;
    w.DailySession.start();
    let s = w.db.dailyPractice.active;
    assert.equal(s.cards.length, 8);
    assert.equal(w.db.streak.count, 0);
    w.DailySession.finish();
    assert.equal(s.finished, false);
    w.DailySession.submit("", true);
    w.DailySession.submit(s.cards[0].vi);
    assert.equal(s.cards[0].first.correct, false);
    w.DailySession.next();
    const input = w.document.getElementById("dailyAnswer");
    input.value = "내 답변";
    input.dispatchEvent(new w.Event("input"));
    w.DailySession.close();
    w.load();
    w.DailySession.start();
    s = w.db.dailyPractice.active;
    assert.equal(w.document.getElementById("dailyAnswer").value, "내 답변");
    while (s.stage === "recall") {
      const c = s.cards[s.index];
      w.DailySession.submit(c.mode === "choice" ? c.vi : L.answers(c)[0]);
      w.DailySession.next();
    }
    assert.equal(s.stage, "retry");
    w.DailySession.submit(L.answers(s.cards[0])[0]);
    w.DailySession.next();
    assert.equal(s.cards[0].first.correct, false);
    assert.equal(s.cards[0].retry.correct, true);
    while (!s.finished) {
      const textarea = w.document.querySelector("#dailyBody textarea");
      textarea.value = s.production[s.productionIndex].sample;
      textarea.dispatchEvent(new w.Event("input"));
      [...w.document.querySelectorAll("#dailyBody button")]
        .find((b) => b.textContent === "Đối chiếu câu mẫu")
        .click();
      [...w.document.querySelectorAll("#dailyBody button")]
        .find((b) => /Tình huống tiếp theo|Kết thúc phiên/.test(b.textContent))
        .click();
    }
    assert.equal(w.db.dailyPractice.history.length, 1);
    assert.equal(w.db.dailyPractice.history[0].firstCorrect, 7);
    assert.equal(w.db.dailyPractice.history[0].recovered, 1);
    assert.equal(w.db.streak.count, 1);
    assert.ok(!w.db.stages[0].books[0].lessons[0].studied);
    w.DailySession.finish();
    assert.equal(w.db.dailyPractice.history.length, 1);
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});
test("queue prioritizes due items, deduplicates Korean and uses same-category distractors", () => {
  const db = Store.validate(base),
    all = L.flatten(db),
    target = all.find((i) => i.korean === "월요일");
  db.itemReviews[L.key(target)] = { ...target, level: 0, lapses: 2, dueAt: 1 };
  const q = L.queue(db, 2);
  assert.equal(q[0].korean, "월요일");
  assert.equal(new Set(q.map((i) => L.normalize(i.korean))).size, q.length);
  const ds = L.distractors(target, all, "korean");
  assert.equal(ds.length, 3);
  assert.ok(ds.every((x) => x.endsWith("요일")));
  assert.ok(
    L.isAnswer("뭐", { korean: "무엇 (뭐)", acceptedAnswers: ["무엇", "뭐"] }),
  );
  assert.ok(
    !L.isAnswer("어디", {
      korean: "무엇 (뭐)",
      acceptedAnswers: ["무엇", "뭐"],
    }),
  );
});
test("two stores reject stale writes and replacements; unchanged saves do not write", () => {
  const map = new Map();
  let writes = 0;
  const mem = {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      writes++;
      map.set(k, v);
    },
  };
  const one = Store.create(mem, base),
    d1 = one.read(),
    two = Store.create(mem, base),
    d2 = two.read();
  const n = writes;
  one.save(d1);
  assert.equal(writes, n);
  d1.stages[0].name = "Edited";
  one.save(d1);
  const raw = mem.getItem(Store.KEY);
  assert.throws(
    () => two.save(d2),
    (e) => e.code === "STALE_DATA",
  );
  assert.throws(
    () => two.replace(d2, "test"),
    (e) => e.code === "STALE_DATA",
  );
  assert.equal(mem.getItem(Store.KEY), raw);
});
test("content flags persist safely and malformed short sessions are rejected", async () => {
  const a = await app();
  try {
    a.w.prompt = () => "<img src=x> cần xem";
    a.w.ContentFeedback.flag({
      sid: "s1",
      bid: "b1a",
      lid: "l_snu1a_01",
      korean: "안녕",
      vi: "Chào",
    });
    a.w.load();
    a.w.ContentFeedback.render();
    assert.equal(a.w.db.contentFlags[0].note, "<img src=x> cần xem");
    assert.equal(a.w.document.querySelector("#contentFlags img"), null);
    const bad = structuredClone(base);
    bad.dailyPractice = {
      seen: [],
      history: [],
      active: { id: "test", cards: [] },
    };
    assert.throws(() => Store.validate(bad));
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});
test("bundled content sources agree and known translation corrections preserve review schedule", () => {
  assert.deepEqual(require("../dist/curriculum-data.js"), base);
  const before = structuredClone(base);
  const corrections = JSON.parse(fs.readFileSync("content-corrections.json"));
  const c = corrections.find((c) => c.korean === "테니스");
  const i = before.stages[0].books[0].lessons
    .find((l) => l.id === c.lid)
    .items.find((i) => i.korean === c.korean);
  i.vi = c.old;
  const db = Store.validate(before);
  const old = JSON.stringify([c.sid, c.bid, c.lid, c.korean, c.old]);
  db.itemReviews[old] = { ...c, vi: c.old, level: 2, lapses: 1, dueAt: 123456 };
  const packed = Store.pack(db, before);
  const updated = Store.unpack(packed, base);
  const key = JSON.stringify([c.sid, c.bid, c.lid, i.id]);
  assert.equal(updated.itemReviews[key].dueAt, 123456);
  assert.ok(!updated.itemReviews[old]);
});
test("Web Locks permits only one writer and releases on page exit", async () => {
  let held = false;
  const locks = {
    request: async (name, options, callback) => {
      if (held) return callback(null);
      held = true;
      try {
        return await callback({ name });
      } finally {
        held = false;
      }
    },
  };
  const setup = (w) =>
    Object.defineProperty(w.navigator, "locks", { value: locks });
  const a = await app({}, undefined, setup),
    b = await app({}, undefined, setup);
  try {
    assert.doesNotThrow(() => a.w.TabSync.assertWritable());
    assert.throws(
      () => b.w.TabSync.assertWritable(),
      (e) => e.code === "READ_ONLY_TAB",
    );
    a.w.dispatchEvent(new a.w.Event("pagehide"));
    await new Promise((r) => setTimeout(r, 0));
    b.w.document.querySelector("#tabConflict .btn-primary").click();
    await new Promise((r) => setTimeout(r, 0));
    assert.doesNotThrow(() => b.w.TabSync.assertWritable());
    assert.deepEqual(a.errors, []);
    assert.deepEqual(b.errors, []);
  } finally {
    b.w.dispatchEvent(new b.w.Event("pagehide"));
    a.close();
    b.close();
  }
});

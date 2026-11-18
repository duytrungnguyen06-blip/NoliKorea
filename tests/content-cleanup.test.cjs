const test = require("node:test");
const assert = require("node:assert/strict");
const Store = require("../dist/modules/data-store.js");
const base = require("../dist/curriculum.json");
const { app } = require("./helpers.cjs");

test("curriculum omits Hanja notes but retains pronunciation and number usage", () => {
  assert.doesNotMatch(JSON.stringify(base), /chữ Hán|\p{Script=Han}/u);
  const all = base.stages.flatMap((s) =>
    s.books.flatMap((b) => b.lessons.flatMap((l) => l.items || [])),
  );
  assert.equal(
    all.find((i) => i.korean === "시계").vi,
    "Đồng hồ (phát âm [시게])",
  );
  assert.equal(
    all.find((i) => i.korean === "한강").vi,
    "Sông Hán (con sông biểu tượng tại Seoul)",
  );
  assert.match(all.find((i) => i.korean === "일 (1)").vi, /ngày tháng, tiền, phút/);
});

test("legacy text and review keys migrate without losing schedules, progress or custom notes", () => {
  const old = structuredClone(base);
  const lesson = old.stages[0].books[0].lessons[1];
  const item = lesson.items.find((i) => i.korean === "책");
  item.vi = "Sách (chữ Hán: 冊)";
  lesson.level = 3;
  lesson.studied = true;
  lesson.notes += "\nGhi chú riêng của tôi.";
  const key = JSON.stringify(["s1", "b1a", lesson.id, item.korean, item.vi]);
  old.itemReviews = {
    [key]: {
      sid: "s1",
      bid: "b1a",
      lid: lesson.id,
      korean: item.korean,
      vi: item.vi,
      level: 3,
      lapses: 2,
      dueAt: 123456,
    },
  };
  const cleaned = Store.parse(JSON.stringify(old), base);
  const updated = cleaned.stages[0].books[0].lessons[1];
  assert.equal(updated.items.find((i) => i.id === item.id).vi, "Sách");
  assert.equal(updated.level, 3);
  assert.equal(updated.studied, true);
  assert.match(updated.notes, /Ghi chú riêng của tôi/);
  assert.equal(cleaned.itemReviews[key], undefined);
  const review =
    cleaned.itemReviews[JSON.stringify(["s1", "b1a", lesson.id, item.id])];
  assert.equal(review.vi, "Sách");
  assert.equal(review.dueAt, 123456);
  assert.equal(review.lapses, 2);
  assert.equal(old.itemReviews[key].vi, "Sách (chữ Hán: 冊)");
});

test("stored overrides, recall answers and short-session snapshots lose old annotations while drafts resume", async () => {
  const a = await app();
  let saved, order, draftId;
  try {
    const w = a.w;
    const l = w.db.stages[0].books[0].lessons[1];
    w.openStudyModal("s1", "b1a", l.id);
    w.switchStudyTab("recall");
    order = w.KoreanRecall.exercises.map((e) => e.id).join();
    const input = w.document.querySelector("#recallExercises input");
    draftId = input.id;
    input.value = "내 답변";
    input.dispatchEvent(new w.Event("input", { bubbles: true }));
    w.closeStudyModal();
    w.DailySession.start();
    const active = w.db.dailyPractice.active;
    const item = l.items.find((i) => i.korean === "책");
    Object.assign(active.cards[0], {
      korean: "책",
      vi: "Sách",
      sid: "s1",
      bid: "b1a",
      lid: l.id,
      itemId: item.id,
      options: ["Sách", "Bút chì", "Mũ, nón"],
    });
    w.DailySession.close();
    w.recordMistake({ korean: "책", vi: "Sách" });
    const packed = JSON.parse(w.localStorage.getItem(Store.KEY));
    packed.customizations.overrides[Store.path("s1", "b1a", l.id)] = {
      items: JSON.parse(JSON.stringify(l.items)),
    };
    // Simulate a pre-update backup, including cached questions and signatures.
    saved = JSON.stringify(packed).replaceAll("Sách", "Sách (chữ Hán: 冊)");
    assert.match(saved, /chữ Hán/);
  } finally {
    a.close();
  }
  const b = await app({ [Store.KEY]: saved });
  try {
    const w = b.w;
    assert.doesNotMatch(JSON.stringify(w.db), /chữ Hán/);
    w.openStudyModal("s1", "b1a", "b1a_l2");
    assert.equal(w.KoreanRecall.exercises.map((e) => e.id).join(), order);
    assert.equal(w.document.getElementById(draftId).value, "내 답변");
    assert.equal(w.db.dailyPractice.active.cards[0].vi, "Sách");
    assert.equal(w.db.mistakes[0].vi, "Sách");
    assert.deepEqual(b.errors, []);
  } finally {
    b.close();
  }
});

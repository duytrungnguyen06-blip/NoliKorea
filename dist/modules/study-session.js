/* Save and restore the current exercise set, drafts, tab and scroll position. */
window.StudySession = (() => {
  let restoring = false,
    dirty = false,
    timer;
  let built = { recall: false, production: false };
  let saved = null;
  function prepare(l) {
    clearTimeout(timer);
    dirty = false;
    built = { recall: false, production: false };
    saved = l.session?.signature === signature(l) ? l.session : null;
    KoreanRecall.exercises = [];
    KoreanRecall.stats = { correct: 0, total: 0 };
    KoreanProduction.exercises = [];
    $("recallExercises").replaceChildren();
    $("productionExercises").replaceChildren();
  }
  function ensure(tab) {
    if (!["recall", "production"].includes(tab) || built[tab]) return;
    const l = current();
    if (!l) return;
    built[tab] = true;
    const engine = tab === "recall" ? KoreanRecall : KoreanProduction;
    if (saved?.[tab]) {
      engine.lesson = l;
      engine.db = db;
      engine.exercises = copy(saved[tab].exercises);
      engine.currentFilter = saved[tab].filter || "all";
      if (tab === "recall")
        engine.stats = {
          total: engine.exercises.filter((e) => e.state !== "unanswered")
            .length,
          correct: engine.exercises.filter((e) => e.state === "correct").length,
        };
      engine.render();
      if (tab === "production")
        engine.exercises
          .filter((e) => e.evaluation)
          .forEach((e) => engine.renderEvaluationUI(e));
    } else if (tab === "recall") renderRecall(l);
    else renderProduction(l);
    for (const [id, value] of Object.entries(saved?.drafts || {})) {
      const el = $(id);
      if (el && "value" in el) el.value = value;
    }
  }
  const copy = (x) => JSON.parse(JSON.stringify(x));
  const current = () => ctx && lesson(ctx.sid, ctx.bid, ctx.lid);
  const signature = (l) => JSON.stringify([l.items, l.situations, l.examples]);
  function draftValues() {
    const values = {};
    document
      .querySelectorAll("#studyModal input[id],#studyModal textarea[id]")
      .forEach((e) => (values[e.id] = e.value));
    return values;
  }
  function capture() {
    clearTimeout(timer);
    const l = current();
    if (restoring || !l || !l.items?.length || !l.inProgress || !dirty) return;
    l.session = {
      tab: document.querySelector(".study-tab.active")?.dataset.tab || "input",
      scroll: document.querySelector("#studyModal .study-body").scrollTop,
      signature: signature(l),
      drafts: { ...(saved?.drafts || {}), ...draftValues() },
      recall: built.recall
        ? {
            exercises: copy(KoreanRecall.exercises),
            stats: copy(KoreanRecall.stats),
            filter: KoreanRecall.currentFilter || "all",
          }
        : saved?.recall || null,
      production: built.production
        ? {
            exercises: copy(KoreanProduction.exercises),
            filter: KoreanProduction.currentFilter || "all",
          }
        : saved?.production || null,
    };
    if (save()) {
      saved = copy(l.session);
      dirty = false;
    }
  }
  function touch() {
    const l = current();
    if (!l || restoring || !l.items?.length) return;
    l.inProgress = true;
    dirty = true;
    clearTimeout(timer);
    timer = setTimeout(capture, 1800);
  }
  function tab() {
    touch();
  }
  function restore(l) {
    restoring = true;
    const s = l.session;
    const valid = s?.signature === signature(l);
    const body = document.querySelector("#studyModal .study-body");
    body.scrollTop = 0;
    if (valid) {
      ensure(s.tab);
      switchStudyTab(s.tab);
      for (const [id, value] of Object.entries(s.drafts || {})) {
        const el = $(id);
        if (
          el &&
          document.querySelector("#studyModal").contains(el) &&
          "value" in el
        )
          el.value = value;
      }
    }
    restoring = false;
    requestAnimationFrame(() => {
      body.scrollTop = valid ? s.scroll : 0;
    });
  }
  function reset() {
    const l = current();
    if (!l) return;
    l.session = null;
    touch();
    capture();
  }
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#studyModal").addEventListener("input", touch);
    document.querySelector("#studyModal .study-body").addEventListener(
      "scroll",
      () => {
        if (current()?.inProgress) touch();
      },
      { passive: true },
    );
    for (const name of [
      "checkChoice",
      "checkCloze",
      "checkTyping",
      "checkScramble",
    ]) {
      const original = KoreanRecall[name];
      KoreanRecall[name] = function (id, ...args) {
        const ex = this.exercises.find((e) => e.id === id),
          before = ex?.state;
        const result = original.call(this, id, ...args);
        if (before === "unanswered" && ex?.state !== "unanswered") {
          touch();
          ItemReviews.fromRecall(ex, this.lesson);
          capture();
        }
        return result;
      };
    }
    const evaluate = KoreanProduction.evaluateSentence;
    KoreanProduction.evaluateSentence = function (...args) {
      const result = evaluate.apply(this, args);
      touch();
      capture();
      return result;
    };
    const resetRecall = KoreanRecall.resetSession;
    KoreanRecall.resetSession = function (...args) {
      const result = resetRecall.apply(this, args);
      reset();
      return result;
    };
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) capture();
    });
    window.addEventListener("pagehide", capture);
  });
  return { prepare, ensure, capture, restore, tab, touch, reset };
})();

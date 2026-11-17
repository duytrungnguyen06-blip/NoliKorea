/* Save and restore the current exercise set, drafts, tab and scroll position. */
window.StudySession = (() => {
  let restoring = false,
    dirty = false,
    timer;
  let built = { recall: false, production: false };
  let saved = null;
  let drafts = {};
  function remember(root) {
    root?.querySelectorAll("input[id],textarea[id]").forEach((e) => {
      drafts[e.id] = e.value;
    });
  }
  function restoreDrafts(root) {
    root?.querySelectorAll("input[id],textarea[id]").forEach((e) => {
      if (Object.hasOwn(drafts, e.id)) e.value = drafts[e.id];
    });
  }
  function prepare(l) {
    clearTimeout(timer);
    dirty = false;
    built = { recall: false, production: false };
    saved = l.session?.signature === signature(l) ? l.session : null;
    drafts = copy(saved?.drafts || {});
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
    restoreDrafts($(tab + "Exercises"));
  }
  const copy = (x) => JSON.parse(JSON.stringify(x));
  const current = () => ctx && lesson(ctx.sid, ctx.bid, ctx.lid);
  const signature = (l) => JSON.stringify([l.items, l.situations, l.examples]);
  function capture() {
    clearTimeout(timer);
    const l = current();
    if (restoring || !l || !l.items?.length || !l.inProgress || !dirty) return;
    remember($("studyModal"));
    l.session = {
      tab: document.querySelector(".study-tab.active")?.dataset.tab || "input",
      scroll: document.querySelector("#studyModal .study-body").scrollTop,
      signature: signature(l),
      drafts: copy(drafts),
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
    const restoredLesson = l;
    requestAnimationFrame(() => {
      if (current() !== restoredLesson) return;
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
    for (const [tab, engine] of [
      ["recall", KoreanRecall],
      ["production", KoreanProduction],
    ]) {
      const filter = engine.setFilter;
      engine.setFilter = function (...args) {
        const root = $(tab + "Exercises");
        remember(root);
        window.KoreanVoice?.stt?.stop();
        const result = filter.apply(this, args);
        restoreDrafts(root);
        if (tab === "production")
          this.exercises
            .filter((e) => e.evaluation)
            .forEach((e) => this.renderEvaluationUI(e));
        touch();
        return result;
      };
    }
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
    const toggleToken = KoreanRecall.toggleScrambleToken;
    KoreanRecall.toggleScrambleToken = function (...args) {
      const result = toggleToken.apply(this, args);
      touch();
      return result;
    };
    const resetRecall = KoreanRecall.resetSession;
    KoreanRecall.resetSession = function (...args) {
      remember($("productionExercises"));
      for (const id of Object.keys(drafts))
        if (id.startsWith("input_") || id.startsWith("scVoice_"))
          delete drafts[id];
      if (saved) saved = { ...saved, recall: null };
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

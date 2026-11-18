/* Seoul Glass V4: presentation, theme and accessible interaction. */
window.SeoulUI = (() => {
  const icon = (k) => SeoulIcons[k] || "";
  let activeView = "curriculum";
  let candidate = null;
  const media = matchMedia("(prefers-color-scheme: dark)");
  function setTheme(mode) {
    localStorage.setItem("kla_theme", mode);
    document.documentElement.dataset.theme =
      mode === "system" ? (media.matches ? "dark" : "light") : mode;
    document.querySelectorAll(".theme-toggle").forEach((b) => {
      b.innerHTML = icon(
        document.documentElement.dataset.theme === "dark" ? "sun" : "moon",
      );
    });
    const s = document.getElementById("themePreference");
    if (s) s.value = mode;
    document.querySelector('meta[name="theme-color"]').content =
      document.documentElement.dataset.theme === "dark" ? "#0b1120" : "#fafaf9";
  }
  function cycleTheme() {
    setTheme(
      document.documentElement.dataset.theme === "dark" ? "light" : "dark",
    );
  }
  media.addEventListener("change", () => {
    if (localStorage.getItem("kla_theme") === "system") setTheme("system");
  });
  function allLessons() {
    return db.stages.flatMap((s) =>
      s.books.flatMap((b) =>
        b.lessons.map((l) => ({ ...l, sid: s.id, bid: b.id })),
      ),
    );
  }
  function dashboard() {
    const all = allLessons().filter((l) => l.items?.length);
    const reviews = all
      .filter(isDue)
      .sort((a, b) =>
        (a.nextReviewAt || a.nextReview).localeCompare(
          b.nextReviewAt || b.nextReview,
        ),
      );
    candidate =
      reviews[0] ||
      all
        .filter((l) => l.inProgress)
        .sort((a, b) => (b.lastOpenedAt || 0) - (a.lastOpenedAt || 0))[0] ||
      all.find((l) => !l.studied);
    const box = $("learningDashboard");
    const label = reviews.length
      ? "Ôn tập bài học"
      : candidate?.inProgress
        ? "Tiếp tục bài học"
        : "Bắt đầu bài học";
    box.className = "learning-shortcuts";
    box.innerHTML = `<button type="button" class="btn btn-secondary learning-shortcut" id="continueLearning" ${candidate ? "" : "disabled"}>
      <span class="shortcut-label">${candidate ? label : "Đã học hết bài"}</span>
      ${candidate ? `<span class="shortcut-detail">${esc(candidate.title)}</span>` : ""}
    </button><div id="dailyLauncher" class="daily-launcher"></div>`;
    window.DailySession?.renderLauncher();
    const target = candidate;
    const resume = $("continueLearning");
    if (target) {
      resume.title = `${label}: ${target.title}`;
      resume.setAttribute("aria-label", resume.title);
      resume.addEventListener("click", () => {
        go(target.sid, target.bid);
        openStudyModal(target.sid, target.bid, target.id);
      });
    } else {
      resume.textContent = all.length ? "Đã học hết bài" : "Chưa có bài học";
    }
  }

  function navigate(view, focus = true) {
    activeView = view === "mistakes" ? "progress" : view;
    document
      .querySelectorAll(".view")
      .forEach((v) =>
        v.classList.toggle("active", v.id === activeView + "View"),
      );
    if (activeView === "progress") window.ContentFeedback?.render();
    if (activeView === "review") renderReview();
    if (activeView === "progress") {
      renderProgress();
      renderMistakesView();
    }
    if (activeView === "curriculum") dashboard();
    document.querySelectorAll(".nav-btn[data-view]").forEach((b) => {
      const on = b.dataset.view === activeView;
      b.classList.toggle("active", on);
      if (on) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
    if (focus) $("mainContent").focus({ preventScroll: true });
    if (view === "mistakes")
      $("mistakesView").scrollIntoView({ behavior: "smooth" });
  }
  function completion() {
    StudySession.ensure("recall");
    StudySession.ensure("production");
    const stats = window.KoreanRecall?.stats || {};
    const prod = window.KoreanProduction?.exercises || [];
    const evaluated = prod.filter((e) => e.evaluation);
    $("completionSummary").innerHTML =
      `<div class="completion-icon">${icon("check")}</div><h2>Sẵn sàng cho lần ôn tiếp theo</h2><p>${esc($("studyTitle").textContent)}</p><div class="summary-stats"><span>Recall <b>${stats.correct || 0} đúng / ${stats.total || 0} đã trả lời · ${Math.max(0, (window.KoreanRecall?.exercises?.length || 0) - (stats.total || 0))} chưa làm</b></span><span>Production <b>${evaluated.length} / ${prod.length} bài đã luyện</b><small>Đối chiếu câu mẫu, chưa phải đánh giá ngữ nghĩa từ AI.</small></span></div>`;
    $("productionTab").classList.add("completion-open");
    $("reviewRating").setAttribute("tabindex", "-1");
    $("reviewRating").focus();
    $("reviewRating").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function init() {
    setTheme(localStorage.getItem("kla_theme") || "dark");
    // Keep the existing notebook inside Progress, including its editing/retest functions.
    const mistakes = $("mistakesView");
    mistakes.classList.remove("view");
    mistakes.classList.add("mistakes-section");
    $("progressView").append(mistakes);
    document.querySelector('.main-nav [data-view="mistakes"]').remove();
    const bottom = document.createElement("nav");
    bottom.className = "bottom-nav";
    bottom.setAttribute("aria-label", "Điều hướng trên điện thoại");
    bottom.innerHTML = document.querySelector(".main-nav").innerHTML;
    bottom.querySelectorAll("[id]").forEach((e) => e.removeAttribute("id"));
    document.body.append(bottom);
    const keys = {
      curriculum: "book",
      review: "bell",
      progress: "chart",
      settings: "settings",
    };
    document.querySelectorAll(".nav-btn[data-view]").forEach((b) => {
      b.querySelector(".nav-icon").innerHTML = icon(keys[b.dataset.view]);
      b.onclick = () => navigate(b.dataset.view);
    });
    document.querySelector(".search-icon").innerHTML = icon("search");
    document.querySelector(".ai-sparkle-icon").innerHTML = icon("spark");
    document
      .querySelector(".header-ai-btn")
      .setAttribute("aria-label", "Mở Bạn học AI");
    document.querySelector(".header-ai-btn").onclick = () =>
      openGlobalAIBot("chat");
    document.querySelectorAll(".modal-close").forEach((b) => {
      b.innerHTML = icon("close");
      b.setAttribute("aria-label", "Đóng");
    });
    document.querySelectorAll(".modal").forEach((m) => {
      m.setAttribute("role", "dialog");
      m.setAttribute("aria-modal", "true");
      const h = m.querySelector("h2,h3");
      if (h) {
        if (!h.id) h.id = m.id + "Heading";
        m.setAttribute("aria-labelledby", h.id);
      } else m.setAttribute("aria-label", "Hộp thoại");
    });
    document.querySelector(".study-tabs").setAttribute("role", "tablist");
    document.querySelectorAll(".study-tab").forEach((b) => {
      b.id = "tab-" + b.dataset.tab;
      b.setAttribute("role", "tab");
      b.setAttribute("aria-controls", b.dataset.tab + "Tab");
      const panel = $(b.dataset.tab + "Tab");
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", b.id);
      b.addEventListener("click", updateTabs);
      b.addEventListener("keydown", (e) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
        e.preventDefault();
        const tabs = [...document.querySelectorAll(".study-tab")];
        const i = tabs.indexOf(b);
        const n =
          e.key === "Home"
            ? 0
            : e.key === "End"
              ? tabs.length - 1
              : (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) %
                tabs.length;
        tabs[n].click();
        tabs[n].focus();
      });
    });
    const oldStreak = recordDailyStreak;
    recordDailyStreak = function () {
      const before = db.streak?.count || 0;
      oldStreak();
      const n = db.streak?.count || 0;
      if (n > before && (n === 7 || n === 30 || n % 100 === 0)) {
        const t = document.createElement("div");
        t.className = "milestone-toast";
        t.setAttribute("role", "status");
        t.textContent = `Bạn đã học liên tiếp ${n} ngày. Tiếp tục nhé!`;
        document.body.append(t);
        setTimeout(() => t.remove(), 5000);
      }
    };
    const oldRender = render;
    render = function () {
      oldRender();
      dashboard();
    };
    const oldBadge = badge;
    badge = function () {
      const total = oldBadge();
      document.querySelectorAll(".bottom-nav .review-badge").forEach((b) => {
        if (b.textContent !== String(total)) b.textContent = total;
        b.classList.toggle("visible", total > 0);
      });
    };
    if (db.stages.length === 1 && db.stages[0].books.length === 1)
      go(db.stages[0].id, db.stages[0].books[0].id, false);
    navigate("curriculum", false);
    updateTabs();
    enhance();
    new MutationObserver((records) => {
      const roots = new Set();
      for (const record of records) {
        for (const node of record.addedNodes)
          if (node.nodeType === 1) roots.add(node);
        // Text/icon changes can alter an existing button's accessible state.
        if (record.target.matches?.("button,.icon-btn,.study-action-btn"))
          roots.add(record.target);
      }
      for (const root of roots) {
        if (!root.isConnected) continue;
        let parent = root.parentElement;
        while (parent && !roots.has(parent)) parent = parent.parentElement;
        if (!parent) enhance(root);
      }
    }).observe(document.body, {
      childList: true,
      subtree: true,
    });
    setInterval(() => {
      badge();
      if (activeView === "progress") window.ContentFeedback?.render();
      if (activeView === "review") renderReview();
    }, 30000);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        badge();
        dashboard();
        if (activeView === "progress") window.ContentFeedback?.render();
        if (activeView === "review") renderReview();
      }
    });
    setupFocus();
  }
  function updateTabs() {
    document.querySelectorAll(".study-tab").forEach((b) => {
      const selected = b.classList.contains("active");
      b.setAttribute("aria-selected", selected);
      b.tabIndex = selected ? 0 : -1;
    });
  }
  function enhance(root = document) {
    const select = (selector) => [
      ...(root.matches?.(selector) ? [root] : []),
      ...root.querySelectorAll(selector),
    ];
    select(
      ".stage-card[onclick],.book-card[onclick],.lesson-card[onclick],.lesson-card[data-study],.breadcrumb-item[onclick]",
    ).forEach((e) => {
      if (e.hasAttribute("tabindex")) return;
      e.tabIndex = 0;
      e.setAttribute("role", "button");
      e.addEventListener("keydown", (ev) => {
        if (
          !e.hasAttribute("data-study") &&
          ev.target === e &&
          ["Enter", " "].includes(ev.key)
        ) {
          ev.preventDefault();
          e.click();
        }
      });
    });
    for (const el of select("#soundToggleBtn,#anatomySettingBtn")) {
      if (el) {
        el.setAttribute("role", "switch");
        el.setAttribute("aria-checked", !el.textContent.includes("Tắt"));
      }
    }
    select("button[title]:not([aria-label])").forEach((e) =>
      e.setAttribute("aria-label", e.title),
    );
    const replacements = {
      "✏️": "edit",
      "🗑️": "trash",
      "🔊": "volume",
      "🎙️": "mic",
      "➕": "plus",
    };
    select(".icon-btn,.study-action-btn").forEach((e) => {
      const k = replacements[e.textContent.trim()];
      if (k) e.innerHTML = icon(k);
    });
  }
  function setupFocus() {
    const previous = new Map();
    let lastFocus = document.activeElement;
    document.addEventListener("focusin", () => {
      lastFocus = document.activeElement;
    });
    const visible = (m) =>
      m.classList.contains("active") && !m.classList.contains("hidden");
    const focusable = (m) =>
      [
        ...m.querySelectorAll(
          'button,input,textarea,select,a[href],[tabindex="0"]',
        ),
      ].filter((e) => !e.disabled && e.getClientRects().length);
    document.querySelectorAll(".modal").forEach((m) =>
      new MutationObserver(() => {
        if (visible(m) && !previous.has(m)) {
          previous.set(m, lastFocus);
          (focusable(m)[0] || m).focus();
          if (m.id === "studyModal") updateTabs();
        } else if (!visible(m) && previous.has(m)) {
          const el = previous.get(m);
          previous.delete(m);
          if (el?.isConnected) el.focus();
        }
        document.body.classList.toggle(
          "dialog-open",
          [...document.querySelectorAll(".modal")].some(visible),
        );
      }).observe(m, { attributes: true, attributeFilter: ["class"] }),
    );
    document.addEventListener(
      "keydown",
      (e) => {
        const modals = [...document.querySelectorAll(".modal")].filter(visible);
        const m = modals.at(-1);
        if (!m) return;
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopImmediatePropagation();
          const closers = {
            dailyModal: () => DailySession.close(),
            aiModal: closeAiModal,
            studyModal: closeStudyModal,
            rolePlayModal: closeRolePlayModal,
            lessonModal: closeLessonModal,
            bookModal: closeBookModal,
            stageModal: closeStageModal,
          };
          closers[m.id]?.();
          return;
        }
        if (e.key === "Tab") {
          const list = focusable(m);
          if (!list.length) {
            e.preventDefault();
            return;
          }
          const first = list[0],
            last = list.at(-1);
          if (
            e.shiftKey &&
            (document.activeElement === first ||
              !m.contains(document.activeElement))
          ) {
            e.preventDefault();
            last.focus();
          } else if (
            !e.shiftKey &&
            (document.activeElement === last ||
              !m.contains(document.activeElement))
          ) {
            e.preventDefault();
            first.focus();
          }
        }
      },
      true,
    );
  }
  document.addEventListener("DOMContentLoaded", init);
  return { setTheme, cycleTheme, navigate, completion };
})();

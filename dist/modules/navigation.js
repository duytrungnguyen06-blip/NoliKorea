function navBtns() {
  document.querySelectorAll(".nav-btn[data-view]").forEach((b) => {
    b.onclick = () => {
      if (window.KoreanVoice) window.KoreanVoice.stop();
      document
        .querySelectorAll(".nav-btn[data-view]")
        .forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      document
        .querySelectorAll(".view")
        .forEach((v) => v.classList.remove("active"));
      $(b.dataset.view + "View").classList.add("active");
      if (b.dataset.view === "review") renderReview();
      if (b.dataset.view === "progress") renderProgress();
      if (b.dataset.view === "mistakes") renderMistakesView();
    };
  });
}

function badge() {
  const n = due().length + (window.ItemReviews?.dueItems().length || 0);
  const el = $("reviewCount");
  if (el) {
    el.textContent = n;
    el.classList.toggle("visible", n > 0);
  }
  updateMistakesBadge();
}

function go(sid, bid, push = true) {
  nav = { sid, bid };
  if (push && window.history && window.history.pushState) {
    history.pushState({ sid, bid }, "");
  }
  render();
}

function goBack() {
  if (nav.bid) {
    go(nav.sid, null);
  } else if (nav.sid) {
    go(null, null);
  }
}

// ─── Forms Setup ─────────────────────────────────
function forms() {
  $("stageForm").onsubmit = saveStage;
  $("bookForm").onsubmit = saveBook;
  $("lessonForm").onsubmit = saveLesson;

  // Study tabs
  document.querySelectorAll(".study-tab").forEach((tab) => {
    tab.onclick = () => {
      document
        .querySelectorAll(".study-tab")
        .forEach((t) => t.classList.remove("active"));
      document
        .querySelectorAll(".study-content")
        .forEach((c) => c.classList.remove("active"));
      tab.classList.add("active");
      const content = $(tab.dataset.tab + "Tab");
      content.classList.add("active");
      if (tab.dataset.tab !== "input") window.KoreanVoice?.nativeAudio?.pause();
      checkFloatingAudioVisibility();
      updateStudyProgress(tab.dataset.tab);
      StudySession.ensure(tab.dataset.tab);
      StudySession.tab(tab.dataset.tab);

      // If virtual keyboard is open, auto-focus first input in newly active tab
      if (window.KoreanKeyboard && window.KoreanKeyboard.isOpen()) {
        const firstInput = content.querySelector(
          "input.blank-input, textarea.production-input, input, textarea",
        );
        if (firstInput) {
          firstInput.focus();
          window.KoreanKeyboard.activeTarget = firstInput;
        }
      }
    };
  });
}

function updateStudyProgress(tabName) {
  const fill = $("studyProgressFill");
  const status = $("studyProgressStatus");
  if (!fill || !status) return;

  if (tabName === "input") {
    fill.style.width = "33%";
    status.innerHTML =
      "Bước 1/3: 📖 <b>Đọc hiểu tự nhiên</b> (Comprehensible Input)";
  } else if (tabName === "recall") {
    fill.style.width = "66%";
    status.innerHTML = "Bước 2/3: 🧠 <b>Chủ động truy xuất</b> (Active Recall)";
  } else if (tabName === "production") {
    fill.style.width = "100%";
    status.innerHTML = "Bước 3/3: ✍️ <b>Sản sinh & Hội thoại</b> (Production)";
  }
}

// ─── Study Flow Navigation (Item 1) ──────────────────────────────
function switchStudyTab(tabName) {
  const tabBtn = document.querySelector(`.study-tab[data-tab="${tabName}"]`);
  if (tabBtn) tabBtn.click();
  const modalContent = document.querySelector("#studyModal .modal-body");
  if (modalContent) modalContent.scrollTo({ top: 0, behavior: "smooth" });
}

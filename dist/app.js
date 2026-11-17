function formatStudyNotes(text) {
  if (!text) return "";
  const lines = text.split("\n");
  let html = "";
  lines.forEach((line) => {
    let l = esc(line);
    l = l.replace(/\*\*([^*]+)\*\*/g, '<b class="text-accent">$1</b>');
    if (l.startsWith("📚") || /^[0-9]+\.\s+/.test(line.trim())) {
      html += `<div class="notes-heading">${l}</div>`;
    } else if (line.trim().startsWith("- ")) {
      html += `<div class="notes-list">• ${l.trim().slice(2)}</div>`;
    } else if (line.trim().startsWith("* ")) {
      html += `<div class="notes-sublist">▫️ ${l.trim().slice(2)}</div>`;
    } else {
      html += `<div>${l}</div>`;
    }
  });
  return html;
}

/* KLA v4.1 — initialization, state and shared helpers */

// ─── State ───────────────────────────────────────
let db = { stages: [] };
let nav = { sid: null, bid: null };
let ctx = null; // current study context { sid, bid, lid }

// ─── Helpers ─────────────────────────────────────
const $ = (id) => document.getElementById(id);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const localDate = KLAScheduler.localDate;
const today = () => localDate();
const isDue = (l) => KLAScheduler.due(l);
const reviewLabel = (l) =>
  l.nextReviewAt
    ? new Date(l.nextReviewAt).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : l.nextReview || "";
Object.defineProperties(window, {
  db: { get: () => db },
  nav: { get: () => nav },
});
const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDate(d);
};
const esc = (t) =>
  (t || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const cleanKoreanStr = (s) =>
  (s || "").replace(/[\s.,?!~·:;'"()\[\]{}]+/g, "").trim();
const stage = (sid) => db.stages.find((s) => s.id === sid);
const book = (sid, bid) => stage(sid)?.books.find((b) => b.id === bid);
const lesson = (sid, bid, lid) =>
  book(sid, bid)?.lessons.find((l) => l.id === lid);
const due = () => {
  const t = today();
  return db.stages.flatMap((s) =>
    s.books.flatMap((b) =>
      b.lessons
        .filter((l) => isDue(l))
        .map((l) => ({ ...l, sid: s.id, bid: b.id })),
    ),
  );
};

// Migrate old lesson format (single content/translation) → items[]
function migrateLessonItems(l) {
  if (l.items && l.items.length > 0) return;
  if (!l.content && !l.translation && !l.translationEn) {
    l.items = [];
    return;
  }
  // Split old content by newlines, pair with translations
  const korLines = (l.content || "").split("\n").filter(Boolean);
  const viLines = (l.translation || "").split("\n").filter(Boolean);
  const enLines = (l.translationEn || "").split("\n").filter(Boolean);
  const max = Math.max(korLines.length, viLines.length, enLines.length, 1);
  l.items = [];
  for (let i = 0; i < max; i++) {
    l.items.push({
      korean: korLines[i] || "",
      vi: viLines[i] || "",
      en: enLines[i] || "",
    });
  }
}

// ─── Init ────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  load();
  navBtns();
  forms();
  initGlobalSearch();
  initSoundToggle();
  initAnatomySetting();
  initNativeAudioEventListeners();
  initAudioKeyboardShortcuts();
  render();
  badge();
  updateStreakBadge();

  // Populate API key input if stored
  const apiKeyInput = $("geminiApiKeyInput");
  if (apiKeyInput)
    apiKeyInput.value = localStorage.getItem("kla_gemini_api_key") || "";

  // Listen to Enter on AI chat input
  const chatInput = $("aiChatInput");
  if (chatInput) {
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendAiChatMessage();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });
  window.addEventListener("popstate", (e) => {
    if (e.state) {
      nav = { sid: e.state.sid || null, bid: e.state.bid || null };
    } else {
      nav = { sid: null, bid: null };
    }
    render();
  });
});

// ─── Seoul National University Korean 1A (Bài 1 Standard Seed) ────
// ─── Persistence ─────────────────────────────────
let dataStore;
function dataNotice(message) {
  let box = $("dataNotice");
  if (!box) {
    box = document.createElement("div");
    box.id = "dataNotice";
    box.className = "data-notice";
    box.setAttribute("role", "alert");
    document.querySelector(".main-content").prepend(box);
  }
  box.textContent = message;
}
function load() {
  dataStore = KLAStore.create(
    localStorage,
    window.CURRICULUM_DATA || window.DEFAULT_CURRICULUM || { stages: [] },
  );
  try {
    db = dataStore.read();
    initStreak();
  } catch (e) {
    db = KLAStore.validate({ stages: [] });
    dataNotice(
      "Chưa thể đọc/lưu dữ liệu: " +
        e.message +
        " Dữ liệu gốc được giữ nguyên. Vào Cài đặt để xuất dữ liệu gốc hoặc khôi phục.",
    );
  }
  updateMistakesBadge();
}
function save() {
  try {
    window.TabSync?.assertWritable();
    dataStore.save(db);
    $("dataNotice")?.remove();
  } catch (e) {
    if (e.code === "STALE_DATA" || e.code === "READ_ONLY_TAB") {
      window.TabSync?.showConflict(e.message);
      return false;
    }
    const old = dataStore.lastGood();
    if (old) db = old;
    dataNotice(
      "Không lưu được thay đổi: " +
        e.message +
        " Hãy xuất dữ liệu trước khi giải phóng dung lượng.",
    );
    return false;
  }
  badge();
  updateStreakBadge();
  return true;
}
function replaceData(next, reason) {
  try {
    window.TabSync?.assertWritable();
    const valid = dataStore.replace(next, reason);
    db = valid;
    nav = { sid: null, bid: null };
    ctx = null;
    closeAll();
    $("dataNotice")?.remove();
    render();
    badge();
    return true;
  } catch (e) {
    dataNotice("Không thay thế dữ liệu: " + e.message);
    return false;
  }
}

// ─── Close All Modals ────────────────────────────
function closeAll() {
  if ($("dailyModal")?.classList.contains("active"))
    window.DailySession?.close();
  if (window.KoreanVoice) window.KoreanVoice.stop();
  window.KoreanAI?.close();
  closeRolePlayModal();
  closeStudyModal();
  document
    .querySelectorAll(".modal")
    .forEach((m) => m.classList.remove("active"));
}

// ─── Top-level Navigation ────────────────────────
// ─── Web Audio Haptic Sound Settings (Item 3) ────────────────────
function initSoundToggle() {
  const isEnabled = window.KoreanSound ? window.KoreanSound.enabled : true;
  updateSoundToggleBtn(isEnabled);
}

function toggleSoundFX() {
  if (window.KoreanSound) {
    const enabled = window.KoreanSound.toggle();
    updateSoundToggleBtn(enabled);
    if (enabled) window.KoreanSound.playCorrect();
  }
}

function updateSoundToggleBtn(enabled) {
  const btn = $("soundToggleBtn");
  if (!btn) return;
  btn.textContent = enabled ? "🔊 Bật" : "🔇 Tắt";
  btn.classList.toggle("active", enabled);
}

// ─── Sentence Anatomy Settings & Toggle ──────────────────────────
function initAnatomySetting() {
  const enabled = localStorage.getItem("kla_anatomy_enabled") !== "false";
  window.anatomyEnabled = enabled;
  applyAnatomyState(enabled);
}

function toggleAnatomy() {
  window.anatomyEnabled = !window.anatomyEnabled;
  localStorage.setItem("kla_anatomy_enabled", String(window.anatomyEnabled));
  applyAnatomyState(window.anatomyEnabled);
}

function applyAnatomyState(enabled) {
  document.body.classList.toggle("hide-anatomy", !enabled);
  const btnInput = $("btnToggleAnatomy");
  const btnSetting = $("anatomySettingBtn");
  if (btnInput) btnInput.classList.toggle("active", enabled);
  if (btnSetting) {
    btnSetting.textContent = enabled ? "🧩 Bật" : "Ẩn";
    btnSetting.classList.toggle("active", enabled);
  }
}

let activeNativeAudioTrack = null;

// ─── Interactive Role-play Dialogue Partner Engine ───────────────────

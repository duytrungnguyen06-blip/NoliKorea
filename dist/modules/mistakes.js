/* KLA v4.1 mistakes.js */
function recordMistake({ korean, vi, reason, lessonTitle, lessonId }) {
  if (!korean) return;
  if (!db.mistakes) db.mistakes = [];

  const cleanK = cleanKoreanStr(korean);
  const existing = db.mistakes.find((m) => cleanKoreanStr(m.korean) === cleanK);

  if (existing) {
    existing.correctStreak = 0;
    existing.failedCount = (existing.failedCount || 1) + 1;
    existing.lastFailed = today();
    if (reason) existing.reason = reason;
  } else {
    db.mistakes.unshift({
      id: uid(),
      korean: korean.trim(),
      vi: (vi || "").trim(),
      reason: reason || "Luyện tập",
      lessonTitle: lessonTitle || "Bài học",
      lessonId: lessonId || null,
      correctStreak: 0,
      failedCount: 1,
      addedAt: today(),
      lastFailed: today(),
    });
  }

  save();
  updateMistakesBadge();
}

function updateMistakesBadge() {
  const active = (db.mistakes || []).filter((m) => (m.correctStreak || 0) < 2);
  const el = $("mistakesBadge");
  if (el) {
    el.textContent = active.length;
    el.classList.toggle("visible", active.length > 0);
  }
}

function renderMistakesView() {
  const list = $("mistakesList");
  const empty = $("mistakesEmpty");
  if (!list || !empty) return;

  const mistakes = db.mistakes || [];
  if (mistakes.length === 0) {
    list.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");
  let html = "";

  mistakes.forEach((m) => {
    const korSafe = esc(m.korean);
    const streak = m.correctStreak || 0;
    const isGraduated = streak >= 2;
    const anatomyHtml = window.KoreanAnatomy
      ? window.KoreanAnatomy.renderHtml(m.korean, {}, true)
      : "";

    html += `
        <div class="mistake-card ${isGraduated ? "graduated" : ""}" id="mistakeCard_${m.id}">
            <div class="mistake-card-header">
                <div class="mistake-reason-badge">⚠️ ${esc(m.reason || "Cần ôn luyện")}</div>
                <div class="mistake-lesson-source">${esc(m.lessonTitle || "Bài học")}</div>
            </div>

            <div class="mistake-korean-row">
                <div class="mistake-korean-text">${esc(m.korean)}</div>
                <div class="mistake-actions">
                    <button type="button" class="study-action-btn" data-speak="${korSafe}" title="Nghe phát âm">🔊</button>
                    <button type="button" class="study-action-btn" data-practice="${korSafe}" data-feedback="mistakeVoice_${m.id}" title="Luyện nói">🎙️</button>
                    <button type="button" class="icon-btn danger" onclick="deleteMistake('${m.id}')" title="Xóa khỏi sổ">✕</button>
                </div>
            </div>

            ${anatomyHtml}

            ${m.vi ? `<div class="mistake-vi-text">${esc(m.vi)}</div>` : ""}
            <div class="speech-feedback" id="mistakeVoice_${m.id}"></div>

            <div class="mistake-card-footer">
                <div class="mistake-streak-wrap">
                    <span class="mistake-streak-label">Tiến trình sửa lỗi:</span>
                    <div class="mistake-streak-pills">
                        <span class="streak-step ${streak >= 1 ? "done" : ""}">1</span>
                        <span class="streak-step ${streak >= 2 ? "done" : ""}">2</span>
                    </div>
                    <span class="mistake-streak-status">
                        ${isGraduated ? "🎓 Đã tốt nghiệp!" : streak === 1 ? "⚡ Đúng 1/2 lần — còn 1 lần!" : "Chưa khắc phục"}
                    </span>
                </div>

                <button type="button" class="btn btn-secondary btn-retest" onclick="openMistakeRetest('${m.id}')">
                    ${isGraduated ? "🔄 Luyện lại" : "✍️ Thử thách sửa lỗi"}
                </button>
            </div>

            <div class="mistake-test-box hidden" id="testBox_${m.id}">
                <div class="mistake-test-prompt">Nhập lại câu tiếng Hàn chính xác:</div>
                <div class="mistake-test-input-row">
                    <input type="text" class="mistake-test-input" id="testInput_${m.id}" placeholder="Gõ tiếng Hàn vào đây..." autocomplete="off">
                    <button type="button" class="btn btn-primary" onclick="submitMistakeTest('${m.id}')">Kiểm tra</button>
                </div>
                <div class="mistake-test-feedback" id="testFb_${m.id}"></div>
            </div>
        </div>`;
  });

  list.innerHTML = html;
}

const submittedMistakes = new Set();
function openMistakeRetest(id) {
  submittedMistakes.delete(id);
  const box = $(`testBox_${id}`);
  if (!box) return;
  box.classList.toggle("hidden");
  if (!box.classList.contains("hidden")) {
    const input = $(`testInput_${id}`);
    if (input) {
      input.value = "";
      input.focus();
      if (window.KoreanKeyboard && window.KoreanKeyboard.isOpen()) {
        window.KoreanKeyboard.activeTarget = input;
      }
    }
  }
}

function submitMistakeTest(id) {
  if (submittedMistakes.has(id)) return;
  const m = (db.mistakes || []).find((x) => x.id === id);
  if (!m) return;
  const input = $(`testInput_${id}`);
  const fb = $(`testFb_${id}`);
  if (!input || !fb) return;

  const userVal = cleanKoreanStr(input.value);
  const targetVal = cleanKoreanStr(m.korean);
  const isCorrect = userVal === targetVal;

  if (isCorrect) {
    submittedMistakes.add(id);
    m.correctStreak = (m.correctStreak || 0) + 1;
    if (window.KoreanSound) {
      if (m.correctStreak >= 2) window.KoreanSound.playFanfare();
      else window.KoreanSound.playCorrect();
    }
    fb.innerHTML = `<span class="colored-text-47">🎉 Tuyệt vời! Bạn đã gõ hoàn toàn chính xác.</span>`;
    setTimeout(() => {
      save();
      renderMistakesView();
    }, 1200);
  } else {
    m.correctStreak = 0;
    if (window.KoreanSound) window.KoreanSound.playIncorrect();
    fb.innerHTML = `<span class="colored-text-48">❌ Chưa khớp. Hãy nhìn câu mẫu ở trên và thử lại nhé!</span>`;
  }
}

function deleteMistake(id) {
  if (!db.mistakes) return;
  db.mistakes = db.mistakes.filter((m) => m.id !== id);
  save();
  renderMistakesView();
}

function clearGraduatedMistakes() {
  if (!db.mistakes) return;
  const countBefore = db.mistakes.length;
  db.mistakes = db.mistakes.filter((m) => (m.correctStreak || 0) < 2);
  const removed = countBefore - db.mistakes.length;
  save();
  renderMistakesView();
  if (removed > 0) alert(`🧹 Đã dọn dẹp ${removed} câu đã tốt nghiệp khỏi sổ!`);
  else
    alert("Chưa có câu nào đạt trạng thái tốt nghiệp (đúng 2 lần liên tiếp).");
}

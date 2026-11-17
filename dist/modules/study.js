/* KLA v4.1 study.js */
function openStudyModal(sid, bid, lid) {
  const l = lesson(sid, bid, lid);
  if (!l) return;

  StudySession.capture();
  window.KoreanVoice?.tts?.stop();
  window.KoreanVoice?.stt?.stop();
  ctx = { sid, bid, lid };
  l.lastOpenedAt = Date.now();
  save();

  $("studyTitle").textContent = l.title;

  // Render items into studyContent
  const items = l.items || [];
  let contentHtml = "";
  if (items.length === 0) {
    contentHtml =
      '<p class="text-muted">(Chưa có nội dung — hãy sửa bài học để thêm mục)</p>';
  } else {
    const extraDict = {};
    items.forEach((it) => {
      if (it.korean && it.vi) extraDict[it.korean] = it.vi;
    });

    items.forEach((item, i) => {
      const korSafe = esc(item.korean);
      const anatomyHtml = window.KoreanAnatomy
        ? window.KoreanAnatomy.renderHtml(item.korean, extraDict)
        : "";
      contentHtml += `
            <div class="study-item" id="studyItem_${i}">
                <div class="study-item-num">${i + 1}</div>
                <div class="study-item-body">
                    <div class="study-item-header">
                        <div class="study-item-korean">${esc(item.korean)}</div>
                        <div class="study-item-actions">
                            <button type="button" class="study-action-btn" data-flag-item="${i}" title="Đánh dấu nội dung cần xem lại" aria-label="Đánh dấu nội dung cần xem lại">⚑</button>
                            <button type="button" class="study-action-btn" data-speak="${esc(item.korean)}" title="Nghe phát âm">🔊</button>
                            <button type="button" class="study-action-btn" data-practice="${esc(item.korean)}" data-feedback="speechFeedback_${i}" title="Luyện nói câu này (Micro)">🎙️</button>
                        </div>
                    </div>
                    ${anatomyHtml}
                    ${item.vi ? `<div class="study-item-vi hidden">${esc(item.vi)}</div>` : ""}
                    ${item.en ? `<div class="study-item-en hidden">${esc(item.en)}</div>` : ""}
                    <div class="speech-feedback" id="speechFeedback_${i}"></div>
                </div>
            </div>`;
    });
  }
  $("studyContent").innerHTML = contentHtml;

  // Reset TTS speed buttons based on saved rate
  if (window.KoreanVoice) {
    const curRate = window.KoreanVoice.getRate();
    $("ttsSpeedSlow")?.classList.toggle("active", curRate <= 0.85);
    $("ttsSpeedNormal")?.classList.toggle("active", curRate > 0.85);
  }

  // Reset toggle buttons
  $("btnTransVi").classList.remove("active");
  $("btnTransEn").classList.remove("active");

  // Notes
  const notesEl = $("studyNotesSection");
  if (l.notes) {
    notesEl.innerHTML = formatStudyNotes(l.notes);
    notesEl.classList.remove("hidden");
  } else {
    notesEl.classList.add("hidden");
  }

  // Reset tabs to Input
  document
    .querySelectorAll(".study-tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".study-content")
    .forEach((c) => c.classList.remove("active"));
  document
    .querySelector('.study-tab[data-tab="input"]')
    .classList.add("active");
  $("inputTab").classList.add("active");

  // Render Official Native CD Audio Player (SNU 1A)
  renderNativeAudioPanel(l.id);

  // Render Contextual Mini-Dialogue (Trục 1: Comprehensible Input)
  renderInputMiniDialogue(l);

  // Reset Study Progress Stepper to Step 1 (Input)
  updateStudyProgress("input");

  // Hidden exercise tabs are built only when visited.
  StudySession.prepare(l);

  // Reset rating
  $("reviewRating").classList.add("hidden");
  if ($("studyCompleteBtn")) $("studyCompleteBtn").classList.remove("hidden");
  $("productionTab").classList.remove("completion-open");

  $("studyModal").classList.add("active");
  StudySession.restore(l);
}

function closeStudyModal() {
  StudySession.capture();
  window.KoreanVoice?.stt?.stop();
  if (window.KoreanVoice) window.KoreanVoice.stop();
  stopNativeAudio();
  $("studyModal").classList.remove("active");
  ctx = null;
}

// ─── Contextual Mini-Dialogue (Trục 1: Comprehensible Input) ───────
window._activeDiagIndex = window._activeDiagIndex || {};
window._dialogueSettings = window._dialogueSettings || {
  blurKorean: false,
  showVi: true,
  showAnatomy: true,
};

function switchInputDialogue(lid, idx) {
  if (!window._activeDiagIndex) window._activeDiagIndex = {};
  window._activeDiagIndex[lid] = idx;

  // Smart default: If switching to Listening dialogue (lis1/lis2), default to blind listening!
  const richDialogues =
    (window.LESSON_DIALOGUES && window.LESSON_DIALOGUES[lid]) || null;
  if (richDialogues && richDialogues[idx]) {
    const diag = richDialogues[idx];
    if (diag.id && diag.id.startsWith("lis")) {
      window._dialogueSettings.blurKorean = true;
      window._dialogueSettings.showVi = false;
      window._dialogueSettings.showAnatomy = false;
    } else {
      window._dialogueSettings.blurKorean = false;
      window._dialogueSettings.showVi = true;
      window._dialogueSettings.showAnatomy = true;
    }
  }

  let l = ctx && ctx.lid === lid ? lesson(ctx.sid, ctx.bid, ctx.lid) : null;
  if (!l && db && db.stages) {
    for (const s of db.stages) {
      for (const b of s.books || []) {
        for (const item of b.lessons || []) {
          if (item.id === lid) {
            l = item;
            break;
          }
        }
        if (l) break;
      }
      if (l) break;
    }
  }
  if (l) {
    renderInputMiniDialogue(l);
    // Highlight matching track pill in nativeAudioPanel if present
    if (richDialogues && richDialogues[idx]) {
      const diag = richDialogues[idx];
      document.querySelectorAll(".native-track-btn").forEach((b) => {
        b.classList.toggle("active", b.getAttribute("data-file") === diag.file);
      });
    }
  }
}

function toggleDialogueBlur(lid) {
  window._dialogueSettings.blurKorean = !window._dialogueSettings.blurKorean;
  const l = ctx && ctx.lid === lid ? lesson(ctx.sid, ctx.bid, ctx.lid) : null;
  if (l) renderInputMiniDialogue(l);
}

function toggleDialogueVi(lid) {
  window._dialogueSettings.showVi = !window._dialogueSettings.showVi;
  const l = ctx && ctx.lid === lid ? lesson(ctx.sid, ctx.bid, ctx.lid) : null;
  if (l) renderInputMiniDialogue(l);
}

function toggleDialogueAnatomy(lid) {
  window._dialogueSettings.showAnatomy = !window._dialogueSettings.showAnatomy;
  const l = ctx && ctx.lid === lid ? lesson(ctx.sid, ctx.bid, ctx.lid) : null;
  if (l) renderInputMiniDialogue(l);
}

function peekKoreanText(el) {
  if (el) el.classList.toggle("korean-peek");
}

function renderInputMiniDialogue(l) {
  const box = $("inputDialogueShowcase");
  if (!box) return;

  // Check if authentic textbook dialogue exists in LESSON_DIALOGUES
  const richDialogues =
    (window.LESSON_DIALOGUES && window.LESSON_DIALOGUES[l.id]) || null;

  if (richDialogues && richDialogues.length > 0) {
    const activeIdx =
      window._activeDiagIndex && window._activeDiagIndex[l.id]
        ? window._activeDiagIndex[l.id]
        : 0;
    const activeDiag = richDialogues[activeIdx] || richDialogues[0];

    box.classList.remove("hidden");

    let html = `
            <div class="input-dialogue-card">
        `;

    // Render clean tab selector
    if (richDialogues.length > 1) {
      html += `
                <div class="action-row-38 input-dialogue-tabs">
                    ${richDialogues
                      .map(
                        (d, i) => `
                        <button type="button" class="compact-text-39 btn btn-sm ${i === activeIdx ? "btn-primary" : "btn-secondary"} input-dialogue-tab-btn" onclick="switchInputDialogue('${l.id}', ${i})">
                            ${esc(d.shortTitle || d.title)}
                        </button>
                    `,
                      )
                      .join("")}
                </div>
            `;
    }

    // Clean Header: Clean Title + 1 Context Sentence + Action Buttons
    html += `
                <div class="action-row-40 input-dialogue-header">
                    <div>
                        <div class="input-dialogue-badge">💬 ${esc(activeDiag.title)}</div>
                        <div class="input-dialogue-sub">${esc(activeDiag.context || activeDiag.sub || "")}</div>
                    </div>
                    <div class="action-row-41">
                        ${
                          activeDiag.track && activeDiag.file
                            ? `
                            <button type="button" class="compact-text-42 btn btn-secondary btn-sm" onclick="selectAndPlayNativeTrack('${activeDiag.file}', '${esc(activeDiag.shortTitle || activeDiag.title)}', '${esc(activeDiag.context || activeDiag.title)}')" title="Phát audio CD gốc chuẩn xác">
                                <span>▶ Nghe CD</span>
                            </button>
                        `
                            : ""
                        }
                        <button type="button" class="compact-text-43 btn btn-primary btn-sm" onclick="openRolePlayModal('${l.id}', ${activeIdx})" title="Luyện đóng vai đối thoại cùng AI">
                            <span>🎭 Luyện đóng vai</span>
                        </button>
                    </div>
                </div>

                <!-- Blind Listening & Dialogue Controls Bar -->
                <div class="dialogue-controls-bar">
                    <div class="dialogue-tool-group">
                        <button type="button" class="dialogue-tool-btn ${!window._dialogueSettings.blurKorean ? "active" : ""}" onclick="toggleDialogueBlur('${l.id}')" title="Ẩn/Hiện chữ tiếng Hàn để luyện nghe">
                            <span>👁️ ${window._dialogueSettings.blurKorean ? "Hiện chữ Hàn" : "Che chữ Hàn"}</span>
                        </button>
                        <button type="button" class="dialogue-tool-btn ${window._dialogueSettings.showVi ? "active" : ""}" onclick="toggleDialogueVi('${l.id}')" title="Bật/Tắt bản dịch tiếng Việt">
                            <span>🇻🇳 Bản dịch</span>
                        </button>
                        <button type="button" class="dialogue-tool-btn ${window._dialogueSettings.showAnatomy ? "active" : ""}" onclick="toggleDialogueAnatomy('${l.id}')" title="Bật/Tắt phân tích cấu trúc ngữ pháp">
                            <span>🧩 Ngữ pháp</span>
                        </button>
                    </div>
                    ${
                      window._dialogueSettings.blurKorean
                        ? `
                        <small class="compact-text-44">💡 Nhấn vào câu thoại để xem hé lộ chữ</small>
                    `
                        : ""
                    }
                </div>

                <div class="input-dialogue-body">
        `;

    const isBlur = !!window._dialogueSettings.blurKorean;
    const showVi = !!window._dialogueSettings.showVi;
    const showAnatomy = !!window._dialogueSettings.showAnatomy;

    (activeDiag.lines || []).forEach((d, idx) => {
      const korSafe = esc(d.korean);
      html += `
                <div class="input-dialogue-bubble ${d.role || "speaker-a"}">
                    <div class="dialogue-avatar">${d.avatar || "🗣️"}</div>
                    <div class="dialogue-msg-content">
                        <div class="dialogue-speaker-name">${esc(d.speaker)}</div>
                        <div class="dialogue-korean-text">
                            <span class="${isBlur ? "korean-blurred" : ""}" onclick="peekKoreanText(this)" title="${isBlur ? "Bấm để xem chữ" : ""}">${esc(d.korean)}</span>
                            <div class="dialogue-actions">
                                <button type="button" class="study-action-btn" data-speak="${korSafe}" title="Nghe phát âm chuẩn">🔊</button>
                                <button type="button" class="study-action-btn" data-practice="${korSafe}" data-feedback="diagFeedback_${idx}" title="Luyện nói theo câu này">🎙️</button>
                            </div>
                        </div>
                        ${showAnatomy && window.KoreanAnatomy ? window.KoreanAnatomy.renderHtml(d.korean, {}, true) : ""}
                        <div class="dialogue-vi-text ${showVi ? "" : "hidden"}">${esc(d.vi)}</div>
                        <div class="speech-feedback" id="diagFeedback_${idx}"></div>
                    </div>
                </div>
            `;
    });

    html += `
                </div>
            </div>
        `;

    box.innerHTML = html;
    return;
  }
  const items = (l.items || []).filter((it) => it.korean && it.vi);
  let dialogues = [];

  // Parse situations if provided
  if (l.situations) {
    const lines = l.situations.split("\n").filter(Boolean);
    lines.forEach((line, idx) => {
      const parts = line.split("|");
      const prompt = (parts[0] || "").trim();
      const sample = (parts[1] || "").trim();
      if (prompt && sample) {
        dialogues.push({
          speaker: idx % 2 === 0 ? "민수 (Min-soo)" : "지수 (Ji-soo)",
          avatar: idx % 2 === 0 ? "🇰🇷" : "🙋‍♀️",
          korean: sample,
          vi: prompt,
          role: idx % 2 === 0 ? "speaker-a" : "speaker-b",
        });
      }
    });
  }

  // Auto-synthesize natural dialogue if none provided
  if (dialogues.length === 0 && items.length > 0) {
    const slice = items.slice(0, 4);
    slice.forEach((it, idx) => {
      dialogues.push({
        speaker: idx % 2 === 0 ? "민수 (Min-soo)" : "지수 (Ji-soo)",
        avatar: idx % 2 === 0 ? "🇰🇷" : "🙋‍♀️",
        korean: it.korean,
        vi: it.vi,
        role: idx % 2 === 0 ? "speaker-a" : "speaker-b",
      });
    });
  }

  if (dialogues.length === 0) {
    box.innerHTML = "";
    box.classList.add("hidden");
    return;
  }

  box.classList.remove("hidden");
  const audioData = window.AUDIO_MAP && window.AUDIO_MAP[l.id];
  const speakingTrack = audioData?.tracks?.find((t) => t.type === "speaking");

  let html = `
        <div class="input-dialogue-card">
            <div class="action-row-40 input-dialogue-header">
                <div>
                    <div class="input-dialogue-badge">💬 Đoạn hội thoại mẫu ngữ cảnh</div>
                    <div class="input-dialogue-sub">Stephen Krashen Comprehensible Input · Học câu trọn vẹn trong ngữ cảnh giao tiếp tự nhiên</div>
                </div>
                ${speakingTrack ? `<button type="button" class="compact-text-42 btn btn-secondary btn-sm" onclick="selectAndPlayNativeTrack('${speakingTrack.file}', '${esc(speakingTrack.label)}', '${esc(speakingTrack.desc)}')"><span>🎧 Nghe Audio CD</span> <small>(Trk ${speakingTrack.track})</small></button>` : ""}
            </div>
            <div class="input-dialogue-body">
    `;

  dialogues.forEach((d, idx) => {
    const korSafe = esc(d.korean);
    html += `
            <div class="input-dialogue-bubble ${d.role}">
                <div class="dialogue-avatar">${d.avatar}</div>
                <div class="dialogue-msg-content">
                    <div class="dialogue-speaker-name">${esc(d.speaker)}</div>
                    <div class="dialogue-korean-text">
                        <span>${esc(d.korean)}</span>
                        <div class="dialogue-actions">
                            <button type="button" class="study-action-btn" data-speak="${korSafe}" title="Nghe phát âm">🔊</button>
                            <button type="button" class="study-action-btn" data-practice="${korSafe}" data-feedback="diagFeedback_${idx}" title="Luyện nói theo câu này">🎙️</button>
                        </div>
                    </div>
                    ${window.KoreanAnatomy ? window.KoreanAnatomy.renderHtml(d.korean, {}, true) : ""}
                    <div class="dialogue-vi-text">${esc(d.vi)}</div>
                    <div class="speech-feedback" id="diagFeedback_${idx}"></div>
                </div>
            </div>
        `;
  });

  html += `
            </div>
        </div>
    `;

  box.innerHTML = html;
}

function setTtsSpeed(rate) {
  if (window.KoreanVoice) window.KoreanVoice.setRate(rate);
  $("ttsSpeedSlow")?.classList.toggle("active", rate <= 0.85);
  $("ttsSpeedNormal")?.classList.toggle("active", rate > 0.85);
}

function toggleTranslation(lang) {
  const cls = lang === "vi" ? "study-item-vi" : "study-item-en";
  const btnId = lang === "vi" ? "btnTransVi" : "btnTransEn";
  const btn = $(btnId);
  const isShowing = btn.classList.contains("active");

  document.querySelectorAll("." + cls).forEach((el) => {
    el.classList.toggle("hidden", isShowing);
  });
  btn.classList.toggle("active", !isShowing);
}

// ═══════════════════════════════════════════════════
//  RECALL EXERCISES — Multi-variation Active Recall
// ═══════════════════════════════════════════════════

function renderRecall(l) {
  if (window.KoreanRecall) {
    window.KoreanRecall.buildExercises(l, db);
    window.KoreanRecall.render("recallExercises");
  }
}

// ═══════════════════════════════════════════════════
//  PRODUCTION EXERCISES — Dialogue & Smart Evaluation
// ═══════════════════════════════════════════════════

function renderProduction(l) {
  if (window.KoreanProduction) {
    window.KoreanProduction.buildExercises(l, db);
    window.KoreanProduction.render("productionExercises");
  }
}

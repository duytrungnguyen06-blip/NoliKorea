let rolePlayTimer;
let rolePlayRevision = 0;
function cancelRolePlayTurn() {
  clearTimeout(rolePlayTimer);
  rolePlayRevision++;
  window.KoreanVoice?.stop();
}
function rolePlayActive(revision) {
  return (
    revision === rolePlayRevision &&
    $("rolePlayModal").classList.contains("active")
  );
}
window._rolePlayState = {
  lid: null,
  diagIdx: 0,
  dialogue: null,
  userRole: null,
  currentLineIdx: 0,
  scores: [],
};

function openRolePlayModal(lid, diagIdx) {
  cancelRolePlayTurn();
  const modal = $("rolePlayModal");
  if (!modal) {
    console.error("rolePlayModal not found in DOM");
    return;
  }

  diagIdx = parseInt(diagIdx, 10) || 0;
  const richDialogues =
    (window.LESSON_DIALOGUES && window.LESSON_DIALOGUES[lid]) || null;
  if (!richDialogues || !richDialogues[diagIdx]) {
    console.error("Dialogue not found for lid:", lid, "diagIdx:", diagIdx);
    return;
  }

  const diag = richDialogues[diagIdx];
  window._rolePlayState = {
    lid,
    diagIdx,
    dialogue: diag,
    userRole: null,
    currentLineIdx: 0,
    scores: [],
  };

  const subEl = $("rolePlaySub");
  if (subEl) {
    subEl.textContent = `${diag.shortTitle || diag.title}: ${diag.context || diag.sub || ""}`;
  }
  renderRolePlayCharSelection();
  modal.classList.add("active");
  modal.classList.remove("hidden");
}

function closeRolePlayModal() {
  cancelRolePlayTurn();
  window.KoreanVoice?.stt?.stop();
  const modal = $("rolePlayModal");
  if (modal) {
    modal.classList.remove("active");
    modal.classList.add("hidden");
  }
  if (window.KoreanVoice) window.KoreanVoice.stop();
}

function renderRolePlayCharSelection() {
  const body = $("rolePlayModalBody");
  if (!body) return;

  const diag = window._rolePlayState.dialogue;
  const lines = diag.lines || [];

  // Identify unique speakers
  let speakerA = null;
  let speakerB = null;

  lines.forEach((l) => {
    if (l.role === "speaker-a" && !speakerA) speakerA = l;
    if (l.role === "speaker-b" && !speakerB) speakerB = l;
  });

  if (!speakerA)
    speakerA = { speaker: "Nhân vật A", avatar: "🗣️", role: "speaker-a" };
  if (!speakerB)
    speakerB = { speaker: "Nhân vật B", avatar: "👥", role: "speaker-b" };

  body.innerHTML = `
        <div class="component-detail-51">
            <h3 class="compact-text-52">Chọn nhân vật bạn muốn đóng vai</h3>
            <p class="compact-text-53">Hệ thống sẽ đóng vai đối tác và trò chuyện phản xạ trực tiếp cùng bạn!</p>
        </div>
        <div class="roleplay-char-grid">
            <div class="roleplay-char-card" onclick="selectRolePlayCharacter('speaker-a')">
                <div class="roleplay-char-avatar">${speakerA.avatar || "🗣️"}</div>
                <div class="roleplay-char-name">${esc(speakerA.speaker)}</div>
                <div class="roleplay-char-desc">Bạn sẽ nói các câu của <b>${esc(speakerA.speaker)}</b>. Máy sẽ đóng vai đối đáp.</div>
                <button type="button" class="btn btn-primary btn-sm roleplay-char-btn">Chọn vai này 🎙️</button>
            </div>
            <div class="roleplay-char-card" onclick="selectRolePlayCharacter('speaker-b')">
                <div class="roleplay-char-avatar">${speakerB.avatar || "👥"}</div>
                <div class="roleplay-char-name">${esc(speakerB.speaker)}</div>
                <div class="roleplay-char-desc">Bạn sẽ nói các câu của <b>${esc(speakerB.speaker)}</b>. Máy sẽ đóng vai đối đáp.</div>
                <button type="button" class="btn btn-primary btn-sm roleplay-char-btn">Chọn vai này 🎙️</button>
            </div>
        </div>
    `;
}

function selectRolePlayCharacter(userRole) {
  window._rolePlayState.userRole = userRole;
  window._rolePlayState.currentLineIdx = 0;
  window._rolePlayState.scores = [];
  renderRolePlayTurn();
}

function renderRolePlayTurn() {
  cancelRolePlayTurn();
  const revision = rolePlayRevision;
  const body = $("rolePlayModalBody");
  if (!body) return;

  const state = window._rolePlayState;
  const diag = state.dialogue;
  const lines = diag.lines || [];

  if (state.currentLineIdx >= lines.length) {
    renderRolePlaySummary();
    return;
  }

  const currentLine = lines[state.currentLineIdx];
  const isUserTurn = currentLine.role === state.userRole;
  const progressPct = Math.round((state.currentLineIdx / lines.length) * 100);

  let html = `
        <div class="roleplay-progress-bar-wrap">
            <div class="roleplay-progress-fill" style="width: ${progressPct}%"></div>
        </div>
        <div class="action-row-54">
            <span>Lượt ${state.currentLineIdx + 1} / ${lines.length}</span>
            <span>${isUserTurn ? "🎯 Lượt của BẠN" : "🤖 Lượt của MÁY"}</span>
        </div>
        <div class="roleplay-turns-list">
    `;

  // Render conversation up to current line
  for (let i = 0; i <= state.currentLineIdx; i++) {
    const l = lines[i];
    const isCurrent = i === state.currentLineIdx;
    const isUser = l.role === state.userRole;
    html += `
            <div class="roleplay-bubble ${isUser ? "user-turn" : "partner-turn"} ${isCurrent ? "active-turn" : ""}">
                <div class="compact-text-55 dialogue-avatar">${l.avatar || "🗣️"}</div>
                <div class="flex-grow dialogue-msg-content roleplay-msg-content">
                    <div class="compact-text-56">
                        ${esc(l.speaker)} ${isUser ? '<span class="text-accent">(Bạn)</span>' : ""}
                    </div>
                    <div class="compact-text-57">
                        ${esc(l.korean)}
                    </div>
                    <div class="compact-text-58">
                        ${esc(l.vi)}
                    </div>
                </div>
            </div>
        `;
  }

  html += `</div>`;

  if (isUserTurn) {
    // User turn action box
    html += `
            <div class="roleplay-user-action-box">
                <div class="compact-text-59">Đến lượt bạn! Hãy đọc câu thoại này:</div>
                <div class="roleplay-target-korean">${esc(currentLine.korean)}</div>
                <div class="roleplay-target-vi">"${esc(currentLine.vi)}"</div>
                <div class="action-row-60">
                    <button type="button" class="roleplay-mic-btn" id="rolePlayMicBtn" onclick="startRolePlayUserSpeech()">
                        <span>🎙️ Bắt đầu nói</span>
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" data-speak="${esc(currentLine.korean)}" title="Nghe câu mẫu">
                        <span>🔊 Nghe mẫu</span>
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="advanceRolePlayTurn()" title="Bỏ qua lượt này">
                        <span>Bỏ qua ⏩</span>
                    </button>
                </div>
                <div id="rolePlaySpeechFeedback"></div>
            </div>
        `;
    body.innerHTML = html;
  } else {
    // Partner turn (Machine speaks automatically)
    html += `
            <div class="compact-text-61">
                <span class="component-detail-62">🤖</span> Đang lắng nghe máy đối thoại...
            </div>
        `;
    body.innerHTML = html;

    const next = () => {
      if (rolePlayActive(revision)) advanceRolePlayTurn();
    };
    const fallback = () => {
      if (!rolePlayActive(revision)) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-secondary";
      button.textContent = "Tiếp tục lượt sau";
      button.onclick = next;
      body.append(button);
    };
    rolePlayTimer = setTimeout(() => {
      if (!rolePlayActive(revision)) return;
      if (!window.KoreanVoice?.tts?.isSupported()) {
        fallback();
        return;
      }
      window.KoreanVoice.speak(currentLine.korean, {
        onEnd: next,
        onError: fallback,
      });
    }, 500);
  }
}

function startRolePlayUserSpeech() {
  const state = window._rolePlayState;
  const currentLine = state.dialogue?.lines[state.currentLineIdx];
  if (
    !currentLine ||
    currentLine.role !== state.userRole ||
    !$("rolePlayModal").classList.contains("active")
  )
    return;
  if ($("rolePlayMicBtn")?.classList.contains("recording")) return;
  cancelRolePlayTurn();
  const revision = rolePlayRevision;
  let gotResult = false,
    failed = false;
  const micBtn = $("rolePlayMicBtn");
  const feedbackEl = $("rolePlaySpeechFeedback");

  if (!window.KoreanVoice || !window.KoreanVoice.stt?.isSupported()) {
    alert(
      "Trình duyệt cần hỗ trợ Micro (Chrome, Edge hoặc Safari) để luyện nói!",
    );
    return;
  }

  if (micBtn) {
    micBtn.classList.add("recording");
    micBtn.innerHTML = "<span>🔴 Đang lắng nghe... Hãy nói to!</span>";
  }

  if (feedbackEl) {
    feedbackEl.innerHTML = `
            <div class="compact-text-63">
                Đang thu âm... Nói câu: <b>${esc(currentLine.korean)}</b>
            </div>
        `;
  }

  window.KoreanVoice.stt.startRecognition({
    onResult: (spokenText) => {
      if (!rolePlayActive(revision)) return;
      gotResult = true;
      if (micBtn) {
        micBtn.classList.remove("recording");
        micBtn.innerHTML = "<span>🎙️ Nói lại</span>";
      }

      const accuracy = window.KoreanVoice.calculateAccuracy(
        currentLine.korean,
        spokenText,
      );
      state.scores[state.currentLineIdx] = accuracy;

      let badgeClass = "excellent";
      let badgeIcon = "🌟";
      let comment = "Xuất sắc! Lời nhận dạng khớp câu mẫu!";

      if (accuracy < 50) {
        badgeClass = "retry";
        badgeIcon = "💪";
        comment = "Cố lên! Bạn nghe lại mẫu rồi thử nói lại nhé!";
      } else if (accuracy < 80) {
        badgeClass = "good";
        badgeIcon = "👍";
        comment = "Khá tốt! Lời nhận dạng khá gần câu mẫu!";
      }

      if (feedbackEl) {
        feedbackEl.innerHTML = `
                    <div class="roleplay-feedback-badge ${badgeClass}">
                        <span>${badgeIcon} Độ khớp lời nhận dạng: ${accuracy}%</span> — <span>${comment}</span>
                    </div>
                    <div class="compact-text-64">
                        Bạn nói: <i>"${esc(spokenText)}"</i>
                    </div>
                    <div class="action-row-65">
                        <button type="button" class="btn btn-primary btn-sm" onclick="advanceRolePlayTurn()">Tiếp tục lượt sau ⏩</button>
                    </div>
                `;
      }

      // Auto-advance if excellent
      if (accuracy >= 85) {
        rolePlayTimer = setTimeout(() => {
          if (rolePlayActive(revision)) advanceRolePlayTurn();
        }, 1400);
      }
    },
    onError: (err) => {
      if (!rolePlayActive(revision)) return;
      failed = true;
      if (micBtn) {
        micBtn.classList.remove("recording");
        micBtn.innerHTML = "<span>🎙️ Thử lại</span>";
      }
      if (feedbackEl) {
        feedbackEl.innerHTML = `
                    <div class="roleplay-feedback-badge retry">
                        <span>⚠️ ${esc(err)}</span>
                    </div>
                `;
      }
    },
    onEnd: () => {
      if (!rolePlayActive(revision)) return;
      micBtn?.classList.remove("recording");
      if (micBtn) micBtn.textContent = "🎙️ Nói lại";
      if (!gotResult && !failed && feedbackEl)
        feedbackEl.textContent = "Chưa nhận được lời nói. Bấm mic để thử lại.";
    },
  });
}

function advanceRolePlayTurn(fallbackScore) {
  const state = window._rolePlayState;
  if (
    !$("rolePlayModal").classList.contains("active") ||
    state.currentLineIdx >= state.dialogue.lines.length
  )
    return;
  state.currentLineIdx++;
  renderRolePlayTurn();
}

function renderRolePlaySummary() {
  const body = $("rolePlayModalBody");
  if (!body) return;

  const state = window._rolePlayState;
  const scores = state.scores.filter(Number.isFinite);
  const avgScore = Math.round(
    scores.reduce((a, b) => a + b, 0) / (scores.length || 1),
  );

  // Save habit/streak progress
  if (typeof recordDailyActivity === "function") {
    recordDailyActivity();
  }

  let praise =
    "Bạn đã hoàn thành đoạn hội thoại. Điểm thể hiện độ khớp văn bản máy nhận dạng với câu mẫu.";
  if (avgScore >= 90)
    praise =
      "Lời máy nhận dạng khớp tốt với câu mẫu. Đây không phải đánh giá phát âm chuyên sâu.";
  else if (avgScore < 70)
    praise =
      "Rất đáng khen! Hãy thử đổi vai hoặc luyện lại thêm một lần để nhớ sâu hơn nhé!";

  body.innerHTML = `
        <div class="roleplay-summary-card">
            <div class="roleplay-trophy">🏆</div>
            <h3 class="compact-text-66">Hoàn Thành Đoạn Đối Thoại!</h3>
            <div class="roleplay-summary-score">${scores.length ? avgScore + "%" : "Chưa có lượt ghi âm"}</div>
            <p class="compact-text-67">${praise}</p>
            <div class="action-row-68">
                <button type="button" class="btn btn-secondary btn-sm" onclick="selectRolePlayCharacter('${state.userRole === "speaker-a" ? "speaker-b" : "speaker-a"}')">
                    <span>Đổi sang vai còn lại 🔄</span>
                </button>
                <button type="button" class="btn btn-primary btn-sm" onclick="closeRolePlayModal()">
                    <span>Hoàn thành ✨</span>
                </button>
            </div>
        </div>
    `;
}

// Listening to the sample must release the mic and cancel automatic advancement.
document.addEventListener(
  "click",
  (event) => {
    if (!event.target.closest("#rolePlayModal [data-speak]")) return;
    cancelRolePlayTurn();
    const button = $("rolePlayMicBtn");
    if (button) {
      if(button.classList.contains("recording") && $("rolePlaySpeechFeedback")) $("rolePlaySpeechFeedback").textContent="Đã dừng mic để nghe mẫu. Bấm Bắt đầu nói khi bạn sẵn sàng.";
      button.classList.remove("recording");
      button.textContent = "🎙️ Bắt đầu nói";
    }
  },
  true,
);

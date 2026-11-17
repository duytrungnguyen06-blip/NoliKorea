/* KLA v4.1 audio.js */
function renderNativeAudioPanel(lid) {
  const panel = $("nativeAudioPanel");
  const tracksContainer = $("nativeAudioTracks");
  const trackInfo = $("nativeAudioTrackInfo");
  const controls = $("nativeAudioControls");
  if (!panel || !tracksContainer) return;

  // Stop any existing audio playback
  if (window.KoreanVoice) window.KoreanVoice.stop();
  activeNativeAudioTrack = null;

  if (!window.AUDIO_MAP || !window.AUDIO_MAP[lid]) {
    panel.classList.add("hidden");
    return;
  }

  const lessonAudio = window.AUDIO_MAP[lid];
  panel.classList.remove("hidden");
  if (controls) controls.classList.add("hidden");

  let html = "";
  lessonAudio.tracks.forEach((trk, idx) => {
    html += `
            <button type="button" class="native-track-btn ${idx === 0 ? "active" : ""}" data-file="${esc(trk.file)}" data-track="${trk.track}" onclick="selectAndPlayNativeTrack('${esc(trk.file)}', '${esc(trk.label)}', '${esc(trk.desc)}', this)" title="${esc(trk.desc)}">
                <span>${esc(trk.label)}</span>
                <small class="compact-text-49">(Trk ${trk.track})</small>
            </button>
        `;
  });
  tracksContainer.innerHTML = html;

  // Auto-select Track 1 info on load
  if (lessonAudio.tracks.length > 0) {
    const firstTrk = lessonAudio.tracks[0];
    if (trackInfo)
      trackInfo.innerHTML = `<b>${esc(firstTrk.label)}</b> — <span class="colored-text-50">${esc(firstTrk.desc)}</span>`;
  }

  // Setup speed buttons
  const curSpeed = window.KoreanVoice?.nativeAudio?.getSpeed() || 1.0;
  $("audioSpeedSlow")?.classList.toggle("active", curSpeed <= 0.85);
  $("audioSpeedNormal")?.classList.toggle(
    "active",
    curSpeed > 0.85 && curSpeed < 1.15,
  );
  $("audioSpeedFast")?.classList.toggle("active", curSpeed >= 1.15);
}

function selectAndPlayNativeTrack(file, label, desc, btnEl) {
  activeNativeAudioTrack = file;
  const trackInfo = $("nativeAudioTrackInfo");
  const controls = $("nativeAudioControls");
  const playIcon = $("audioPlayIcon");

  // Highlight active track pill
  document
    .querySelectorAll(".native-track-btn")
    .forEach((b) => b.classList.remove("active"));
  if (!btnEl && file) {
    btnEl = document.querySelector(`.native-track-btn[data-file="${file}"]`);
  }
  if (btnEl) btnEl.classList.add("active");

  if (trackInfo)
    trackInfo.innerHTML = `<b>${esc(label)}</b> — <span class="colored-text-50">${esc(desc)}</span>`;
  if (controls) controls.classList.remove("hidden");

  // Sync info to Floating Mini-Player
  const flTitle = $("floatingAudioTitle");
  const flSub = $("floatingAudioSub");
  if (flTitle) flTitle.textContent = label;
  if (flSub) flSub.textContent = desc;

  if (window.KoreanVoice) {
    window.KoreanVoice.playTrack(file);
  }

  // Two-way sync: Switch Comprehensible Input dialogue showcase to this track if matching dialogue exists
  const currentLid = ctx ? ctx.lid : null;
  if (
    currentLid &&
    window.LESSON_DIALOGUES &&
    window.LESSON_DIALOGUES[currentLid]
  ) {
    const diagList = window.LESSON_DIALOGUES[currentLid];
    const targetIdx = diagList.findIndex(
      (d) =>
        d.file === file ||
        (btnEl && d.track == btnEl.getAttribute("data-track")),
    );
    if (
      targetIdx !== -1 &&
      window._activeDiagIndex?.[currentLid] !== targetIdx
    ) {
      switchInputDialogue(currentLid, targetIdx);
    }
  }
}

function toggleNativeAudioPlay() {
  const player = window.KoreanVoice?.nativeAudio;
  if (!player) return;

  if (player.isPlaying) {
    player.pause();
  } else {
    if (activeNativeAudioTrack) {
      player.playTrack(activeNativeAudioTrack);
    } else {
      player.resume();
    }
  }
}

function stopNativeAudio() {
  const player = window.KoreanVoice?.nativeAudio;
  if (player) player.stop();
  const seekBar = $("audioSeekBar");
  const curTime = $("audioCurrentTime");
  if (seekBar) seekBar.value = 0;
  if (curTime) curTime.textContent = "00:00";
  const playIcon = $("audioPlayIcon");
  if (playIcon) playIcon.textContent = "▶️";
  document
    .querySelectorAll(".native-track-btn")
    .forEach((b) => b.classList.remove("active"));
}

function skipNativeAudio(seconds) {
  const player = window.KoreanVoice?.nativeAudio;
  if (player) player.skip(seconds);
}

function seekNativeAudio(percent) {
  const player = window.KoreanVoice?.nativeAudio;
  if (player && player.getDuration()) {
    const targetSec = (parseFloat(percent) / 100) * player.getDuration();
    player.seek(targetSec);
  }
}

function setNativeAudioSpeed(speed) {
  const player = window.KoreanVoice?.nativeAudio;
  if (player) player.setSpeed(speed);
  $("audioSpeedSlow")?.classList.toggle("active", speed <= 0.85);
  $("audioSpeedNormal")?.classList.toggle(
    "active",
    speed > 0.85 && speed < 1.15,
  );
  $("audioSpeedFast")?.classList.toggle("active", speed >= 1.15);
}

function formatAudioTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Hook into NativeAudio events on DOM load
function initNativeAudioEventListeners() {
  if (!window.KoreanVoice || !window.KoreanVoice.nativeAudio) return;
  const player = window.KoreanVoice.nativeAudio;

  player.onChange((event) => {
    const playIcon = $("audioPlayIcon");
    const curTime = $("audioCurrentTime");
    const durTime = $("audioDuration");
    const seekBar = $("audioSeekBar");

    const flPlayIcon = $("floatingPlayIcon");
    const flDisc = document.querySelector(
      "#floatingAudioPlayer .floating-audio-disc",
    );
    const flTime = $("floatingAudioTime");
    const flSpeed = $("floatingSpeedBtn");

    if (event === "play") {
      if (playIcon) playIcon.textContent = "⏸️";
      if (flPlayIcon) flPlayIcon.textContent = "⏸️";
      if (flDisc) flDisc.classList.add("spinning");
    } else if (event === "pause" || event === "ended" || event === "stop") {
      if (playIcon) playIcon.textContent = "▶️";
      if (flPlayIcon) flPlayIcon.textContent = "▶️";
      if (flDisc) flDisc.classList.remove("spinning");
    }

    if (event === "timeupdate" || event === "loadedmetadata") {
      const current = player.getCurrentTime();
      const duration = player.getDuration();
      const timeStr = `${formatAudioTime(current)} / ${formatAudioTime(duration)}`;
      if (curTime) curTime.textContent = formatAudioTime(current);
      if (durTime && duration > 0)
        durTime.textContent = formatAudioTime(duration);
      if (flTime && duration > 0) flTime.textContent = timeStr;
      if (flSpeed) flSpeed.textContent = `${player.getSpeed()}x`;
      if (seekBar && duration > 0) {
        seekBar.value = (current / duration) * 100;
      }
    }
  });
}

// ─── Floating Mini-Player & Keyboard Shortcuts ───────────────────────
function cycleNativeAudioSpeed() {
  const player = window.KoreanVoice?.nativeAudio;
  if (!player) return;
  const curSpeed = player.getSpeed() || 1.0;
  let nextSpeed = 1.0;
  if (curSpeed <= 0.85) nextSpeed = 1.0;
  else if (curSpeed < 1.15) nextSpeed = 1.2;
  else nextSpeed = 0.8;
  setNativeAudioSpeed(nextSpeed);
  const speedBtn = $("floatingSpeedBtn");
  if (speedBtn) speedBtn.textContent = `${nextSpeed}x`;
}

function hideFloatingAudioPlayer() {
  const floating = $("floatingAudioPlayer");
  if (floating) {
    floating._manuallyClosed = true;
    floating.classList.add("hidden");
  }
}

function checkFloatingAudioVisibility() {
  const panel = $("nativeAudioPanel");
  const floating = $("floatingAudioPlayer");
  if (!panel || !floating) return;

  if (floating._manuallyClosed) return;

  const rect = panel.getBoundingClientRect();
  const isOffscreen = rect.bottom < 50;
  const isAudioActive =
    activeNativeAudioTrack !== null ||
    window.KoreanVoice?.nativeAudio?.isPlaying;

  if (isOffscreen && isAudioActive) {
    floating.classList.remove("hidden");
  } else {
    floating.classList.add("hidden");
  }
}

function initAudioKeyboardShortcuts() {
  window.addEventListener("keydown", (e) => {
    const tag = e.target?.tagName?.toLowerCase();
    if (tag === "input" || tag === "textarea" || e.target?.isContentEditable)
      return;
    if ($("rolePlayModal") && !$("rolePlayModal").classList.contains("hidden"))
      return;

    if (e.code === "Space") {
      e.preventDefault();
      toggleNativeAudioPlay();
    } else if (e.code === "ArrowLeft") {
      e.preventDefault();
      skipNativeAudio(-5);
    } else if (e.code === "ArrowRight") {
      e.preventDefault();
      skipNativeAudio(5);
    } else if (e.key === "[" || e.key === "]") {
      e.preventDefault();
      cycleNativeAudioSpeed();
    }
  });

  // Scroll listeners for floating player
  window.addEventListener("scroll", checkFloatingAudioVisibility, {
    passive: true,
  });
  $("studyModal")?.addEventListener("scroll", checkFloatingAudioVisibility, {
    passive: true,
  });
}

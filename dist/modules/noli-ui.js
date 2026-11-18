window.NoliUI = (() => {
  const prefs = [
    "kla_theme",
    "kla_sound_enabled",
    "kla_anatomy_enabled",
    "kla_tts_rate",
    "kla_audio_speed",
  ];
  function preferences() {
    db.preferences = Object.fromEntries(
      prefs
        .map((k) => [k, localStorage.getItem(k)])
        .filter(([, v]) => v !== null),
    );
  }
  function applyPreferences() {
    for (const [k, v] of Object.entries(db.preferences || {}))
      if (prefs.includes(k) && typeof v === "string")
        localStorage.setItem(k, v);
  }
  function details(title, node) {
    const d = document.createElement("details"),
      s = document.createElement("summary");
    s.textContent = title;
    d.append(s, node);
    return d;
  }
  function progress() {
    let box = $("dailyStats");
    if (!box) {
      box = document.createElement("section");
      box.id = "dailyStats";
      box.className = "settings-section";
      $("statsGrid").before(box);
    }
    const h = db.dailyPractice?.history || [],
      total = h.reduce((n, x) => n + x.count, 0),
      correct = h.reduce((n, x) => n + x.firstCorrect, 0);
    box.textContent = `Phiên ngắn gần đây: ${h.length} phiên · ${total ? Math.round((correct / total) * 100) : 0}% đúng lần đầu · ${h.reduce((n, x) => n + x.recovered, 0)} mục nhớ lại sau luyện thêm.`;
  }
  function resetProgress() {
    if (
      !confirm(
        "Đặt lại tiến độ, lịch ôn và phiên học? Nội dung bài và ghi chú riêng được giữ.",
      )
    )
      return;
    const next = JSON.parse(JSON.stringify(db));
    for (const s of next.stages)
      for (const b of s.books)
        for (const l of b.lessons)
          Object.assign(l, {
            studied: false,
            level: 0,
            lastStudied: null,
            nextReview: null,
            nextReviewAt: null,
            inProgress: false,
            session: null,
          });
    next.streak = { count: 0, lastDate: null, history: [] };
    next.itemReviews = {};
    next.mistakes = [];
    next.dailyPractice = { seen: [], history: [], active: null };
    replaceData(next, "Trước khi đặt lại tiến độ");
  }
  document.addEventListener("DOMContentLoaded", () => {
    const sections = [
        ...document.querySelectorAll("#settingsView > .settings-section"),
      ],
      data = sections[0],
      sound = sections[1],
      display = sections[2],
      ai = sections[3],
      about = sections[4];
    const advanced = document.createElement("div");
    advanced.className = "settings-buttons";
    for (const b of [...data.querySelectorAll("button")].slice(2))
      advanced.append(b);
    data.append(details("Khôi phục và đặt lại dữ liệu", advanced));
    advanced.querySelector('[onclick="reloadSnu1aCurriculum()"]')?.remove();
    const restore = advanced.querySelector(
      '[onclick="reloadDefaultCurriculum()"]',
    );
    restore.textContent = "Khôi phục nội dung giáo trình";
    restore.onclick = () => reloadSnu1aCurriculum();
    const reset = document.createElement("button");
    reset.className = "btn btn-secondary";
    reset.textContent = "Đặt lại tiến độ";
    reset.onclick = resetProgress;
    advanced.prepend(reset);
    advanced.querySelector("[onclick=\"resetAllData()\"]").textContent="Xóa giáo trình và tiến độ";
    const raw = advanced.querySelector('[onclick="exportRawData()"]');
    raw.textContent = "Xuất bản gốc khi cần sửa lỗi";
    sound.querySelector("h3").textContent = "Âm thanh";
    sound.querySelector(".settings-toggle-row").textContent =
      "Âm báo khi luyện tập";
    display.querySelector("h3").textContent = "Giao diện và hỗ trợ học";
    display.querySelector(".settings-toggle-row").textContent =
      "Giải thích cấu trúc câu";
    display.querySelector(".settings-option-name").textContent =
      "Hiện gốc từ, trợ từ và đuôi câu trong bài học.";
    ai.querySelector("h3").textContent = "Trợ lý AI";
    ai.querySelector("p").textContent =
      "Kết nối Gemini bằng API key riêng để trò chuyện. Bạn vẫn học đầy đủ các bài khi chưa kết nối.";
    const anchor = document.createComment("AI settings");
    ai.before(anchor);
    const wrapper = details(
      localStorage.getItem("kla_gemini_api_key")
        ? "Trợ lý AI · Đã lưu kết nối"
        : "Trợ lý AI · Chưa kết nối",
      ai,
    );
    anchor.replaceWith(wrapper);
    const clear = document.createElement("button");
    clear.className = "btn btn-secondary";
    clear.textContent = "Xóa kết nối AI";
    clear.onclick = () => {
      localStorage.removeItem("kla_gemini_api_key");
      $("geminiApiKeyInput").value = "";
      $("geminiApiStatus").textContent = "Đã xóa API key trên thiết bị này.";
    };
    ai.querySelector(".settings-actions").append(clear);
    about.innerHTML =
      "<h3>NoliKorea</h3><p>Phiên bản 5.0.3 · Seoul 1A</p><p>Tiến độ được lưu trên thiết bị. Sao lưu trước khi đổi địa chỉ ứng dụng.</p>";
    const install = document.createElement("section");
    install.className = "settings-section";
    install.innerHTML =
      "<h3>Thêm vào màn hình chính</h3><p>iPhone/iPad: mở bằng Safari → Chia sẻ → Thêm vào Màn hình chính.</p><p>Android: mở bằng Chrome → ⋮ → Cài đặt ứng dụng hoặc Thêm vào màn hình chính.</p>";
    about.before(details("Cài NoliKorea trên điện thoại", install));
    const manage = document.createElement("label");
    manage.className = "manage-toggle";
    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.onchange = () =>
      document.body.classList.toggle("manage-curriculum", toggle.checked);
    manage.append(
      toggle,
      " Hiện công cụ chỉnh sửa và lộ trình chưa có nội dung",
    );
    advanced.append(manage);
    const oldExport = exportData;
    exportData = () => {
      preferences();
      oldExport();
    };
    const oldReplace = replaceData;
    replaceData = (...args) => {
      const ok = oldReplace(...args);
      if (ok) {
        applyPreferences();
        SeoulUI.setTheme(localStorage.getItem("kla_theme") || "dark");
        KoreanSound.enabled =
          localStorage.getItem("kla_sound_enabled") !== "false";
        KoreanVoice.setRate(
          Number(localStorage.getItem("kla_tts_rate") || 0.9),
        );
        initSoundToggle();
        initAnatomySetting();
      }
      return ok;
    };
  });
  return { progress, preferences, applyPreferences };
})();

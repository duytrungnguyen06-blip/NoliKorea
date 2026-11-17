/* KLA v4.1 progress.js */
function renderProgress() {
  renderStreakHabitCard();
  window.NoliUI?.progress();

  const totalLessons = db.stages.reduce(
    (a, s) =>
      a +
      s.books.reduce(
        (b, k) => b + k.lessons.filter((l) => l.items?.length).length,
        0,
      ),
    0,
  );
  const studiedLessons = db.stages.reduce(
    (a, s) =>
      a +
      s.books.reduce(
        (b, k) =>
          b + k.lessons.filter((l) => l.items?.length && l.studied).length,
        0,
      ),
    0,
  );
  const totalItems = db.stages.reduce(
    (a, s) =>
      a +
      s.books.reduce(
        (b, k) => b + k.lessons.reduce((c, l) => c + (l.items || []).length, 0),
        0,
      ),
    0,
  );
  const dueCount = due().length;
  const totalBooks = db.stages.reduce((a, s) => a + s.books.length, 0);

  $("statsGrid").innerHTML = `
    <div class="stat-card">
        <div class="stat-card-value">${db.stages.length}</div>
        <div class="stat-card-label">Giai đoạn</div>
    </div>
    <div class="stat-card">
        <div class="stat-card-value">${totalBooks}</div>
        <div class="stat-card-label">Quyển sách</div>
    </div>
    <div class="stat-card">
        <div class="stat-card-value">${studiedLessons}<span class="compact-text-45">/${totalLessons}</span></div>
        <div class="stat-card-label">Bài có nội dung đã học</div>
    </div>
    <div class="stat-card">
        <div class="stat-card-value">${totalItems}</div>
        <div class="stat-card-label">Tổng mục</div>
    </div>
    <div class="stat-card">
        <div class="stat-card-value" style="color:${dueCount ? "var(--warning)" : "var(--success)"}">${dueCount}</div>
        <div class="stat-card-label">Cần ôn hôm nay</div>
    </div>`;

  let details = "";
  db.stages.forEach((s) => {
    const total = s.books.reduce(
      (a, b) => a + b.lessons.filter((l) => l.items?.length).length,
      0,
    );
    const studied = s.books.reduce(
      (a, b) =>
        a + b.lessons.filter((l) => l.items?.length && l.studied).length,
      0,
    );
    const pct = total ? Math.round((studied / total) * 100) : 0;

    details += `
        <div class="progress-stage-item">
            <div class="progress-stage-name">${esc(s.name)}</div>
            <div class="progress-bar-row">
                <div class="progress-bar">
                    <div class="progress-fill" style="width:${pct}%"></div>
                </div>
                <span class="progress-pct">${studied}/${total} · ${pct}%</span>
            </div>
        </div>`;
  });

  if (!details) {
    details =
      '<p class="padded-panel-46">Chưa có dữ liệu. Hãy thêm giáo trình và bắt đầu học!</p>';
  }

  $("progressDetails").innerHTML = details;
}

// ═══════════════════════════════════════════════════
//  DAILY STREAK & HABIT TRACKER (Trục 2)
// ═══════════════════════════════════════════════════

function initStreak() {
  if (!db.streak) {
    db.streak = { count: 0, lastDate: null, history: [] };
  }
  const t = today();
  const y = yesterday();
  // If last date studied was before yesterday, reset streak to 0
  if (
    db.streak.lastDate &&
    db.streak.lastDate !== t &&
    db.streak.lastDate !== y
  ) {
    db.streak.count = 0;
  }
  updateStreakBadge();
}

function recordDailyStreak() {
  db.streak = KLAScheduler.streak(db.streak);
  updateStreakBadge();
}

function updateStreakBadge() {
  const countEl = $("headerStreakCount");
  const badgeEl = $("headerStreak");
  if (!countEl || !badgeEl) return;
  const count = db.streak?.count || 0;
  countEl.textContent = count;
  badgeEl.classList.toggle("has-streak", count > 0);
}

function showStreakTab() {
  document.querySelector('.nav-btn[data-view="progress"]')?.click();
  setTimeout(() => {
    $("streakTrackerCard")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 100);
}

function renderStreakHabitCard() {
  const card = $("streakTrackerCard");
  if (!card) return;
  const streak = db.streak || { count: 0, lastDate: null, history: [] };
  const hist = new Set(streak.history || []);
  const t = today();

  // Calculate Monday of the current week
  const now = new Date();
  const currentDay = now.getDay(); // 0: Sun, 1: Mon, ...
  const diffToMon = (currentDay === 0 ? -6 : 1) - currentDay;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon);

  const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  let weekHtml = "";

  for (let i = 0; i < 7; i++) {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    const dStr = localDate(d);
    const isStudied = hist.has(dStr);
    const isToday = dStr === t;
    const dayNum = d.getDate();

    weekHtml += `
            <div class="streak-day-col ${isStudied ? "studied" : ""} ${isToday ? "today" : ""}">
                <span class="streak-day-name">${dayNames[i]}</span>
                <div class="streak-day-circle">
                    ${isStudied ? "🔥" : dayNum}
                </div>
                <span class="streak-day-dot"></span>
            </div>
        `;
  }

  card.innerHTML = `
        <div class="streak-card-top">
            <div class="streak-card-info">
                <div class="streak-card-flame">🔥</div>
                <div>
                    <div class="streak-card-number">${streak.count || 0} <span class="streak-card-unit">ngày liên tiếp</span></div>
                    <div class="streak-card-sub">${streak.lastDate === t ? "✅ Hôm nay bạn đã duy trì chuỗi học tập!" : "Chưa học hôm nay — hãy hoàn thành một phiên học hoặc lượt ôn để giữ chuỗi!"}</div>
                </div>
            </div>
            <div class="streak-total-record">
                <span class="streak-rec-label">Tổng ngày đã học:</span>
                <span class="streak-rec-value">${hist.size} ngày</span>
            </div>
        </div>
        <div class="streak-week-row">
            ${weekHtml}
        </div>
    `;
}

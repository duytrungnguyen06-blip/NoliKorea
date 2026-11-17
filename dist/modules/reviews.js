/* KLA v4.1 reviews.js */
function showReviewRating() {
  if (!ctx || !lesson(ctx.sid, ctx.bid, ctx.lid)?.items?.length) {
    alert("Bài này chưa có nội dung để hoàn thành.");
    return;
  }
  $("reviewRating").classList.remove("hidden");
  if ($("studyCompleteBtn")) $("studyCompleteBtn").classList.add("hidden");
  window.SeoulUI?.completion();

  if (window.KoreanSound) window.KoreanSound.playFanfare();

  if (!ctx) return;
  const l = lesson(ctx.sid, ctx.bid, ctx.lid);
  const curLevel = l?.level || 0;

  function formatForecastDate(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}`;
  }

  const mult = Math.max(1, curLevel + 1);
  const dHard = Math.round(1 * mult);
  const dGood = Math.round(3 * mult);
  const dEasy = Math.round(7 * mult);

  const nowD = new Date();
  const todayStr = `${String(nowD.getDate()).padStart(2, "0")}/${String(nowD.getMonth() + 1).padStart(2, "0")}`;

  if ($("rateTimeAgain"))
    $("rateTimeAgain").textContent =
      "10 phút · " +
      new Date(Date.now() + 600000).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
  if ($("rateTimeHard"))
    $("rateTimeHard").textContent =
      `${dHard} ngày · ${formatForecastDate(dHard)}`;
  if ($("rateTimeGood"))
    $("rateTimeGood").textContent =
      `${dGood} ngày · ${formatForecastDate(dGood)}`;
  if ($("rateTimeEasy"))
    $("rateTimeEasy").textContent =
      `${dEasy} ngày · ${formatForecastDate(dEasy)}`;
}

function rateLesson(rating) {
  if (!ctx) return;
  const l = lesson(ctx.sid, ctx.bid, ctx.lid);
  if (!l) return;

  StudySession.ensure("recall"); StudySession.ensure("production");
  if (!KoreanRecall.stats.total && !KoreanProduction.exercises.some(e=>e.evaluation)) { alert("Hãy trả lời ít nhất một bài luyện trước khi ghi nhận kết quả. Bản đọc của bạn vẫn được giữ."); return; }
  Object.assign(l, KLAScheduler.schedule(l, rating));
  // Record daily streak
  recordDailyStreak();

  if (!save()) return;
  closeStudyModal();
  render();
}

// ═══════════════════════════════════════════════════
//  REVIEW VIEW — Due lessons
// ═══════════════════════════════════════════════════

function renderReview() {
  ItemReviews.render();
  const dueItems = due();
  const container = $("reviewList");
  const empty = $("reviewEmpty");

  if (dueItems.length === 0) {
    container.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");
  let html = "";

  dueItems.forEach((l) => {
    const items = l.items || [];
    const preview =
      items.length > 0
        ? items
            .slice(0, 2)
            .map((it) => it.korean)
            .filter(Boolean)
            .join(" · ")
        : "";

    html += `
        <div class="lesson-card due" onclick="openStudyModal('${l.sid}','${l.bid}','${l.id}')">
            <div class="lesson-card-header">
                <span class="lesson-status due">⏰ Cần ôn</span>
            </div>
            <div class="lesson-card-title">${esc(l.title)}</div>
            <div class="lesson-card-preview">${esc(preview)}</div>
            <div class="lesson-card-footer">
                <span class="lesson-review-date">Lần cuối: ${l.lastStudied || "—"}</span>
                <span class="lesson-review-date">${items.length} mục · Lv.${l.level || 0}</span>
            </div>
        </div>`;
  });

  container.innerHTML = html;
}

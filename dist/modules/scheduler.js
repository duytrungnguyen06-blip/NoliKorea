(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.KLAScheduler = api;
})(globalThis, () => {
  const localDate = (d = new Date()) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const due = (l, now = Date.now()) =>
    !!(
      l.studied &&
      l.nextReview &&
      (l.nextReviewAt
        ? Date.parse(l.nextReviewAt) <= now
        : l.nextReview <= localDate(new Date(now)))
    );
  function schedule(l, rating, now = Date.now()) {
    if (!["again", "hard", "good", "easy"].includes(rating))
      throw Error("Đánh giá không hợp lệ");
    const level =
      rating === "again" ? Math.max(0, (l.level || 0) - 1) : (l.level || 0) + 1;
    const next = new Date(now);
    if (rating === "again") next.setTime(now + 600000);
    else
      next.setDate(
        next.getDate() +
          { hard: 1, good: 3, easy: 7 }[rating] * Math.max(1, level),
      );
    return {
      level,
      studied: true,
      lastStudied: localDate(new Date(now)),
      nextReview: localDate(next),
      nextReviewAt: rating === "again" ? next.toISOString() : null,
      inProgress: false,
      lastCompletedAt: now,
      session: null,
    };
  }
  function streak(previous, now = Date.now()) {
    const today = localDate(new Date(now)),
      y = new Date(now);
    y.setDate(y.getDate() - 1);
    const old = previous || { count: 0, history: [] };
    return {
      count:
        old.lastDate === today
          ? old.count
          : old.lastDate === localDate(y)
            ? old.count + 1
            : 1,
      lastDate: today,
      history: [...new Set([...(old.history || []), today])],
    };
  }
  const itemKey = (sid, bid, lid, item) =>
    JSON.stringify(item.id||item.itemId?[sid,bid,lid,item.id||item.itemId]:[sid,bid,lid,item.korean,item.vi||""]);
  function recordItem(
    old,
    { sid, bid, lid, korean, vi, id, itemId },
    rating,
    now = Date.now(),
  ) {
    const level = rating === "again" ? 0 : Math.min(8, (old?.level || 0) + 1);
    const minutes =
      rating === "again"
        ? 10
        : ({ hard: 1, good: 3, easy: 7 }[rating] || 1) *
          1440 *
          Math.max(1, level);
    return {
      ...(id||itemId?{itemId:id||itemId}:{}),
      sid,
      bid,
      lid,
      korean,
      vi: vi || "",
      level,
      lapses: (old?.lapses || 0) + (rating === "again" ? 1 : 0),
      dueAt: now + minutes * 60000,
      lastReviewedAt: now,
    };
  }
  return { localDate, due, schedule, streak, itemKey, recordItem };
});

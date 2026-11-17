/* Per-item review complements the existing lesson rating. */
window.ItemReviews = (() => {
  let active = null,
    revealed = false;
  const itemExists = (i) =>
    lesson(i.sid, i.bid, i.lid)?.items.some(
      (x) => i.itemId ? x.id === i.itemId : x.korean === i.korean && x.vi === i.vi,
    );
  const dueItems = () =>
    Object.entries(db.itemReviews || {})
      .filter(([, i]) => itemExists(i) && i.dueAt <= Date.now())
      .sort((a, b) => b[1].lapses - a[1].lapses || a[1].dueAt - b[1].dueAt);
  function fromRecall(ex, l) {
    if (!ctx) return;
    const ko = ex.koreanAudio || ex.correct;
    const item = l.items.find((i) => i.korean === ko);
    if (!item) return;
    db.itemReviews ||= {};
    const key = KLAScheduler.itemKey(ctx.sid, ctx.bid, l.id, item);
    const previous=db.itemReviews[key];
    if(previous?.lastReviewedAt && Date.now()-previous.lastReviewedAt<600000) return;
    db.itemReviews[key] = KLAScheduler.recordItem(
      db.itemReviews[key],
      { ...ctx, itemId:item.id, korean: item.korean, vi: item.vi },
      ex.state === "correct" ? "good" : "again",
    );
  }
  function render() {
    const box = $("itemReviewSection");
    if (!box) return;
    const list = dueItems();
    if (active && !list.some(([key]) => key === active)) active = null;
    box.replaceChildren();
    const h = document.createElement("h3");
    h.textContent = "Ôn từng mục · " + list.length + " đến hạn";
    box.append(h);
    if (!list.length) {
      const p = document.createElement("p");
      p.textContent =
        "Lịch ôn từng mục được tạo khi bạn trả lời Recall. Mục thường sai sẽ được ưu tiên.";
      box.append(p);
      return;
    }
    if (!active) {
      const b = document.createElement("button");
      b.className = "btn btn-primary";
      b.textContent = "Ôn mục cần nhớ";
      b.onclick = () => {
        active = list[0][0];
        revealed = false;
        render();
      };
      box.append(b);
      return;
    }
    const item = db.itemReviews[active];
    const prompt = document.createElement("p");
    prompt.className = "item-review-prompt";
    prompt.textContent = item.vi || "Nhớ lại câu tiếng Hàn";
    box.append(prompt);
    const a = document.createElement("p");
    a.className = "item-review-answer";
    a.textContent = revealed
      ? item.korean
      : "Hãy nhớ lại trước khi xem đáp án.";
    box.append(a);
    if (!revealed) {
      const show = document.createElement("button");
      show.className = "btn btn-secondary";
      show.textContent = "Xem đáp án";
      show.onclick = () => {
        revealed = true;
        render();
      };
      box.append(show);
      return;
    }
    const controls = document.createElement("div");
    controls.className = "item-review-controls";
    for (const [rating, label] of [
      ["again", "Quên · 10 phút"],
      ["hard", "Khó"],
      ["good", "Nhớ"],
      ["easy", "Dễ"],
    ]) {
      const b = document.createElement("button");
      b.className = "btn btn-secondary";
      b.textContent = label;
      b.onclick = () => {
        db.itemReviews[active] = KLAScheduler.recordItem(item, item, rating);
        recordDailyStreak();
        if (!save()) return;
        active = null;
        revealed = false;
        render();
      };
      controls.append(b);
    }
    box.append(controls);
  }
  return { fromRecall, render, dueItems };
})();

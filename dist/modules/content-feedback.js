/* Local editorial flags are part of the normal JSON backup. */
window.ContentFeedback = (() => {
  function flag(item) {
    const note = prompt(
      "Nội dung nào cần kiểm tra lại? (nghĩa, câu mẫu, phát âm…)",
      "",
    );
    if (note === null) return;
    db.contentFlags ||= [];
    db.contentFlags.push({
      id: uid(),
      ...item,
      note: note.trim(),
      createdAt: Date.now(),
      resolved: false,
    });
    if (save()) {
      render();
      alert("Đã lưu vào Sổ ghi chú trong Tiến độ.");
    }
  }
  function render() {
    const view = $("progressView");
    if (!view) return;
    let box = $("contentFlags");
    if (!box) {
      box = document.createElement("section");
      box.id = "contentFlags";
      box.className = "settings-section";
      view.append(box);
    }
    box.replaceChildren();
    const title = document.createElement("h3");
    title.textContent = "Sổ ghi chú · Nội dung cần xem lại";
    box.append(title);
    const flags = db.contentFlags || [];
    if (!flags.length) {
      const p = document.createElement("p");
      p.textContent =
        "Bấm ⚑ trong bài học để ghi chú nội dung cần kiểm tra. Các ghi chú được giữ trong bản xuất dữ liệu.";
      box.append(p);
    }
    for (const item of flags) {
      const row = document.createElement("div");
      row.className = "content-flag";
      const p = document.createElement("p");
      p.textContent = `${item.korean} — ${item.vi}\n${item.note}`;
      const b = document.createElement("button");
      b.className = "btn btn-secondary";
      b.textContent = item.resolved
        ? "Đã xem lại · Mở lại"
        : "Đánh dấu đã xem lại";
      b.onclick = () => {
        item.resolved = !item.resolved;
        if (save()) render();
      };
      row.append(p, b);
      box.append(row);
    }
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-flag-item]");
    if (!b || !ctx) return;
    const item = lesson(ctx.sid, ctx.bid, ctx.lid)?.items[
      Number(b.dataset.flagItem)
    ];
    if (item) flag({ ...ctx, korean: item.korean, vi: item.vi });
  });
  document.addEventListener("DOMContentLoaded", render);
  return { flag, render };
})();

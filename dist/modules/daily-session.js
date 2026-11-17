/* A bounded 8-item practice + two writing prompts, separate from full-lesson completion. */
window.DailySession = (() => {
  const clone = (x) => JSON.parse(JSON.stringify(x));
  let returnFocus, timer;
  function draft() {
    clearTimeout(timer);
    timer = setTimeout(persist, 1800);
  }
  const state = () =>
    db.dailyPractice ||
    (db.dailyPractice = { seen: [], history: [], active: null });
  const current = () => state().active;
  const add = (parent, tag, text, cls) => {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (cls) el.className = cls;
    parent.append(el);
    return el;
  };
  const button = (parent, text, fn, primary = false) => {
    const b = add(
      parent,
      "button",
      text,
      "btn " + (primary ? "btn-primary" : "btn-secondary"),
    );
    b.type = "button";
    b.onclick = fn;
    return b;
  };
  function persist() {
    clearTimeout(timer);
    return save();
  }
  function productionPrompts(items) {
    const unique = [];
    for (const i of items) {
      const l = lesson(i.sid, i.bid, i.lid);
      for (const line of (l?.situations || "").split("\n")) {
        const [prompt, sample] = line.split("|").map((x) => x?.trim());
        if (prompt && sample && !unique.some((p) => p.sample === sample))
          unique.push({ prompt, sample, lid: i.lid });
      }
      if (unique.length >= 2) break;
    }
    return unique.slice(0, 2);
  }
  function start() {
    StudySession.capture();
    closeAll();
    const existing = current();
    if (!existing || existing.finished) {
      const items = KLALearning.queue(db);
      if (!items.length) {
        alert("Chưa có bài chứa nội dung để luyện.");
        return;
      }
      const pool = KLALearning.flatten(db);
      const cards = items.map((i, n) => ({
        ...i,
        mode: n % 2 ? "typing" : "choice",
        options: [i.vi, ...KLALearning.distractors(i, pool)].sort(
          () => Math.random() - 0.5,
        ),
        first: null,
        retry: null,
        typed: "",
        revealed: false,
      }));
      state().active = {
        id: uid(),
        startedAt: Date.now(),
        cards,
        index: 0,
        stage: "recall",
        production: productionPrompts(items),
        productionIndex: 0,
        writing: [],
        finished: false,
      };
      if (!persist()) return;
    }
    returnFocus = document.activeElement;
    $("dailyModal").classList.add("active");
    render();
  }
  function close() {
    if (current() && !current().finished) persist();
    window.KoreanVoice?.stop();
    $("dailyModal").classList.remove("active");
    returnFocus?.focus();
    renderLauncher();
  }
  function renderLauncher() {
    let box = $("dailyLauncher");
    if (!box) {
      box = document.createElement("section");
      box.id = "dailyLauncher";
      box.className = "daily-launcher";
      $("learningDashboard").after(box);
    }
    box.replaceChildren();
    add(box, "span", "PHIÊN HỌC HÔM NAY", "eyebrow");
    add(box, "h3", "Một phiên ngắn, một bước tiến.");
    add(
      box,
      "p",
      "Tối đa 8 mục nhớ lại + 2 tình huống tự viết · khoảng 5–10 phút",
    );
    button(
      box,
      current() && !current().finished
        ? "Tiếp tục phiên đang học"
        : "Bắt đầu phiên ngắn",
      start,
      true,
    );
  }
  function render() {
    const s = current(),
      box = $("dailyBody");
    if (!s) return;
    box.replaceChildren();
    if (s.finished) {
      summary(box, s);
      return;
    }
    add(
      box,
      "p",
      s.stage === "recall"
        ? `Nhớ lại ${Math.min(s.index + 1, s.cards.length)} / ${s.cards.length}`
        : s.stage === "retry"
          ? `Củng cố lại ${s.retryIndex + 1} / ${s.retryQueue.length}`
          : `Tự viết ${s.productionIndex + 1} / ${s.production.length}`,
      "eyebrow",
    );
    const progress = add(box, "progress");
    progress.max = s.cards.length + s.production.length;
    progress.value =
      s.stage === "recall" ? s.index : s.cards.length + s.productionIndex;
    progress.setAttribute("aria-label", "Tiến độ phiên ngắn");
    if (s.stage === "production") {
      writing(box, s);
      return;
    }
    const index = s.stage === "retry" ? s.retryQueue[s.retryIndex] : s.index,
      card = s.cards[index];
    const answer = s.stage === "retry" ? card.retry : card.first;
    const typing = s.stage === "retry" || card.mode === "typing";
    add(box, "span", card.reason, "lesson-status");
    add(box, "h3", typing ? card.vi : card.korean, "daily-prompt");
    add(
      box,
      "p",
      typing ? "Gõ cách nói bằng tiếng Hàn." : "Chọn nghĩa phù hợp.",
    );
    const form = add(box, "form");
    form.onsubmit = (e) => {
      e.preventDefault();
      if (typing && !answer) submit(form.querySelector("input").value);
    };
    if (typing) {
      const input = add(form, "input");
      input.type = "text";
      input.id = "dailyAnswer";
      input.autocomplete = "off";
      input.setAttribute("aria-label", "Câu trả lời tiếng Hàn");
      input.value = card.typed || "";
      input.disabled = !!answer;
      input.oninput = () => {
        card.typed = input.value;
        draft();
      };
      button(form, "Kiểm tra", () => submit(input.value), true).disabled =
        !!answer;
    } else {
      const opts = add(form, "div", undefined, "daily-options");
      for (const value of card.options) {
        const b = button(opts, value, () => submit(value));
        b.disabled = !!answer;
      }
    }
    if (answer) {
      const feedback = add(box, "div", undefined, "daily-feedback");
      feedback.setAttribute("role", "status");
      add(
        feedback,
        "strong",
        answer.correct ? "Đúng rồi." : "Cùng xem lại nhé.",
      );
      add(
        feedback,
        "p",
        answer.correct
          ? `“${card.korean}” — ${card.vi}`
          : typing
            ? `Cách nói trong bài: ${card.korean}. Chú ý thứ tự âm tiết và từ; bạn sẽ gặp lại mục này bằng cách hỏi khác.`
            : KLALearning.explain(card, answer.value, s.cards),
      );
      button(feedback, "Nghe câu mẫu", () => KoreanVoice.speak(card.korean));
      button(box, "Tiếp tục", next, true);
    } else button(box, "Xem đáp án (không tính đúng)", () => submit("", true));
    button(box, "Đánh dấu cần xem lại", () =>
      ContentFeedback.flag({
        sid: card.sid,
        bid: card.bid,
        lid: card.lid,
        korean: card.korean,
        vi: card.vi,
      }),
    );
  }
  function submit(value, revealed = false) {
    const s = current();
    if (!s || !["recall", "retry"].includes(s.stage)) return;
    const retry = s.stage === "retry",
      card = s.cards[retry ? s.retryQueue[s.retryIndex] : s.index];
    if (retry ? card.retry : card.first) return;
    if (!value.trim() && !revealed) return;
    const typing = retry || card.mode === "typing";
    const correct =
      !revealed &&
      (typing ? KLALearning.isAnswer(value, card) : value === card.vi);
    const result = { value, correct, revealed };
    if (retry) card.retry = result;
    else card.first = result;
    const key = KLALearning.key(card);
    db.itemReviews ||= {};
    if (!retry) {
      db.itemReviews[key] = KLAScheduler.recordItem(
        db.itemReviews[key],
        card,
        correct ? "good" : "again",
      );
      if (!state().seen.includes(key)) state().seen.push(key);
    } // Retry doesn't erase the initial scheduling evidence.
    if (!persist()) return;
    render();
  }
  function next() {
    const s = current();
    if (s.stage === "recall") {
      if (!s.cards[s.index].first) return;
      s.index++;
      if (s.index === s.cards.length) {
        s.retryQueue = s.cards
          .map((c, i) => (!c.first.correct ? i : -1))
          .filter((i) => i >= 0);
        s.retryIndex = 0;
        s.stage = s.retryQueue.length ? "retry" : "production";
      }
    } else if (s.stage === "retry") {
      if (!s.cards[s.retryQueue[s.retryIndex]].retry) return;
      s.retryIndex++;
      if (s.retryIndex === s.retryQueue.length) s.stage = "production";
    }
    if (s.stage === "production" && !s.production.length) {
      finish();
      return;
    }
    if (persist()) render();
  }
  function writing(box, s) {
    const p = s.production[s.productionIndex],
      entry =
        s.writing[s.productionIndex] ||
        (s.writing[s.productionIndex] = {
          text: "",
          viewed: false,
          submitted: false,
        });
    add(box, "h3", p.prompt, "daily-prompt");
    add(
      box,
      "p",
      "Viết câu của bạn trước, rồi đối chiếu. Cách diễn đạt khác mẫu có thể vẫn đúng.",
    );
    const input = add(box, "textarea");
    input.rows = 3;
    input.setAttribute("aria-label", "Câu tự viết");
    input.value = entry.text;
    input.disabled = entry.submitted;
    input.oninput = () => {
      entry.text = input.value;
      draft();
    };
    button(
      box,
      "Đối chiếu câu mẫu",
      () => {
        if (!entry.text.trim()) return;
        entry.submitted = true;
        entry.viewed = true;
        if (persist()) render();
      },
      true,
    );
    if (entry.viewed) {
      const known = KLALearning.variants(p.sample).some(
        (v) => KLALearning.normalize(v) === KLALearning.normalize(entry.text),
      );
      add(
        box,
        "p",
        known
          ? "Câu khớp với một cách diễn đạt được hỗ trợ."
          : "Câu khác mẫu; phần này không tự kết luận đúng/sai.",
        "daily-feedback",
      );
      add(box, "p", p.sample, "daily-sample");
      button(box, "Nghe mẫu", () => KoreanVoice.speak(p.sample));
      button(
        box,
        s.productionIndex + 1 < s.production.length
          ? "Tình huống tiếp theo"
          : "Kết thúc phiên",
        () => {
          if (!entry.submitted) return;
          s.productionIndex++;
          if (s.productionIndex === s.production.length) finish();
          else if (persist()) render();
        },
        true,
      );
    }
  }
  function finish() {
    const s = current();
    if (
      !s ||
      s.finished ||
      s.cards.some((c) => !c.first) ||
      s.writing.filter((w) => w.submitted).length < s.production.length
    )
      return;
    s.finished = true;
    s.finishedAt = Date.now();
    const result = {
      id: s.id,
      date: today(),
      count: s.cards.length,
      firstCorrect: s.cards.filter((c) => c.first.correct).length,
      recovered: s.cards.filter((c) => !c.first.correct && c.retry?.correct)
        .length,
      writing: s.writing.filter((w) => w.submitted).length,
      seconds: Math.round((Date.now() - s.startedAt) / 1000),
    };
    state().history.push(result);
    state().history = state().history.slice(-30);
    recordDailyStreak();
    if (persist()) {
      render();
      renderLauncher();
    }
  }
  function summary(box, s) {
    const first = s.cards.filter((c) => c.first.correct).length,
      recovered = s.cards.filter(
        (c) => !c.first.correct && c.retry?.correct,
      ).length;
    add(box, "h3", "Bạn đã hoàn tất phiên ngắn.");
    add(
      box,
      "p",
      `${first}/${s.cards.length} đúng ngay lần đầu · ${recovered} mục nhớ lại được sau khi luyện thêm · ${s.writing.filter((w) => w.submitted).length} câu tự viết.`,
    );
    const weak = s.cards.filter((c) => !c.first.correct);
    if (weak.length) {
      add(box, "h4", "Nên ôn tiếp");
      const ul = add(box, "ul");
      weak.forEach((c) => add(ul, "li", c.korean + " — " + c.vi));
      add(box, "p", "Các mục sai lần đầu được hẹn ôn sau 10 phút.");
    } else
      add(
        box,
        "p",
        "Lần tới, tiếp tục ôn các mục đến hạn hoặc mở bài học đầy đủ.",
      );
    button(box, "Về giáo trình", close, true);
  }
  document.addEventListener("DOMContentLoaded", () => {
    const modal = document.createElement("div");
    modal.id = "dailyModal";
    modal.className = "modal";
    modal.innerHTML =
      '<div class="modal-overlay"></div><div class="modal-content daily-modal-content"><div class="modal-header"><h2 id="dailyTitle">Phiên học hôm nay</h2><button type="button" class="modal-close" aria-label="Tạm dừng phiên học">×</button></div><div class="modal-body" id="dailyBody"></div></div>';
    $("mainContent").after(modal);
    document.body.append(modal);
    modal.querySelector(".modal-close").onclick = close;
    modal.querySelector(".modal-overlay").onclick = close;
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && current() && !current().finished) persist();
  });
  window.addEventListener("pagehide", () => {
    if (current() && !current().finished) persist();
  });
  return { start, close, render, renderLauncher, submit, next, finish };
})();

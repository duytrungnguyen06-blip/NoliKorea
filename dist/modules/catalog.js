window.reloadSnu1aCurriculum = function (showToast = true) {
  const curricSource = window.CURRICULUM_DATA || window.DEFAULT_CURRICULUM;
  if (
    showToast &&
    !confirm(
      "Khôi phục nội dung Seoul 1A? Nội dung bạn chỉnh sửa trong 8 bài sẽ được thay thế. Hãy xuất dữ liệu trước nếu cần.",
    )
  )
    return;
  if (!curricSource || !curricSource.stages) {
    alert("Không tìm thấy dữ liệu CURRICULUM_DATA.");
    return;
  }
  try {
    dataStore.snapshot("Trước khi khôi phục Seoul 1A");
  } catch (e) {
    dataNotice("Không tạo được bản khôi phục: " + e.message);
    return;
  }
  const srcB1a = curricSource.stages[0]?.books[0];
  if (!srcB1a) return;

  if (!db.stages || db.stages.length === 0) {
    db = JSON.parse(JSON.stringify(curricSource));
  } else {
    if (!db.stages[0])
      db.stages[0] = JSON.parse(JSON.stringify(curricSource.stages[0]));
    if (!db.stages[0].books) db.stages[0].books = [];
    let tgtBook =
      db.stages[0].books.find((b) => b.id === "b1a") || db.stages[0].books[0];
    if (!tgtBook) {
      tgtBook = JSON.parse(JSON.stringify(srcB1a));
      db.stages[0].books.unshift(tgtBook);
    } else {
      srcB1a.lessons.forEach((srcL, idx) => {
        let tgtL =
          tgtBook.lessons.find((l) => l.id === srcL.id) || tgtBook.lessons[idx];
        if (!tgtL) {
          tgtBook.lessons.push(JSON.parse(JSON.stringify(srcL)));
        } else {
          tgtL.id = srcL.id;
          tgtL.title = srcL.title;
          tgtL.items = JSON.parse(JSON.stringify(srcL.items));
          tgtL.situations = srcL.situations;
          tgtL.examples = srcL.examples;
          tgtL.notes = srcL.notes;
        }
      });
    }
  }
  save();
  render();
  if (showToast) {
    alert(
      "🎉 Đã nạp thành công toàn bộ 8 bài học chuẩn Seoul National University Korean 1A (Mỗi bài gồm đúng 28 mục từ vựng, tình huống, ví dụ, ngữ pháp và phát âm)!",
    );
  }
};
// Alias for backward compatibility
window.reloadSnu1aLesson1 = window.reloadSnu1aCurriculum;

window.reloadDefaultCurriculum = function (showToast = true) {
  if (
    showToast &&
    !confirm(
      "Khôi phục toàn bộ giáo trình và đặt lại tiến độ? Hãy xuất dữ liệu trước nếu cần.",
    )
  )
    return;
  const curricSource = window.CURRICULUM_DATA || window.DEFAULT_CURRICULUM;
  if (curricSource && curricSource.stages) {
    if (!replaceData(curricSource, "Trước khi khôi phục toàn bộ giáo trình"))
      return;
    if (showToast) {
      alert(
        "🎉 Đã khởi tạo thành công toàn bộ Giáo trình (Bao gồm chuẩn 28 mục cho cả 8 bài học Seoul 1A)!",
      );
    }
  }
};

/* KLA v4.1 catalog.js */
function render() {
  const { sid, bid } = nav;
  renderBreadcrumb();

  $("stageList").classList.toggle("hidden", !!sid);
  $("bookList").classList.toggle("hidden", !sid || !!bid);
  $("lessonList").classList.toggle("hidden", !bid);

  // Book AI banner visibility
  const banner = $("bookAiBanner");
  if (banner) {
    if (bid) {
      const b = book(sid, bid);
      banner.classList.remove("hidden");
      if ($("bookAiName"))
        $("bookAiName").textContent = b ? b.name : "Quyển sách";
      if ($("bookAiDesc"))
        $("bookAiDesc").textContent =
          `Chỉ trò chuyện bằng từ vựng & mẫu câu trong ${b ? b.name : "quyển này"}`;
    } else {
      banner.classList.add("hidden");
    }
  }

  if (!sid) renderStages();
  else if (!bid) renderBooks(sid);
  else renderLessons(sid, bid);
}

// ─── Breadcrumb ──────────────────────────────────
function renderBreadcrumb() {
  const { sid, bid } = nav;
  let html = "";

  if (sid || bid) {
    const backTarget = bid ? "quyển sách" : "giai đoạn";
    html += `
        <button type="button" class="btn-back" onclick="goBack()" title="Quay lại danh sách ${backTarget}">
            <span class="btn-back-icon">←</span>
            <span>Quay lại</span>
        </button>`;
  }

  html += `<span class="breadcrumb-item${!sid ? " current" : ""}" onclick="go(null,null)">📚 Giáo trình</span>`;

  if (sid) {
    const s = stage(sid);
    html += `<span class="breadcrumb-sep">›</span>`;
    html += `<span class="breadcrumb-item${!bid ? " current" : ""}" onclick="go('${sid}',null)">${esc(s?.name || "")}</span>`;
  }
  if (bid) {
    const b = book(sid, bid);
    html += `<span class="breadcrumb-sep">›</span>`;
    html += `<span class="breadcrumb-item current">${esc(b?.name || "")}</span>`;
  }

  $("breadcrumb").innerHTML = html;
}

// ─── Stage Cards ─────────────────────────────────
function renderStages() {
  const emojis = ["🌱", "🌿", "🌳", "🏔️", "⭐", "🚀"];
  const banners = [
    "linear-gradient(135deg,#667eea,#764ba2)",
    "linear-gradient(135deg,#43e97b,#38f9d7)",
    "linear-gradient(135deg,#f7971e,#ffd200)",
    "linear-gradient(135deg,#4facfe,#00f2fe)",
    "linear-gradient(135deg,#f093fb,#f5576c)",
    "linear-gradient(135deg,#4481eb,#04befe)",
  ];
  let html = "";

  if (db.stages.length === 0) {
    html += `
        <div class="empty-grid-panel empty-state">
            <div class="empty-panel-icon empty-icon">📚</div>
            <h3 class="space-below">Chào mừng bạn đến với Giáo trình tiếng Hàn!</h3>
            <p class="empty-panel-description">Trình duyệt chưa tải dữ liệu bài học.</p>
            <button type="button" class="button-large btn btn-primary" onclick="reloadDefaultCurriculum()">
                🚀 Khởi tạo toàn bộ Giáo trình (Seoul 1A - 3)
            </button>
        </div>`;
  }

  db.stages.forEach((s, i) => {
    const totalLessons = s.books.reduce(
      (a, b) => a + b.lessons.filter((l) => l.items?.length).length,
      0,
    );
    const studied = s.books.reduce(
      (a, b) =>
        a + b.lessons.filter((l) => l.items?.length && l.studied).length,
      0,
    );
    const pct = totalLessons ? Math.round((studied / totalLessons) * 100) : 0;

    html += `
        <div class="stage-card ${s.books.some(b=>b.lessons.some(l=>l.items?.length))?'':'empty-curriculum'}" onclick="go('${s.id}',null)">
            <div class="stage-actions">
                <button class="icon-btn" onclick="event.stopPropagation();openStageModal('${s.id}')" title="Sửa">✏️</button>
                <button class="icon-btn danger" onclick="event.stopPropagation();deleteStage('${s.id}')" title="Xóa">🗑️</button>
            </div>
            <div class="stage-card-banner" style="background:${banners[i % banners.length]}">
                <div class="stage-emoji">${emojis[i % emojis.length]}</div>
            </div>
            <div class="stage-body">
                <div class="stage-name">${esc(s.name)}</div>
                <div class="stage-desc">${esc(s.desc)}</div>
                <div class="stage-meta">
                    <div class="stage-meta-item">
                        <span class="stage-meta-label">Quyển</span>
                        <span class="stage-meta-value">${s.books.length}</span>
                    </div>
                    <div class="stage-meta-item">
                        <span class="stage-meta-label">Bài học</span>
                        <span class="stage-meta-value">${totalLessons}</span>
                    </div>
                    <div class="stage-meta-item">
                        <span class="stage-meta-label">Hoàn thành</span>
                        <span class="stage-meta-value">${studied}/${totalLessons}</span>
                    </div>
                </div>
                <div class="stage-progress-bar">
                    <div class="stage-progress-fill" style="width:${pct}%"></div>
                </div>
            </div>
        </div>`;
  });

  // Add-new card
  html += `
    <div class="stage-card stage-card-add" onclick="openStageModal()">
        <div class="text-center">
            <div class="book-empty-icon">➕</div>
            <div class="stage-name">Thêm giai đoạn mới</div>
        </div>
    </div>`;

  $("stageList").innerHTML = html;
}

// ─── Book Cards ──────────────────────────────────
function renderBooks(sid) {
  const s = stage(sid);
  if (!s) return;

  let html = `<div class="add-row">
        <button type="button" class="btn btn-primary" onclick="openBookModal('${sid}')">➕ Thêm quyển</button>
    </div>`;

  if (s.books.length === 0) {
    html += `
        <div class="empty-state">
            <div class="empty-icon">📖</div>
            <h3>Chưa có quyển nào</h3>
            <p>Bấm "Thêm quyển" để bắt đầu!</p>
        </div>`;
  }

  s.books.forEach((b) => {
    const total = b.lessons.length;
    const studied = b.lessons.filter((l) => l.studied).length;
    const pct = total ? Math.round((studied / total) * 100) : 0;

    html += `
        <div class="book-card ${b.lessons.some(l=>l.items?.length)?'':'empty-curriculum'}" onclick="go('${sid}','${b.id}')">
            <div class="book-icon">📖</div>
            <div class="book-info">
                <div class="book-name">${esc(b.name)}</div>
                <div class="book-desc">${esc(b.desc)}</div>
                <div class="book-progress">
                    <div class="book-progress-bar">
                        <div class="book-progress-fill" style="width:${pct}%"></div>
                    </div>
                    <span class="book-progress-text">${studied}/${total} bài</span>
                </div>
            </div>
            <div class="book-actions">
                <button class="icon-btn" onclick="event.stopPropagation();openBookModal('${sid}','${b.id}')" title="Sửa">✏️</button>
                <button class="icon-btn danger" onclick="event.stopPropagation();deleteBook('${sid}','${b.id}')" title="Xóa">🗑️</button>
            </div>
        </div>`;
  });

  $("bookList").innerHTML = html;
}

// ─── Lesson Cards ────────────────────────────────
function renderLessons(sid, bid) {
  const b = book(sid, bid);
  if (!b) return;
  const t = today();

  let html = `<div class="catalog-actions add-row">
        <button type="button" class="btn btn-primary" onclick="openLessonModal('${sid}','${bid}')">➕ Thêm bài học</button>
        ${bid === "b1a" ? `<button type="button" class="curriculum-restore-button btn btn-secondary" onclick="reloadSnu1aCurriculum()" title="Nạp toàn bộ 8 bài học chuẩn theo sách Seoul 1A">📖 Nạp chuẩn Seoul 1A (Bài 1–8)</button>` : ""}
    </div>`;

  if (b.lessons.length === 0) {
    html += `
        <div class="span-grid empty-state">
            <div class="empty-icon">📝</div>
            <h3>Chưa có bài học nào</h3>
            <p>Bấm "Thêm bài học" để bắt đầu!</p>
        </div>`;
  }

  b.lessons.forEach((l) => {
    let statusClass = "",
      statusText = "Chưa học";
    if (l.studied) {
      if (isDue(l)) {
        statusClass = "due";
        statusText = "⏰ Cần ôn";
      } else {
        statusClass = "studied";
        statusText = "✅ Đã học";
      }
    }

    if (!l.studied && l.inProgress) {
      statusClass = "in-progress";
      statusText = "Đang học";
    }
    const items = l.items || [];
    const itemCount = items.length;
    if (!itemCount) {
      statusClass = "placeholder";
      statusText = "Chưa có nội dung";
    }
    const preview =
      items.length > 0
        ? items
            .slice(0, 2)
            .map((it) => it.korean)
            .filter(Boolean)
            .join(" · ") + (items.length > 2 ? " …" : "")
        : "Chưa có nội dung";
    const hasAudio = !!(window.AUDIO_MAP && window.AUDIO_MAP[l.id]);

    html += `
        <div class="lesson-card ${statusClass}" data-study="${sid}|${bid}|${l.id}">
            <div class="lesson-card-header">
                <span class="lesson-status ${statusClass}">${statusText}</span>
                <div class="lesson-card-actions">
                    <button class="icon-btn" onclick="event.stopPropagation();openLessonModal('${sid}','${bid}','${l.id}')" title="Sửa">✏️</button>
                    <button class="icon-btn danger" onclick="event.stopPropagation();deleteLesson('${sid}','${bid}','${l.id}')" title="Xóa">🗑️</button>
                </div>
            </div>
            <div class="lesson-card-title">${esc(l.title)}</div>
            <div class="lesson-card-preview">${esc(preview)}</div>
            <div class="lesson-card-footer">
                <span class="lesson-review-date">${itemCount} mục${l.lastStudied ? " · Học: " + l.lastStudied : ""}</span>
                ${hasAudio ? `<span class="audio-badge">🎧 CD Audio</span>` : ""}
                ${l.nextReview ? `<span class="lesson-review-date">Ôn: ${esc(reviewLabel(l))}</span>` : ""}
            </div>
        </div>`;
  });

  $("lessonList").innerHTML = html;
}

// ═══════════════════════════════════════════════════
//  STAGE CRUD
// ═══════════════════════════════════════════════════

function openStageModal(editId) {
  const s = editId ? stage(editId) : null;
  $("stageModalTitle").textContent = s ? "Sửa giai đoạn" : "Thêm giai đoạn";
  $("stageId").value = s ? s.id : "";
  $("stageName").value = s ? s.name : "";
  $("stageDesc").value = s ? s.desc || "" : "";
  $("stageModal").classList.add("active");
}

function closeStageModal() {
  $("stageModal").classList.remove("active");
}

function saveStage(e) {
  e.preventDefault();
  const id = $("stageId").value;
  const name = $("stageName").value.trim();
  const desc = $("stageDesc").value.trim();

  if (id) {
    const s = stage(id);
    if (s) {
      s.name = name;
      s.desc = desc;
    }
  } else {
    db.stages.push({ id: uid(), name, desc, books: [] });
  }

  save();
  closeStageModal();
  render();
}

function deleteStage(sid) {
  if (!confirm("Xóa giai đoạn này và toàn bộ nội dung bên trong?")) return;
  db.stages = db.stages.filter((s) => s.id !== sid);
  if (nav.sid === sid) nav = { sid: null, bid: null };
  save();
  render();
}

// ═══════════════════════════════════════════════════
//  BOOK CRUD
// ═══════════════════════════════════════════════════

function openBookModal(sid, editId) {
  const s = stage(sid);
  if (!s) return;
  const b = editId ? book(sid, editId) : null;
  $("bookModalTitle").textContent = b ? "Sửa quyển" : "Thêm quyển";
  $("bookId").value = b ? b.id : "";
  $("bookStageId").value = sid;
  $("bookName").value = b ? b.name : "";
  $("bookDesc").value = b ? b.desc || "" : "";
  $("bookModal").classList.add("active");
}

function closeBookModal() {
  $("bookModal").classList.remove("active");
}

function saveBook(e) {
  e.preventDefault();
  const id = $("bookId").value;
  const sid = $("bookStageId").value;
  const name = $("bookName").value.trim();
  const desc = $("bookDesc").value.trim();
  const s = stage(sid);
  if (!s) return;

  if (id) {
    const b = book(sid, id);
    if (b) {
      b.name = name;
      b.desc = desc;
    }
  } else {
    s.books.push({ id: uid(), name, desc, lessons: [] });
  }

  save();
  closeBookModal();
  render();
}

function deleteBook(sid, bid) {
  if (!confirm("Xóa quyển này và toàn bộ bài học bên trong?")) return;
  const s = stage(sid);
  if (s) s.books = s.books.filter((b) => b.id !== bid);
  if (nav.bid === bid) nav.bid = null;
  save();
  render();
}

// ═══════════════════════════════════════════════════
//  LESSON CRUD  (items-based)
// ═══════════════════════════════════════════════════

function addLessonItem(korean, vi, en, metadata = {}) {
  const container = $("lessonItems");
  const row = document.createElement("div");
  row.className = "lesson-item-row";
  row._metadata = {...metadata, id: metadata.id || uid()};
  const fields = document.createElement("div");
  fields.className = "item-fields";
  for (const [lang, value, label] of [
    ["korean", korean, "Tiếng Hàn"],
    ["vi", vi, "Tiếng Việt"],
    ["en", en, "English"],
  ]) {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "item-" + lang;
    input.placeholder = label;
    input.setAttribute("aria-label", label);
    input.value = value || "";
    fields.append(input);
  }
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "icon-btn danger item-remove";
  remove.textContent = "×";
  remove.setAttribute("aria-label", "Xóa mục");
  remove.addEventListener("click", () => row.remove());
  row.append(fields, remove);
  container.appendChild(row);
  // Focus the Korean input of the new row
  row.querySelector(".item-korean").focus();
}

function collectLessonItems() {
  const rows = $("lessonItems").querySelectorAll(".lesson-item-row");
  const items = [];
  rows.forEach((row) => {
    const korean = row.querySelector(".item-korean").value.trim();
    const vi = row.querySelector(".item-vi").value.trim();
    const en = row.querySelector(".item-en").value.trim();
    if (korean || vi || en) {
      items.push({ ...row._metadata, korean, vi, en });
    }
  });
  return items;
}

function openLessonModal(sid, bid, editId) {
  const l = editId ? lesson(sid, bid, editId) : null;
  $("lessonModalTitle").textContent = l ? "Sửa bài học" : "Thêm bài học";
  $("lessonId").value = l ? l.id : "";
  $("lessonStageId").value = sid;
  $("lessonBookId").value = bid;
  $("lessonTitle").value = l ? l.title : "";

  // Render items
  const container = $("lessonItems");
  container.innerHTML = "";
  if (l && l.items && l.items.length > 0) {
    l.items.forEach((it) => addLessonItem(it.korean, it.vi, it.en, it));
  } else if (!l) {
    // New lesson: start with one empty row
    addLessonItem();
  }

  $("lessonExamples").value = l ? l.examples || "" : "";
  $("lessonSituations").value = l ? l.situations || "" : "";
  $("lessonNotes").value = l ? l.notes || "" : "";
  $("lessonModal").classList.add("active");
}

function closeLessonModal() {
  $("lessonModal").classList.remove("active");
}

function saveLesson(e) {
  e.preventDefault();
  const id = $("lessonId").value;
  const sid = $("lessonStageId").value;
  const bid = $("lessonBookId").value;
  const b = book(sid, bid);
  if (!b) return;

  const items = collectLessonItems();
  const data = {
    title: $("lessonTitle").value.trim(),
    items,
    examples: $("lessonExamples").value.trim(),
    situations: $("lessonSituations").value.trim(),
    notes: $("lessonNotes").value.trim(),
  };

  if (id) {
    const l = lesson(sid, bid, id);
    if (l) Object.assign(l, data);
  } else {
    b.lessons.push({
      id: uid(),
      ...data,
      studied: false,
      level: 0,
      lastStudied: null,
      nextReview: null,
    });
  }

  save();
  closeLessonModal();
  render();
}

function deleteLesson(sid, bid, lid) {
  if (!confirm("Xóa bài học này?")) return;
  const b = book(sid, bid);
  if (b) b.lessons = b.lessons.filter((l) => l.id !== lid);
  save();
  render();
}

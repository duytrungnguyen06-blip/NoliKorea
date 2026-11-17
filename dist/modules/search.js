/* KLA v4.1 search.js */
let searchDebounceTimer = null;
function cancelPendingSearch() {
  clearTimeout(searchDebounceTimer);
}
function initGlobalSearch() {
  const input = $("globalSearchInput");
  const dropdown = $("searchResultsDropdown");
  const clearBtn = $("clearSearchBtn");
  if (!input || !dropdown) return;

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (clearBtn) clearBtn.classList.toggle("hidden", !q);
    if (!q) {
      clearTimeout(searchDebounceTimer);
      dropdown.classList.add("hidden");
      dropdown.innerHTML = "";
      return;
    }
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      if (input.value.trim().toLowerCase() === q) performGlobalSearch(q);
    }, 150);
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".header-search-wrap")) {
      cancelPendingSearch();
      dropdown.classList.add("hidden");
    }
  });

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
      e.preventDefault();
      input.focus();
      input.select();
    }
    if (e.key === "Escape") {
      cancelPendingSearch();
      dropdown.classList.add("hidden");
    }
  });
}

function clearGlobalSearch() {
  cancelPendingSearch();
  const input = $("globalSearchInput");
  const dropdown = $("searchResultsDropdown");
  const clearBtn = $("clearSearchBtn");
  if (input) input.value = "";
  if (clearBtn) clearBtn.classList.add("hidden");
  if (dropdown) {
    dropdown.classList.add("hidden");
    dropdown.innerHTML = "";
  }
}

function performGlobalSearch(query) {
  const dropdown = $("searchResultsDropdown");
  if (!dropdown) return;

  const results = [];
  const q = query.trim().toLowerCase();
  if (!q) {
    clearGlobalSearch();
    return;
  }

  (db.stages || []).forEach((s) => {
    (s.books || []).forEach((b) => {
      (b.lessons || []).forEach((l) => {
        const pathStr = `${s.name} › ${b.name}`;

        if (l.title && l.title.toLowerCase().includes(q)) {
          results.push({
            type: "lesson",
            sid: s.id,
            bid: b.id,
            lid: l.id,
            title: l.title,
            subText: pathStr,
            badge: "📖 Bài học",
          });
        }

        (l.items || []).forEach((it) => {
          const kor = (it.korean || "").toLowerCase();
          const vi = (it.vi || "").toLowerCase();
          const en = (it.en || "").toLowerCase();

          if (kor.includes(q) || vi.includes(q) || en.includes(q)) {
            results.push({
              type: "item",
              sid: s.id,
              bid: b.id,
              lid: l.id,
              title: it.korean,
              subText: `${it.vi || it.en || ""} — [${l.title}]`,
              path: pathStr,
              badge: "🇰🇷 Từ vựng",
            });
          }
        });
      });
    });
  });

  if (results.length === 0) {
    dropdown.innerHTML = `
            <div class="search-empty">
                <span>🔍 Không tìm thấy kết quả phù hợp cho "${esc(query)}"</span>
            </div>
        `;
    dropdown.classList.remove("hidden");
    return;
  }

  const topResults = results.slice(0, 15);

  function highlight(text, q) {
    if (!text) return "";
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return esc(text);
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);
    return `${esc(before)}<mark class="search-highlight">${esc(match)}</mark>${esc(after)}`;
  }

  let html = `
        <div class="search-results-header">
            <span>Tìm thấy <b>${results.length}</b> kết quả:</span>
        </div>
        <div class="search-results-list">
    `;

  topResults.forEach((r) => {
    html += `
            <div class="search-result-item" onclick="selectSearchResult('${r.sid}', '${r.bid}', '${r.lid}')">
                <div class="search-result-main">
                    <span class="search-badge ${r.type}">${r.badge}</span>
                    <span class="search-title">${highlight(r.title, q)}</span>
                </div>
                <div class="search-result-sub">${highlight(r.subText, q)}</div>
            </div>
        `;
  });

  html += `</div>`;
  dropdown.innerHTML = html;
  dropdown.classList.remove("hidden");
}

function selectSearchResult(sid, bid, lid) {
  clearGlobalSearch();
  go(sid, bid);
  document.querySelector('.nav-btn[data-view="curriculum"]')?.click();
  openStudyModal(sid, bid, lid);
}

/* Web Locks provide one writer; revision checks also protect storage without Locks support. */
window.TabSync = (() => {
  let writable = !navigator.locks,
    release = null,
    pending = false;
  function error(message, code) {
    const e = new Error(message);
    e.code = code;
    return e;
  }
  function assertWritable() {
    if (!writable)
      throw error(
        "Một tab khác đang giữ quyền lưu. Đóng tab đó rồi chọn “Thử dùng tab này”.",
        "READ_ONLY_TAB",
      );
  }
  function showConflict(message) {
    let box = $("tabConflict");
    if (!box) {
      box = document.createElement("aside");
      box.id = "tabConflict";
      box.className = "data-notice";
      box.setAttribute("role", "alert");
      document.querySelector(".main-content").prepend(box);
    }
    box.replaceChildren();
    const p = document.createElement("p");
    p.textContent = message;
    box.append(p);
    const exportButton = document.createElement("button");
    exportButton.className = "btn btn-secondary";
    exportButton.textContent = "Xuất thay đổi trong tab này";
    exportButton.onclick = () =>
      downloadJSON(dataStore.export(db), `korean-tab-${today()}.json`);
    const reload = document.createElement("button");
    reload.className = "btn btn-secondary";
    reload.textContent = "Nạp bản mới nhất";
    reload.onclick = () => {
      if (
        confirm(
          "Thay nội dung đang xem bằng bản đã lưu mới nhất? Hãy xuất thay đổi của tab này trước nếu cần.",
        )
      )
        location.reload();
    };
    const retry = document.createElement("button");
    retry.className = "btn btn-primary";
    retry.textContent = "Thử dùng tab này";
    retry.onclick = () => acquire();
    box.append(exportButton, reload, retry);
  }
  async function acquire() {
    if (pending || release) return;
    if (!navigator.locks) {
      writable = true;
      return;
    }
    pending = true;
    try {
      await navigator.locks.request(
        "kla-data-writer",
        { ifAvailable: true },
        async (lock) => {
          pending = false;
          writable = !!lock;
          if (!lock) {
            showConflict(
              "Tab này đang ở chế độ xem để tránh ghi đè tiến độ ở tab khác.",
            );
            return;
          }
          if (dataStore.hasExternalChange())
            showConflict(
              "Có tiến độ mới từ tab khác. Xuất thay đổi hiện tại hoặc nạp bản mới trước khi lưu.",
            );
          else $("tabConflict")?.remove();
          await new Promise((resolve) => {
            release = resolve;
          });
          release = null;
          writable = false;
        },
      );
    } catch {
      pending = false;
      writable = false;
      showConflict(
        "Không lấy được quyền lưu. Hãy thử dùng tab này lại hoặc xuất thay đổi để giữ bản nháp.",
      );
    }
  }
  document.addEventListener("DOMContentLoaded", acquire);
  window.addEventListener("pagehide", () => release?.());
  window.addEventListener("pageshow", () => {
    if (!release) acquire();
  });
  window.addEventListener("storage", (e) => {
    if (e.key === KLAStore.KEY && dataStore.hasExternalChange())
      showConflict(
        "Tiến độ đã được cập nhật ở tab khác. Thay đổi trong tab này chưa ghi đè bản mới.",
      );
  });
  return { assertWritable, showConflict };
})();

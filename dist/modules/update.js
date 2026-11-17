/* Offer updates at a user-selected boundary instead of replacing an active session. */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("./sw.js");
      let updating = false;
      function offer() {
        if (
          !reg.waiting ||
          !navigator.serviceWorker.controller ||
          document.getElementById("updateNotice")
        )
          return;
        const box = document.createElement("aside");
        box.id = "updateNotice";
        box.className = "update-notice";
        box.setAttribute("role", "status");
        const text = document.createElement("p");
        text.textContent =
          "Có phiên bản mới. Bạn có thể cập nhật sau khi học xong.";
        const b = document.createElement("button");
        b.className = "btn btn-primary";
        b.textContent = "Lưu và cập nhật";
        b.onclick = () => {
          if (document.querySelector(".modal.active")) {
            text.textContent =
              "Hãy đóng màn học hoặc cuộc hội thoại trước khi cập nhật.";
            return;
          }
          if (!save()) return;
          updating = true;
          reg.waiting?.postMessage({ type: "ACTIVATE_UPDATE" });
        };
        box.append(text, b);
        document.body.append(box);
      }
      offer();
      reg.addEventListener("updatefound", () =>
        reg.installing?.addEventListener("statechange", offer),
      );
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (updating) location.reload();
      });
    } catch {
      /* Existing app remains usable when service workers are unavailable. */
    }
  });
}

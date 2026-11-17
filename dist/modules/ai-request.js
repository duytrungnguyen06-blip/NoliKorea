(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.KLARequest = api;
})(globalThis, () => {
  function create(fetcher = globalThis.fetch, timeout = 20000) {
    const pending = new Set();
    async function request(url, options = {}) {
      const controller = new AbortController();
      pending.add(controller);
      let timer;
      const aborted = new Promise((_, reject) => {
        controller.signal.addEventListener(
          "abort",
          () => {
            const e = Error(
              controller.signal.reason === "timeout"
                ? "AI phản hồi quá lâu. Vui lòng thử lại."
                : "Đã hủy yêu cầu.",
            );
            e.name =
              controller.signal.reason === "timeout"
                ? "TimeoutError"
                : "AbortError";
            reject(e);
          },
          { once: true },
        );
      });
      timer = setTimeout(() => controller.abort("timeout"), timeout);
      try {
        return await Promise.race([
          (async () => {
            const res = await fetcher(url, {
              ...options,
              signal: controller.signal,
            });
            const data = await res.json().catch(() => ({}));
            return { ok: res.ok, status: res.status, json: async () => data };
          })(),
          aborted,
        ]);
      } finally {
        clearTimeout(timer);
        pending.delete(controller);
      }
    }
    return {
      request,
      cancel() {
        for (const controller of pending) controller.abort("cancelled");
      },
    };
  }
  function history(messages, maxChars = 6000) {
    let budget = 0;
    const recent = [];
    for (const m of messages.slice(-12).reverse()) {
      const text = String(m.text || "").slice(0, 1500);
      if (budget + text.length > maxChars) break;
      budget += text.length;
      recent.unshift({ role: m.role === "model" ? "model" : "user", text });
    }
    while (recent[0]?.role === "model") recent.shift();
    return recent;
  }
  function errorMessage(status) {
    return status === 429
      ? "Đã hết hạn mức hoặc gửi quá nhanh. Hãy chờ rồi thử lại."
      : [401, 403].includes(status)
        ? "API key không hợp lệ hoặc chưa có quyền dùng mô hình. Kiểm tra trong Cài đặt."
        : status >= 500
          ? "Dịch vụ AI tạm thời gặp lỗi. Hãy thử lại sau."
          : `Yêu cầu AI chưa thành công (${status}).`;
  }
  return { create, history, errorMessage };
});

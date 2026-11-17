/* KLA v4.1 settings.js */
function downloadJSON(text, name) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function exportData() {
  StudySession.capture();
  downloadJSON(dataStore.export(db), `nolikorea-v5-backup-${today()}.json`);
}
function exportRawData() {
  downloadJSON(dataStore.raw(), `korean-recovery-original-${today()}.json`);
}
async function importData(e) {
  const file = e.target.files[0];
  e.target.value = "";
  if (!file) return;
  try {
    if (file.size > 8 * 1024 * 1024) throw Error("Tệp vượt quá 8 MB.");
    const next = dataStore.parse(await file.text());
    if (
      !confirm(
        "Nhập dữ liệu sẽ thay thế giáo trình và tiến độ hiện tại. Một bản khôi phục sẽ được tạo trước khi nhập. Tiếp tục?",
      )
    )
      return;
    if (replaceData(next, "Trước khi nhập dữ liệu"))
      alert("Đã nhập dữ liệu và lưu bản khôi phục.");
  } catch (err) {
    dataNotice("Tệp chưa được nhập: " + err.message);
  }
}
function restoreData() {
  const info = dataStore.recovery();
  if (!info) {
    alert("Chưa có bản khôi phục.");
    return;
  }
  if (
    !confirm(
      "Khôi phục dữ liệu được lưu lúc " +
        new Date(info.at).toLocaleString("vi-VN") +
        "?",
    )
  )
    return;
  try {
    window.TabSync?.assertWritable();
    db = dataStore.restore();
    nav = { sid: null, bid: null };
    ctx = null;
    closeAll();
    render();
    badge();
    $("dataNotice")?.remove();
    alert("Đã khôi phục dữ liệu.");
  } catch (e) {
    dataNotice(e.message);
  }
}
function resetAllData() {
  if (
    confirm(
      "Xóa giáo trình và tiến độ hiện tại? Ứng dụng sẽ tạo bản khôi phục trước khi xóa.",
    )
  )
    replaceData({ stages: [] }, "Trước khi xóa dữ liệu");
}

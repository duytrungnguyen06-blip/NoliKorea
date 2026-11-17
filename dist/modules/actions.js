/* Delegated actions keep user strings out of inline JavaScript. */
document.addEventListener("click", (e) => {
  const target = e.target.closest(
    "[data-study],[data-speak],[data-practice],[data-choice]",
  );
  if (!target) return;
  if (target.dataset.choice) {
    KoreanRecall.checkChoice(target.dataset.choice, target.dataset.val, target);
    return;
  }
  if (target.dataset.study) {
    const [sid, bid, lid] = target.dataset.study.split("|");
    if (e.target.closest("button")) return;
    openStudyModal(sid, bid, lid);
  } else if (target.dataset.speak !== undefined)
    KoreanVoice.speak(target.dataset.speak);
  else
    KoreanVoice.practiceSentence(
      target.dataset.practice,
      target,
      target.dataset.feedback,
    );
});
document.addEventListener("keydown", (e) => {
  if (["Enter", " "].includes(e.key) && e.target.matches("[data-study]")) {
    e.preventDefault();
    e.target.click();
  }
});

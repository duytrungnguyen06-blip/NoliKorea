const test = require("node:test"),
  assert = require("node:assert/strict");
const { app } = require("./helpers.cjs");
function setup(w) {
  w.__recognizers = [];
  w.SpeechRecognition = class {
    constructor() {
      w.__recognizers.push(this);
    }
    start() {
      this.onstart?.();
    }
    abort() {
      this.onend?.();
    }
  };
}
function open(w) {
  w.LESSON_DIALOGUES.test = [
    {
      title: "Test",
      lines: [
        {
          role: "speaker-a",
          speaker: "A",
          korean: "안녕하세요",
          vi: "Xin chào",
        },
        { role: "speaker-b", speaker: "B", korean: "반가워요", vi: "Rất vui" },
        { role: "speaker-a", speaker: "A", korean: "네", vi: "Vâng" },
      ],
    },
  ];
  w.openRolePlayModal("test", 0);
  w.selectRolePlayCharacter("speaker-a");
}
test("roleplay uses supported STT API, prevents duplicate start and shows permission errors", async () => {
  const a = await app({}, undefined, setup);
  try {
    open(a.w);
    a.w.startRolePlayUserSpeech();
    a.w.startRolePlayUserSpeech();
    assert.equal(a.w.__recognizers.length, 1);
    const rec = a.w.__recognizers[0];
    assert.equal(rec.lang, "ko-KR");
    rec.onerror({ error: "not-allowed" });
    assert.match(
      a.w.document.getElementById("rolePlaySpeechFeedback").textContent,
      /quyền mic/,
    );
    assert.ok(
      !a.w.document
        .getElementById("rolePlayMicBtn")
        .classList.contains("recording"),
    );
    a.w.startRolePlayUserSpeech();
    assert.equal(a.w.__recognizers.length, 2);
    const second = a.w.__recognizers[1];
    second.onend();
    assert.match(
      a.w.document.getElementById("rolePlaySpeechFeedback").textContent,
      /Chưa nhận được/,
    );
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});
test("close/reopen ignores stale speech callbacks and next-turn timers", async () => {
  const a = await app({}, undefined, setup);
  try {
    open(a.w);
    a.w.startRolePlayUserSpeech();
    const old = a.w.__recognizers[0].onresult;
    old({ results: [[{ transcript: "안녕하세요" }]] });
    assert.equal(a.w._rolePlayState.scores[0], 100);
    a.w.closeRolePlayModal();
    open(a.w);
    old({ results: [[{ transcript: "안녕하세요" }]] });
    await new Promise((r) => setTimeout(r, 1450));
    assert.equal(a.w._rolePlayState.currentLineIdx, 0);
    assert.equal(a.w._rolePlayState.scores.length, 0);
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});
test("speech callbacks are retired after end, unsupported and failed starts complete visibly", async () => {
  const a = await app({}, undefined, setup);
  try {
    let results = 0,
      ends = 0;
    const stt = a.w.KoreanVoice.stt;
    await stt.startRecognition({
      onResult: () => results++,
      onEnd: () => ends++,
    });
    const rec = a.w.__recognizers[0],
      late = rec.onresult;
    rec.onend();
    late({ results: [[{ transcript: "네" }]] });
    assert.equal(results, 0);
    assert.equal(ends, 1);
    let code;
    stt.recognitionClass = null;
    await stt.startRecognition({
      onError: (m, c) => (code = c),
      onEnd: () => ends++,
    });
    assert.equal(code, "unsupported");
    assert.equal(ends, 2);
    stt.recognitionClass = class {
      start() {
        throw Error("start failed");
      }
      abort() {}
    };
    await stt.startRecognition({ onError: (m, c) => (code = c) });
    assert.equal(code, "start-failed");
    assert.equal(stt.isBusy, false);
  } finally {
    a.close();
  }
});
test("CD panel, floating player and shortcuts stay within Input; tab change pauses CD", async () => {
  const a = await app();
  try {
    const w = a.w;
    w.openStudyModal("s1", "b1a", "l_snu1a_01");
    assert.ok(
      w.document
        .getElementById("inputTab")
        .contains(w.document.getElementById("nativeAudioPanel")),
    );
    let pauses = 0,
      toggles = 0;
    w.KoreanVoice.nativeAudio.pause = () => pauses++;
    w.toggleNativeAudioPlay = () => toggles++;
    a.eval('activeNativeAudioTrack={id:"test"}');
    w.document.getElementById("nativeAudioPanel").getBoundingClientRect =
      () => ({ bottom: -1 });
    w.checkFloatingAudioVisibility();
    assert.ok(
      !w.document
        .getElementById("floatingAudioPlayer")
        .classList.contains("hidden"),
    );
    for (const tab of ["recall", "production"]) {
      w.switchStudyTab(tab);
      assert.ok(
        w.document
          .getElementById("floatingAudioPlayer")
          .classList.contains("hidden"),
      );
      assert.ok(
        !w.document.getElementById("inputTab").classList.contains("active"),
      );
      w.dispatchEvent(new w.KeyboardEvent("keydown", { code: "Space" }));
    }
    assert.equal(pauses, 2);
    assert.equal(toggles, 0);
    w.switchStudyTab("input");
    assert.ok(
      w.document.getElementById("inputTab").classList.contains("active"),
    );
    assert.deepEqual(a.errors, []);
  } finally {
    a.close();
  }
});
test("listening to a roleplay sample releases mic and ignores its late result", async () => {
  const a = await app({}, undefined, setup);
  try {
    open(a.w);
    a.w.startRolePlayUserSpeech();
    const result = a.w.__recognizers[0].onresult;
    a.w.KoreanVoice.speak = () => {};
    a.w.document.querySelector("#rolePlayModal [data-speak]").click();
    result({ results: [[{ transcript: "안녕하세요" }]] });
    assert.equal(a.w.KoreanVoice.stt.isBusy, false);
    assert.ok(
      !a.w.document
        .getElementById("rolePlayMicBtn")
        .classList.contains("recording"),
    );
    assert.equal(a.w._rolePlayState.scores.length, 0);
  } finally {
    a.close();
  }
});
test("partner waits for speech end and contributes no invented microphone score", async () => {
  const a = await app({}, undefined, setup);
  try {
    open(a.w);
    let callbacks;
    a.w.KoreanVoice.tts.isSupported = () => true;
    a.w.KoreanVoice.speak = (text, options) => (callbacks = options);
    a.w.selectRolePlayCharacter("speaker-b");
    await new Promise((r) => setTimeout(r, 550));
    assert.ok(callbacks);
    assert.equal(a.w._rolePlayState.currentLineIdx, 0);
    callbacks.onEnd();
    assert.equal(a.w._rolePlayState.currentLineIdx, 1);
    assert.equal(a.w._rolePlayState.scores.length, 0);
    a.w.closeRolePlayModal();
    callbacks.onEnd();
    assert.equal(a.w._rolePlayState.currentLineIdx, 1);
  } finally {
    a.close();
  }
});

const { app } = require("../tests/helpers.cjs");
const { performance } = require("node:perf_hooks");
(async () => {
  const samples = [];
  for (let i = 0; i < 3; i++) {
    const start = performance.now(),
      a = await app();
    const loaded = performance.now();
    const open = performance.now();
    a.w.openStudyModal("s1", "b1a", "l_snu1a_01");
    const opened = performance.now();
    samples.push({
      initMs: loaded - start,
      openMs: opened - open,
      exerciseNodes: a.w.document.querySelectorAll(".recall-card,.prod-card")
        .length,
      domNodes: a.w.document.querySelectorAll("*").length,
    });
    a.close();
  }
  const median = (k) => samples.map((s) => s[k]).sort((a, b) => a - b)[1];
  console.log(
    JSON.stringify(
      {
        environment: "Node.js + jsdom; not a real-device/browser benchmark",
        samples,
        median: {
          initMs: median("initMs"),
          openMs: median("openMs"),
          exerciseNodes: median("exerciseNodes"),
          domNodes: median("domNodes"),
        },
      },
      null,
      2,
    ),
  );
})();

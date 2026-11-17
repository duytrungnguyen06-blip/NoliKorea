const test = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  vm = require("node:vm"),
  postcss = require("postcss");
const root = path.join(__dirname, "../dist");
test("HTML scripts/styles and SW precache exist, CSS parses", () => {
  const html = fs.readFileSync(root + "/index.html", "utf8");
  for (const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (!/^https?:|^blob:/.test(m[1]))
      assert.ok(fs.existsSync(path.join(root, m[1])), m[1]);
  }
  const sw = fs.readFileSync(root + "/sw.js", "utf8"),
    assets = sw.match(/const ASSETS = (\[[\s\S]*?\]);/)[1];
  for (const file of vm.runInNewContext(assets))
    assert.ok(fs.existsSync(path.join(root, file)), file);
  postcss.parse(fs.readFileSync(root + "/styles.css", "utf8"));
  assert.ok(!html.includes("components.css"));
});
test("89 audio assets retained and no new offline audio manager introduced", () => {
  assert.equal(
    fs.readdirSync(root + "/audio/snu1a").filter((x) => x.endsWith(".mp3"))
      .length,
    89,
  );
  const sw = fs.readFileSync(root + "/sw.js", "utf8");
  assert.ok(!/\.\/audio\/snu1a\/track/.test(sw));
});
test("service worker waits for explicit activation and only removes owned obsolete caches", async () => {
  const handlers = {},
    removed = [];
  let skip = 0;
  const ctx = {
    self: {
      addEventListener: (name, fn) => (handlers[name] = fn),
      skipWaiting: () => skip++,
      clients: { claim() {} },
    },
    caches: {
      keys: async () => [
        "unrelated",
        "kla-v4-seoul-glass-1",
        "kla-v4.1-reliable-1",
        "kla-v3-audio-cache-v1",
      ],
      delete: async (key) => removed.push(key),
      open: async () => ({ addAll: async () => {} }),
    },
  };
  vm.runInNewContext(fs.readFileSync(root + "/sw.js", "utf8"), ctx);
  let pending;
  handlers.install({ waitUntil: (p) => (pending = p) });
  await pending;
  assert.equal(skip, 0);
  handlers.message({ data: { type: "ACTIVATE_UPDATE" } });
  assert.equal(skip, 1);
  handlers.activate({ waitUntil: (p) => (pending = p) });
  await pending;
  assert.deepEqual(removed, ["kla-v4-seoul-glass-1", "kla-v4.1-reliable-1"]);
});

const test = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs");
const Store = require("../dist/modules/data-store.js"),
  S = require("../dist/modules/scheduler.js");
const base = JSON.parse(fs.readFileSync("dist/curriculum.json"));
class Memory {
  constructor() {
    this.m = new Map();
    this.fail = null;
  }
  getItem(k) {
    return this.m.get(k) ?? null;
  }
  setItem(k, v) {
    if (this.fail === k) throw Error("QuotaExceededError");
    this.m.set(k, v);
  }
}
test("legacy migration, overrides, progress, export/import round trip", () => {
  const mem = new Memory(),
    legacy = structuredClone(base);
  legacy.stages[0].books[0].lessons[0].items[0].korean = 'Edited "quote"';
  legacy.stages[0].books[0].lessons[0].level = 3;
  mem.setItem(Store.LEGACY, JSON.stringify(legacy));
  const db = Store.create(mem, base).read();
  assert.equal(db.stages[0].books[0].lessons[0].level, 3);
  assert.equal(mem.getItem(Store.LEGACY), JSON.stringify(legacy));
  assert.ok(mem.getItem(Store.BACKUP));
  const packed = Store.pack(db, base);
  assert.ok(Object.keys(packed.customizations.overrides).length === 1);
  assert.equal(
    packed.progress.lessons[Store.path("s1", "b1a", "l_snu1a_01")].level,
    3,
  );
  assert.deepEqual(Store.parse(JSON.stringify(packed), base), db);
});
test("malformed import, unsupported version and unsafe fields leave existing storage intact", () => {
  const m = new Memory(),
    store = Store.create(m, base);
  store.read();
  const before = m.getItem(Store.KEY);
  for (const raw of [
    '{"stages":[{}]}',
    '{"schemaVersion":99}',
    '{"stages":[],"__proto__":{}}',
    '{"stages":[],"streak":{"count":"x","history":[]}}',
  ])
    assert.throws(() => store.parse(raw));
  assert.equal(m.getItem(Store.KEY), before);
});
test("replacement and reset have recoverable previous snapshot", () => {
  const m = new Memory(),
    s = Store.create(m, base);
  const original = s.read();
  s.replace({ stages: [] }, "reset");
  assert.deepEqual(s.read().stages, []);
  assert.deepEqual(s.restore(), original);
});
test("write failure preserves old state and recovery before replacement", () => {
  const m = new Memory(),
    s = Store.create(m, base);
  s.read();
  const before = m.getItem(Store.KEY);
  m.fail = Store.KEY;
  assert.throws(() => s.replace({ stages: [] }, "import"));
  assert.equal(m.getItem(Store.KEY), before);
  assert.ok(m.getItem(Store.BACKUP));
  m.fail = Store.BACKUP;
  assert.throws(() => s.replace({ stages: [] }, "reset"));
  assert.equal(m.getItem(Store.KEY), before);
});
test("corrupt primary is never overwritten by defaults or normal save", () => {
  const m = new Memory();
  m.setItem(Store.KEY, "broken");
  const s = Store.create(m, base);
  assert.throws(() => s.read());
  assert.throws(() => s.save(base));
  assert.equal(m.getItem(Store.KEY), "broken");
});
test("again is due at ten minutes, not nine; legacy day reviews stay compatible", () => {
  const now = Date.parse("2026-11-16T18:58:00Z"),
    l = S.schedule({ level: 2 }, "again", now);
  assert.equal(Date.parse(l.nextReviewAt) - now, 600000);
  assert.equal(S.due(l, now + 540000), false);
  assert.equal(S.due(l, now + 600000), true);
  assert.equal(
    S.due({ studied: true, nextReview: S.localDate(new Date(now)) }, now),
    true,
  );
});
test("Vietnam midnight and streak boundary", () => {
  const old = process.env.TZ;
  process.env.TZ = "Asia/Ho_Chi_Minh";
  const a = Date.parse("2026-11-16T16:59:00Z"),
    b = Date.parse("2026-11-16T17:01:00Z");
  assert.equal(S.localDate(new Date(a)), "2026-11-16");
  assert.equal(S.localDate(new Date(b)), "2026-11-17");
  const first = S.streak(null, a);
  assert.equal(S.streak(first, a).count, 1);
  assert.equal(S.streak(first, b).count, 2);
  process.env.TZ = old;
});
test("item review retains identity, prioritizes forgotten item and schedules next recall", () => {
  const i = { sid: "s1", bid: "b1a", lid: "l1", korean: "안녕", vi: "Chào" },
    now = 100000;
  let r = S.recordItem(null, i, "again", now);
  assert.equal(r.dueAt, now + 600000);
  assert.equal(r.lapses, 1);
  r = S.recordItem(r, i, "good", now + 600000);
  assert.equal(r.level, 1);
  assert.ok(r.dueAt > now + 600000);
  assert.equal(
    S.itemKey("s1", "b1a", "l1", i),
    S.itemKey("s1", "b1a", "l1", { ...i }),
  );
});

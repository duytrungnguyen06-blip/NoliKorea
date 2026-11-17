/* Atomic, versioned storage. The bundled curriculum is immutable; only overrides and progress are persisted. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.KLAStore = api;
})(globalThis, () => {
  const KEY = "kla_v4_data",
    BACKUP = "kla_v4_recovery",
    LEGACY = "koreanV2",
    VERSION = 1;
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const stateFields = [
    "studied",
    "level",
    "lastStudied",
    "nextReview",
    "nextReviewAt",
    "inProgress",
    "lastOpenedAt",
    "session",
    "lastCompletedAt",
  ];
  const path = (s, b, l) => JSON.stringify([s, b, l]);
  function fail(message) {
    throw new Error(message);
  }
  function safe(x, depth = 0) {
    if (depth > 35) fail("Dữ liệu lồng quá nhiều cấp.");
    if (x && typeof x === "object") {
      for (const k of Object.keys(x)) {
        if (["__proto__", "constructor", "prototype"].includes(k))
          fail("Dữ liệu chứa trường không được hỗ trợ.");
        safe(x[k], depth + 1);
      }
    }
  }
  function object(x, name) {
    if (!x || typeof x !== "object" || Array.isArray(x))
      fail(name + " không hợp lệ.");
  }
  function arr(x, name) {
    if (!Array.isArray(x)) fail(name + " phải là danh sách.");
  }
  function str(x, name) {
    if (typeof x !== "string") fail(name + " phải là văn bản.");
  }
  function id(x) {
    if (typeof x !== "string" || !/^[\w.-]{1,160}$/.test(x))
      fail("Mã mục học không hợp lệ.");
  }
  function unique(xs) {
    const ids = new Set();
    for (const x of xs) {
      object(x, "Mục");
      id(x.id);
      if (ids.has(x.id)) fail("Mã mục học bị trùng: " + x.id);
      ids.add(x.id);
    }
  }
  function validate(input) {
    safe(input);
    object(input, "Dữ liệu");
    arr(input.stages, "stages");
    if (input.stages.length > 100) fail("Quá nhiều giai đoạn.");
    unique(input.stages);
    const data = clone(input);
    let count = 0;
    for (const s of data.stages) {
      str(s.name, "Tên giai đoạn");
      if (s.desc != null) str(s.desc, "Mô tả");
      arr(s.books, "books");
      unique(s.books);
      for (const b of s.books) {
        str(b.name, "Tên quyển");
        if (b.desc != null) str(b.desc, "Mô tả");
        arr(b.lessons, "lessons");
        unique(b.lessons);
        for (const l of b.lessons) {
          str(l.title, "Tên bài");
          if (++count > 10000) fail("Quá nhiều bài học.");
          for (const k of [
            "content",
            "translation",
            "translationEn",
            "situations",
            "examples",
            "notes",
          ])
            if (l[k] != null) str(l[k], k);
          if (!l.items) {
            const ko = (l.content || "").split("\n"),
              vi = (l.translation || "").split("\n"),
              en = (l.translationEn || "").split("\n");
            l.items =
              ko.some(Boolean) || vi.some(Boolean)
                ? Array.from(
                    { length: Math.max(ko.length, vi.length, en.length) },
                    (_, i) => ({
                      korean: ko[i] || "",
                      vi: vi[i] || "",
                      en: en[i] || "",
                    }),
                  )
                : [];
          }
          arr(l.items, "items");
          l.items.forEach((item,n)=>{if(!item.id)item.id=l.id+"-item-"+(n+1);id(item.id);});
          unique(l.items);
          if (l.items.length > 5000) fail("Quá nhiều mục trong một bài.");
          for (const item of l.items) {
            object(item, "Mục học");
            for (const k of ["korean", "vi", "en"]) {
              if (item[k] == null) item[k] = "";
              str(item[k], k);
            }
          }
          for (const item of l.items)
            if (item.acceptedAnswers != null) {
              arr(item.acceptedAnswers, "Đáp án tương đương");
              item.acceptedAnswers.forEach((v) => str(v, "Đáp án"));
            }
          if (
            l.level != null &&
            (!Number.isInteger(l.level) || l.level < 0 || l.level > 100000)
          )
            fail("Cấp độ ôn không hợp lệ.");
          for (const k of ["studied", "inProgress"])
            if (l[k] != null && typeof l[k] !== "boolean")
              fail(k + " không hợp lệ.");
          for (const k of ["lastStudied", "nextReview"])
            if (
              l[k] != null &&
              (!/^\d{4}-\d{2}-\d{2}$/.test(l[k]) ||
                !Number.isFinite(Date.parse(l[k])))
            )
              fail("Ngày học không hợp lệ.");
          if (
            l.nextReviewAt != null &&
            !Number.isFinite(Date.parse(l.nextReviewAt))
          )
            fail("Thời điểm ôn không hợp lệ.");
          if (l.session != null) {
            object(l.session, "Phiên học");
            if (!["input", "recall", "production"].includes(l.session.tab))
              fail("Tab phiên học không hợp lệ.");
            if (!Number.isFinite(l.session.scroll) || l.session.scroll < 0)
              fail("Vị trí học không hợp lệ.");
            for (const k of ["recall", "production"])
              if (l.session[k] != null) {
                object(l.session[k], "Bài luyện");
                arr(l.session[k].exercises, "Bài luyện");
                for (const ex of l.session[k].exercises) {
                  object(ex, "Bài luyện");
                  id(ex.id);
                  str(ex.type, "Loại bài luyện");
                  for (const field of [
                    "prompt",
                    "correct",
                    "sample",
                    "koreanAudio",
                    "userAnswer",
                  ])
                    if (ex[field] != null) str(ex[field], field);
                  for (const field of ["options", "tokens", "keywords"])
                    if (ex[field] != null) {
                      arr(ex[field], field);
                      ex[field].forEach((v) => str(v, field));
                    }
                  if (
                    ex.state != null &&
                    !["unanswered", "correct", "wrong"].includes(ex.state)
                  )
                    fail("Trạng thái bài luyện không hợp lệ.");
                  if (ex.selectedIndices != null) {
                    arr(ex.selectedIndices, "Thẻ đã chọn");
                    if (
                      ex.selectedIndices.some(
                        (i) =>
                          !Number.isInteger(i) ||
                          i < 0 ||
                          i >= (ex.tokens?.length || 0),
                      )
                    )
                      fail("Thẻ đã chọn không hợp lệ.");
                  }
                  if (ex.evaluation != null) {
                    object(ex.evaluation, "Đánh giá");
                    arr(ex.evaluation.matchedKw, "Từ khóa");
                    arr(ex.evaluation.guardTips, "Gợi ý");
                  }
                }
                if (l.session.drafts != null) {
                  object(l.session.drafts, "Bản nháp");
                  Object.values(l.session.drafts).forEach((v) =>
                    str(v, "Bản nháp"),
                  );
                }
              }
          }
        }
      }
    }
    if (data.streak == null)
      data.streak = { count: 0, lastDate: null, history: [] };
    object(data.streak, "Chuỗi ngày");
    arr(data.streak.history, "Lịch sử ngày");
    if (!Number.isInteger(data.streak.count) || data.streak.count < 0)
      fail("Chuỗi ngày không hợp lệ.");
    for (const d of data.streak.history)
      if (typeof d !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(d))
        fail("Ngày trong lịch sử không hợp lệ.");
    if (data.mistakes == null) data.mistakes = [];
    arr(data.mistakes, "Sổ lỗi");
    unique(data.mistakes);
    for (const m of data.mistakes) {
      str(m.korean, "Câu trong sổ lỗi");
      for (const k of ["vi", "reason", "lessonTitle", "lessonId"])
        if (m[k] != null) str(m[k], k);
    }
    if (data.itemReviews == null) data.itemReviews = {};
    object(data.itemReviews, "Lịch ôn từng mục");
    for (const it of Object.values(data.itemReviews)) {
      object(it, "Lịch ôn");
      for (const k of ["korean", "vi", "sid", "bid", "lid"]) str(it[k], k);
      if (
        !Number.isFinite(it.dueAt) ||
        !Number.isInteger(it.level) ||
        it.level < 0 ||
        !Number.isInteger(it.lapses) ||
        it.lapses < 0
      )
        fail("Lịch ôn từng mục không hợp lệ.");
    }
    if (data.contentFlags != null) {
      arr(data.contentFlags, "Nội dung cần xem lại");
      unique(data.contentFlags);
      for (const f of data.contentFlags) {
        for (const k of ["korean", "vi", "note", "sid", "bid", "lid"])
          str(f[k], k);
        if (typeof f.resolved !== "boolean" || !Number.isFinite(f.createdAt))
          fail("Ghi chú nội dung không hợp lệ.");
      }
    }
    if (data.dailyPractice != null) {
      const p = data.dailyPractice;
      object(p, "Phiên ngắn");
      arr(p.seen, "Mục đã gặp");
      p.seen.forEach((v) => str(v, "Mục đã gặp"));
      arr(p.history, "Lịch sử phiên");
      const s = p.active;
      if (s != null) {
        object(s, "Phiên đang học");
        id(s.id);
        if (!Number.isFinite(s.startedAt) || typeof s.finished !== "boolean")
          fail("Phiên ngắn không hợp lệ.");
        arr(s.cards, "Câu hỏi");
        if (!s.cards.length || s.cards.length > 8)
          fail("Số câu hỏi không hợp lệ.");
        const result = (x) => {
          if (x != null) {
            object(x, "Kết quả");
            str(x.value, "Đáp án");
            if (
              typeof x.correct !== "boolean" ||
              typeof x.revealed !== "boolean"
            )
              fail("Kết quả không hợp lệ.");
          }
        };
        for (const c of s.cards) {
          object(c, "Câu hỏi");
          for (const k of ["korean", "vi", "sid", "bid", "lid", "typed"])
            str(c[k], k);
          if (!["choice", "typing"].includes(c.mode))
            fail("Dạng câu hỏi không hợp lệ.");
          arr(c.options, "Lựa chọn");
          c.options.forEach((v) => str(v, "Lựa chọn"));
          if (c.acceptedAnswers) {
            arr(c.acceptedAnswers, "Đáp án");
            c.acceptedAnswers.forEach((v) => str(v, "Đáp án"));
          }
          result(c.first);
          result(c.retry);
        }
        if (
          !["recall", "retry", "production"].includes(s.stage) ||
          !Number.isInteger(s.index) ||
          s.index < 0 ||
          s.index > s.cards.length
        )
          fail("Vị trí phiên không hợp lệ.");
        arr(s.production, "Tự viết");
        if (s.production.length > 2) fail("Quá nhiều câu tự viết.");
        s.production.forEach((x) => {
          object(x, "Tình huống");
          str(x.prompt, "Tình huống");
          str(x.sample, "Mẫu");
        });
        arr(s.writing, "Bản nháp");
        s.writing.forEach((x) => {
          object(x, "Bản nháp");
          str(x.text, "Bản nháp");
          if (typeof x.viewed !== "boolean" || typeof x.submitted !== "boolean")
            fail("Bản nháp không hợp lệ.");
        });
        if (
          !Number.isInteger(s.productionIndex) ||
          s.productionIndex < 0 ||
          s.productionIndex > s.production.length
        )
          fail("Vị trí tự viết không hợp lệ.");
        if (s.stage === "retry") {
          arr(s.retryQueue, "Lượt luyện lại");
          if (
            !s.retryQueue.length ||
            s.retryQueue.some(
              (i) => !Number.isInteger(i) || i < 0 || i >= s.cards.length,
            ) ||
            !Number.isInteger(s.retryIndex) ||
            s.retryIndex < 0 ||
            s.retryIndex >= s.retryQueue.length
          )
            fail("Lượt luyện lại không hợp lệ.");
        }
        if (
          !s.finished &&
          ((s.stage === "recall" && s.index === s.cards.length) ||
            (s.stage === "production" &&
              s.productionIndex === s.production.length))
        )
          fail("Phiên ngắn bị thiếu bước.");
      }
    }
    for(const [oldKey,record] of Object.entries(data.itemReviews)){
      const item=data.stages.find(s=>s.id===record.sid)?.books.find(b=>b.id===record.bid)?.lessons.find(l=>l.id===record.lid)?.items.find(i=>record.itemId?i.id===record.itemId:i.korean===record.korean&&i.vi===record.vi);
      if(item){record.itemId=item.id;record.korean=item.korean;record.vi=item.vi;const key=JSON.stringify([record.sid,record.bid,record.lid,item.id]);if(key!==oldKey){if(!data.itemReviews[key])data.itemReviews[key]=record;delete data.itemReviews[oldKey];}}
    }
    return data;
  }
  const baseIndexes = new WeakMap();
  function baseMap(base) {
    if (baseIndexes.has(base)) return baseIndexes.get(base);
    const map = {};
    for (const s of base.stages)
      for (const b of s.books)
        for (const l of b.lessons) map[path(s.id, b.id, l.id)] = l;
    baseIndexes.set(base, map);
    return map;
  }
  function pack(input, base) {
    const data = validate(input),
      original = baseMap(base),
      overrides = {},
      lessons = {};
    const stages = data.stages.map((s) => ({
      ...s,
      books: s.books.map((b) => ({
        ...b,
        lessons: b.lessons.map((l) => {
          const key = path(s.id, b.id, l.id);
          const content = {},
            state = {};
          for (const [k, v] of Object.entries(l))
            (stateFields.includes(k) ? state : content)[k] = v;
          const diff = {};
          for (const [k, v] of Object.entries(content))
            if (JSON.stringify(v) !== JSON.stringify(original[key]?.[k]))
              diff[k] = v;
          if (Object.keys(diff).length) overrides[key] = diff;
          lessons[key] = state;
          return { id: l.id };
        }),
      })),
    }));
    const extra = {};
    for (const [k, v] of Object.entries(data))
      if (!["stages", "streak", "mistakes", "itemReviews"].includes(k))
        extra[k] = v;
    return {
      schemaVersion: VERSION,
      curriculumVersion: "snu1a-v2",
      customizations: { stages, overrides },
      progress: { lessons, items: data.itemReviews, streak: data.streak },
      mistakes: data.mistakes,
      extra,
    };
  }
  const corrections = [
    {
      sid: "s1",
      bid: "b1a",
      lid: "b1a_l3",
      korean: "읽다",
      old: "Đọc (phát âm [익따], chia đuôi [일거요])",
      new: "Đọc (읽다 [익따]; dạng lịch sự: 읽어요 [일거요])",
    },
    {
      sid: "s1",
      bid: "b1a",
      lid: "b1a_l6",
      korean: "불고기",
      old: "Thịt bò xào tẩm sốt đậm đà (Bulgogi)",
      new: "Thịt bò ướp gia vị, nướng hoặc áp chảo (Bulgogi)",
    },
    {
      sid: "s1",
      bid: "b1a",
      lid: "b1a_l7",
      korean: "사계절",
      old: "Bốn mùa, tứ quý (봄, 여름, 가을, 겨울)",
      new: "Bốn mùa (봄, 여름, 가을, 겨울)",
    },
    {
      sid: "s1",
      bid: "b1a",
      lid: "b1a_l8",
      korean: "테니스",
      old: "Môn quần vợt, khúc côn cầu lưới (tennis)",
      new: "Môn quần vợt (tennis)",
    },
  ];
  function migrateReviews(data) {
    if (!data.itemReviews) return data;
    for (const c of corrections) {
      const item = data.stages
        .find((s) => s.id === c.sid)
        ?.books.find((b) => b.id === c.bid)
        ?.lessons.find((l) => l.id === c.lid)
        ?.items.find((i) => i.korean === c.korean && i.vi === c.new);
      if (!item) continue;
      const old = JSON.stringify([c.sid, c.bid, c.lid, c.korean, c.old]),
        key = JSON.stringify([c.sid, c.bid, c.lid, c.korean, c.new]);
      if (data.itemReviews[old] && !data.itemReviews[key]) {
        data.itemReviews[key] = { ...data.itemReviews[old], vi: c.new };
        delete data.itemReviews[old];
      }
    }
    return data;
  }
  function unpack(input, base) {
    safe(input);
    if (input.schemaVersion === undefined) return validate(input);
    if (input.schemaVersion !== VERSION)
      fail("Phiên bản dữ liệu chưa được hỗ trợ.");
    object(input.customizations, "Nội dung tùy chỉnh");
    object(input.customizations.overrides, "Nội dung sửa");
    arr(input.customizations.stages, "Giai đoạn");
    object(input.progress, "Tiến độ");
    object(input.progress.lessons, "Tiến độ bài");
    const original = baseMap(base);
    const data = {
      ...input.extra,
      stages: input.customizations.stages.map((s) => ({
        ...s,
        books: s.books.map((b) => ({
          ...b,
          lessons: b.lessons.map((ref) => {
            const key = path(s.id, b.id, ref.id);
            return {
              ...clone(original[key] || {}),
              ...input.customizations.overrides[key],
              ...input.progress.lessons[key],
              id: ref.id,
            };
          }),
        })),
      })),
      streak: input.progress.streak,
      mistakes: input.mistakes,
      itemReviews: input.progress.items,
    };
    return validate(migrateReviews(data));
  }
  function parse(raw, base) {
    if (typeof raw !== "string" || raw.length > 8 * 1024 * 1024)
      fail("Tệp dữ liệu quá lớn hoặc không hợp lệ.");
    return unpack(JSON.parse(raw.replace(/^\uFEFF/, "")), base);
  }
  function create(storage, base) {
    let blocked = false;
    let committed = null;
    let observed = storage.getItem(KEY);
    let lastInput = null;
    function assertCurrent() {
      if (storage.getItem(KEY) !== observed) {
        const error = new Error(
          "Dữ liệu đã thay đổi ở tab khác. Xuất thay đổi hiện tại hoặc nạp bản mới trước khi lưu.",
        );
        error.code = "STALE_DATA";
        throw error;
      }
    }
    function snapshot(reason) {
      assertCurrent();
      const raw = storage.getItem(KEY),
        legacy = storage.getItem(LEGACY);
      storage.setItem(
        BACKUP,
        JSON.stringify({ at: new Date().toISOString(), reason, raw, legacy }),
      );
    }
    function read() {
      try {
        const raw = storage.getItem(KEY),
          old = storage.getItem(LEGACY);
        const data =
          raw !== null
            ? parse(raw, base)
            : old !== null
              ? parse(old, base)
              : validate(base);
        if (raw === null) {
          if (old !== null) snapshot("Chuyển dữ liệu V3/V4");
          storage.setItem(KEY, JSON.stringify(pack(data, base)));
        }
        observed = storage.getItem(KEY);
        committed = clone(data);
        lastInput = JSON.stringify(data);
        blocked = false;
        return data;
      } catch (e) {
        blocked = true;
        throw e;
      }
    }
    function save(data) {
      if (blocked)
        fail(
          "Dữ liệu đang được bảo vệ. Hãy nhập bản sao hợp lệ hoặc khôi phục trong Cài đặt.",
        );
      assertCurrent();
      const input = JSON.stringify(data);
      if (input === lastInput) return clone(committed);
      const valid = validate(data);
      const encoded = JSON.stringify(pack(valid, base));
      assertCurrent();
      storage.setItem(KEY, encoded);
      observed = encoded;
      lastInput = JSON.stringify(valid);
      committed = clone(valid);
      return valid;
    }
    function replace(data, reason) {
      assertCurrent();
      const valid = validate(data),
        raw = JSON.stringify(pack(valid, base));
      snapshot(reason);
      assertCurrent();
      storage.setItem(KEY, raw);
      observed = raw;
      lastInput = JSON.stringify(valid);
      committed = clone(valid);
      blocked = false;
      return valid;
    }
    function restore() {
      const back = JSON.parse(storage.getItem(BACKUP) || "null");
      if (!back) fail("Chưa có bản khôi phục.");
      const data = parse(back.raw ?? back.legacy ?? JSON.stringify(base), base);
      return replace(data, "Trước khi khôi phục");
    }
    return {
      read,
      save,
      replace,
      restore,
      snapshot,
      hasExternalChange: () => storage.getItem(KEY) !== observed,
      parse: (raw) => parse(raw, base),
      export: (data) => JSON.stringify(pack(data, base), null, 2),
      lastGood: () => committed && clone(committed),
      recovery: () => JSON.parse(storage.getItem(BACKUP) || "null"),
      raw: () => storage.getItem(KEY) ?? storage.getItem(LEGACY) ?? "",
      isBlocked: () => blocked,
    };
  }
  return {
    KEY,
    BACKUP,
    LEGACY,
    VERSION,
    validate,
    pack,
    unpack,
    parse,
    create,
    path,
  };
});

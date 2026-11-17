/* Pedagogical helpers shared by full lessons and short sessions. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.KLALearning = api;
})(globalThis, () => {
  const normalize = (s) =>
    String(s || "")
      .normalize("NFC")
      .replace(/[\s.,?!~·:;'"()\[\]{}]+/g, "")
      .trim();
  const category = (item) => {
    const k = item.korean || "",
      v = item.vi || "";
    if (/Số Hán-Hàn/i.test(v)) return "number-sino";
    if (/Số thuần Hàn/i.test(v)) return "number-native";
    if (/요일$/.test(k)) return "weekday";
    if (/^(봄|여름|가을|겨울)$/.test(k)) return "season";
    if (/^(앞|뒤|옆|안|밖|위|아래|사이|오른쪽|왼쪽)$/.test(k))
      return "position";
    if (/^(개|병|잔|그릇)$/.test(k)) return "counter";
    if (/사람/.test(k)) return "nationality";
    if (/선생님|학생|의사|기자|직업/.test(k)) return "occupation";
    if (/안녕|반가|반갑/.test(k)) return "greeting";
    if (
      /^(어제|오늘|내일|지금|지난주|이번 주|다음 주|주말|평일|언제|며칠)$/.test(
        k,
      )
    )
      return "time";
    if (
      /^(공항|우체국|대사관|은행|가게|약국|병원|미용실|서점|빵집|화장실|극장|백화점|기숙사|찻집|식당|도서관|집|시장|공원|커피숍|학교|회사|노래방|PC방)$/.test(
        k,
      )
    )
      return "place";
    if (/^(비빔밥|불고기|갈비탕|김치찌개|냉면|라면|김밥|돈가스|식혜)$/.test(k))
      return "food";
    if (/^(사과|오렌지|딸기|수박)$/.test(k)) return "fruit";
    if (
      /^(따뜻하다|덥다|시원하다|춥다|맑다|흐리다|비가 오다|눈이 오다|바람이 불다)$/.test(
        k,
      )
    )
      return "weather";
    if (/다$/.test(k)) return "predicate";
    if (/[?？]$/.test(k)) return "question";
    if (/[.!]$/.test(k)) return "sentence";
    if (/^(이거|그거|저거|여기|어디|무엇)/.test(k)) return "demonstrative";
    return "noun";
  };
  function answers(item) {
    return [
      ...new Set(
        [item.korean, ...(item.acceptedAnswers || [])].filter(Boolean),
      ),
    ];
  }
  function isAnswer(text, item) {
    return answers(item).some((x) => normalize(x) === normalize(text));
  }
  function variants(sample) {
    const list = [sample];
    if (sample.startsWith("저는 ")) list.push("전 " + sample.slice(3));
    if (sample.startsWith("전 ")) list.push("저는 " + sample.slice(2));
    return list;
  }
  function distractors(item, pool, field = "vi", count = 3) {
    const unique = new Map();
    for (const it of pool) {
      if (
        it.korean === item.korean ||
        normalize(it[field]) === normalize(item[field])
      )
        continue;
      const key = normalize(it[field]);
      if (!key || unique.has(key)) continue;
      unique.set(key, it);
    }
    return [...unique.values()]
      .sort(
        (a, b) =>
          Number(category(b) === category(item)) -
          Number(category(a) === category(item)),
      )
      .slice(0, count)
      .map((it) => it[field]);
  }
  function explain(item, selected, pool, field = "vi") {
    const other = pool.find((x) => x[field] === selected);
    return other
      ? `“${other.korean}” nghĩa là “${other.vi}”. Ở câu này, “${item.korean}” là “${item.vi}”.`
      : `“${item.korean}” nghĩa là “${item.vi}”. Hãy chú ý từ khóa rồi thử nhớ lại ở lượt sau.`;
  }
  function flatten(db) {
    return db.stages.flatMap((s) =>
      s.books.flatMap((b) =>
        b.lessons.flatMap((l) =>
          (l.items || [])
            .filter((i) => i.korean && i.vi)
            .map((item) => ({
              ...item,
              sid: s.id,
              bid: b.id,
              lid: l.id,
              lessonTitle: l.title,
            })),
        ),
      ),
    );
  }
  const key = (i) => JSON.stringify(i.id||i.itemId?[i.sid,i.bid,i.lid,i.id||i.itemId]:[i.sid,i.bid,i.lid,i.korean,i.vi]);
  function queue(db, now = Date.now(), limit = 8) {
    const all = flatten(db),
      records = db.itemReviews || {},
      seen = new Set(db.dailyPractice?.seen || []),
      picked = [],
      used = new Set();
    const add = (item, reason) => {
      const word = normalize(item.korean);
      if (!used.has(word) && picked.length < limit) {
        picked.push({ ...item, reason });
        used.add(word);
      }
    };
    const due = all
      .filter((i) => records[key(i)]?.dueAt <= now)
      .sort(
        (a, b) =>
          records[key(b)].lapses - records[key(a)].lapses ||
          records[key(a)].dueAt - records[key(b)].dueAt,
      );
    due.slice(0, 4).forEach((i) => add(i, "Đến hạn"));
    all
      .filter((i) => (records[key(i)]?.lapses || 0) > 0)
      .sort((a, b) => records[key(b)].lapses - records[key(a)].lapses)
      .slice(0, 4)
      .forEach((i) => {
        if (picked.length < 6) add(i, "Cần củng cố");
      });
    const fresh = all.filter((i) => !seen.has(key(i)) && !records[key(i)]);
    fresh.forEach((i) => {
      if (picked.length < limit) add(i, "Nội dung mới");
    });
    due.forEach((i) => add(i, "Đến hạn"));
    all.forEach((i) => add(i, "Ôn thêm"));
    return picked;
  }
  return {
    normalize,
    category,
    answers,
    isAnswer,
    variants,
    distractors,
    explain,
    flatten,
    key,
    queue,
  };
});

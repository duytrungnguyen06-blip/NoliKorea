const { JSDOM, VirtualConsole } = require("jsdom"),
  fs = require("node:fs"),
  path = require("node:path");
const dist = path.join(__dirname, "../dist");
async function app(seed = {}, fetcher, setup) {
  const raw = fs.readFileSync(path.join(dist, "index.html"), "utf8");
  const scripts = [...raw.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  const html = raw
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "")
    .replace(/<link[^>]+>/g, "");
  const errors = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => errors.push(e.message));
  const dom = new JSDOM(html, {
    url: "https://test.example/",
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole: vc,
  });
  const w = dom.window;
  w.matchMedia = () => ({ matches: false, addEventListener() {} });
  w.alert = () => {};
  w.confirm = () => true;
  w.fetch =
    fetcher ||
    (() => Promise.reject(Error("Network forbidden in regression tests")));
  w.requestAnimationFrame = (fn) => w.setTimeout(fn, 0);
  w.HTMLElement.prototype.scrollIntoView = function () {};
  w.HTMLElement.prototype.scrollTo = function (o) {
    this.scrollTop = o?.top || 0;
  };
  w.HTMLMediaElement.prototype.pause = function () {};
  w.HTMLMediaElement.prototype.load = function () {};
  w.HTMLMediaElement.prototype.play = function () {
    return Promise.resolve();
  };
  w.URL.createObjectURL = () => "blob:test";
  w.URL.revokeObjectURL = () => {};
  for (const [k, v] of Object.entries(seed))
    w.localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
  setup?.(w);
  for (const file of scripts) {
    const s = w.document.createElement("script");
    s.textContent = fs.readFileSync(path.join(dist, file), "utf8");
    w.document.body.append(s);
  }
  await new Promise((r) => w.setTimeout(r, 30));
  return {
    w,
    dom,
    errors,
    eval: (code) => w.eval(code),
    close: () => w.close(),
  };
}
module.exports = { app, dist };

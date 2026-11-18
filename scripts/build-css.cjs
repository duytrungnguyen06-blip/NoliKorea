const fs = require("fs"),
  postcss = require("postcss"),
  path = require("path");
const root = path.join(__dirname, "../dist");
const files = [
  "base",
  "curriculum",
  "study-forms",
  "keyboard",
  "practice",
  "progress-search",
  "dialogue",
  "ai",
  "audio",
  "roleplay",
  "components",
  "seoul",
  "reliability",
  "daily",
  "shiba",
];
let css = files
  .map((n) => fs.readFileSync(root + "/styles/" + n + ".css", "utf8"))
  .join("\n");
const tree = postcss.parse(css);
tree.walkComments((c) => c.remove());
const seen = new Map();
for (const n of [...tree.nodes]) {
  if (n.type === "rule") {
    const key = n.toString().replace(/\s+/g, " ");
    if (seen.has(key)) seen.get(key).remove();
    seen.set(key, n);
  }
}
tree.walk((n) => {
  n.raws.before = "";
  n.raws.after = "";
  if (n.type === "decl") n.raws.between = ":";
  if (n.type === "rule" || n.type === "atrule") n.raws.between = "";
});
fs.writeFileSync(root + "/styles.css", tree.toString());
console.log("CSS bytes:", Buffer.byteLength(tree.toString()));

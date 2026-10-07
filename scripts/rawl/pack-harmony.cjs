// Small static gzip assets keep corpus search downloads manageable.
const fs = require("fs"),
  path = require("path"),
  { gzipSync } = require("zlib");
function packHarmony(directory) {
  let source = 0,
    packed = 0;
  for (const folder of [directory, path.join(directory, "details")]) {
    for (const file of fs
      .readdirSync(folder)
      .filter((f) => f.endsWith(".json") && f !== "prior.json")) {
      const input = fs.readFileSync(path.join(folder, file)),
        output = gzipSync(input, { level: 9 });
      fs.writeFileSync(path.join(folder, `${file}.gz`), output);
      source += input.length;
      packed += output.length;
    }
  }
  return { sourceBytes: source, packedBytes: packed };
}
module.exports = packHarmony;
if (require.main === module)
  console.log(packHarmony(path.resolve(__dirname, "../../public/harmony")));

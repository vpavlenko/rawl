const args = process.argv.slice(2);

if (args.length !== 2) {
  console.error("Usage: yarn run rename-tag <oldTagName> <newTagName>");
  process.exit(1);
}

const oldTagName = args[0];
const newTagName = args[1];

const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "src", "corpus", "analyses.json");

fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading the file:", err);
    return;
  }

  const analyses = JSON.parse(data);

  for (let game in analyses) {
    for (let song in analyses[game]) {
      for (let subtune in analyses[game][song]) {
        if (analyses[game][song][subtune].tags) {
          const tagIndex =
            analyses[game][song][subtune].tags.indexOf(oldTagName);
          if (tagIndex !== -1) {
            console.log(
              `Renaming: in ${game} in ${song} in subtune ${subtune}: global`,
            );
            analyses[game][song][subtune].tags[tagIndex] = newTagName;
          }
        }
        if (analyses[game][song][subtune].tagSpans) {
          const { tagSpans } = analyses[game][song][subtune];
          for (let i = 0; i < tagSpans.length; ++i) {
            if (tagSpans[i].tag === oldTagName) {
              tagSpans[i].tag = newTagName;
              console.log(
                `Renaming: in ${game} in ${song} in subtune ${subtune}: tagSpan ${tagSpans[i].span}`,
              );
            }
          }
          analyses[game][song][subtune].tagSpans = tagSpans;
        }
      }
    }
  }

  fs.writeFile(filePath, JSON.stringify(analyses, null, 2), "utf8", (err) => {
    if (err) {
      console.error("Error writing to the file:", err);
      return;
    }

    console.log("Successfully updated analyses.json!");
  });
});

import fs from "fs";
import path from "path";
import type { Analysis } from "../../src/components/rawl/analysis";

type Analyses = {
  [path: string]: Analysis;
};

const filePath = path.join(
  __dirname,
  "..",
  "..",
  "src",
  "corpus",
  "analyses.json",
);

// Read and parse the file
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading the file:", err);
    process.exit(1);
  }

  const analyses = JSON.parse(data) as Analyses;
  let snippetsRemoved = 0;

  // Process each analysis entry
  for (const [gamePath, analysis] of Object.entries(analyses)) {
    if (!analysis.snippets) continue;

    // Filter out unwanted snippets
    const originalLength = analysis.snippets.length;
    analysis.snippets = analysis.snippets.filter((snippet) => {
      const shouldKeep =
        !snippet.tag.startsWith("book:") || snippet.tag === "book:index";
      return shouldKeep;
    });

    const removedCount = originalLength - analysis.snippets.length;
    if (removedCount > 0) {
      snippetsRemoved += removedCount;
      console.log(`Removed ${removedCount} snippets from ${gamePath}`);
    }
  }

  // Write the updated analyses back to file
  fs.writeFile(filePath, JSON.stringify(analyses, null, 2), "utf8", (err) => {
    if (err) {
      console.error("Error writing to the file:", err);
      process.exit(1);
    }

    console.log(
      `Successfully removed ${snippetsRemoved} book snippets from analyses.json!`,
    );
  });
});

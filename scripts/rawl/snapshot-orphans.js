// Run manually with: node scripts/rawl/snapshot-orphans.js
// Reads Firebase once; the /orphans page only uses the generated JSON.
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const admin = require("firebase-admin");

const root = path.resolve(__dirname, "../..");
const corpusPath = path.join(root, "src/components/rawl/corpora/corpora.tsx");
const source = ts.createSourceFile(
  corpusPath,
  fs.readFileSync(corpusPath, "utf8"),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);
const corpusMidis = new Set();
function visit(node) {
  if (ts.isPropertyAssignment(node) && node.name.getText(source) === "midis") {
    if (!ts.isArrayLiteralExpression(node.initializer)) {
      throw new Error("Expected a literal MIDI array in corpora.tsx");
    }
    for (const element of node.initializer.elements) {
      if (!ts.isStringLiteral(element)) {
        throw new Error("Expected a literal MIDI slug in corpora.tsx");
      }
      corpusMidis.add(element.text);
    }
  }
  ts.forEachChild(node, visit);
}
visit(source);
if (!corpusMidis.size) throw new Error("No corpus MIDI slugs found");

async function main() {
  const app = admin.initializeApp({
    credential: admin.credential.cert(
      require("../../src/config/firebaseConfigPrivate.json"),
    ),
  });
  try {
    const db = app.firestore();
    const [documents, index] = await Promise.all([
      db.collection("midis").select("title", "slug").get(),
      db.collection("indexes").doc("midis").get(),
    ]);
    if (documents.empty || !index.exists) {
      throw new Error("Missing MIDI collection or index; snapshot not written");
    }
    const indexedMidis = index.data().midis;
    const byId = new Map(indexedMidis.map((midi) => [midi.id, midi]));
    const midis = documents.docs
      .map((document) => {
        const data = document.data();
        const indexed = byId.get(document.id);
        const slug = data.slug || indexed?.slug || null;
        return {
          id: document.id,
          slug,
          title: data.title || indexed?.title || slug || document.id,
          playerPath: indexed
            ? `/f/${encodeURIComponent(indexed.slug || document.id)}`
            : null,
          inCorpus:
            corpusMidis.has(document.id) ||
            corpusMidis.has(slug) ||
            (indexed && corpusMidis.has(indexed.slug)),
        };
      })
      .filter((midi) => !midi.inCorpus)
      .map(({ inCorpus, ...midi }) => midi)
      .sort((a, b) => a.title.localeCompare(b.title, "en") || a.id.localeCompare(b.id));
    const snapshot = {
      generatedAt: new Date().toISOString(),
      firebaseMidiCount: documents.size,
      corpusMidiCount: corpusMidis.size,
      midis,
    };
    const output = path.join(root, "src/components/rawl/corpora/orphans.json");
    fs.writeFileSync(output, JSON.stringify(snapshot, null, 2) + "\n");
    console.log(`Saved ${midis.length} orphans from ${documents.size} Firebase MIDIs to ${output}`);
  } finally {
    await app.delete();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

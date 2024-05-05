const admin = require("firebase-admin");
const fs = require("fs");
const serviceAccount = require("../../src/config/firebaseConfigPrivate.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function downloadAndMergeAnalyses() {
  const docRef = db.collection("users").doc("RK31rsh4tDdUGlNYQvakXW4AYbB3");
  const userSnapshot = await docRef.get();

  if (userSnapshot.exists) {
    const firebaseAnalyses = userSnapshot.data().analyses;

    let localAnalyses;
    try {
      localAnalyses = JSON.parse(
        fs.readFileSync("src/corpus/analyses.json", "utf-8"),
      );
    } catch (error) {
      console.error("No local corpus found", error);
    }

    fs.writeFileSync(
      "src/corpus/analyses.json",
      JSON.stringify({ ...localAnalyses, ...firebaseAnalyses }, null, 2),
      "utf-8",
    );
    console.log("Data successfully merged into corpus/analyses.json");

    await docRef.update({
      analyses: admin.firestore.FieldValue.delete(),
    });
    console.log("'analyses' field deleted from Firestore");
  } else {
    console.error("No data found for the specified user");
  }
}

downloadAndMergeAnalyses().catch(console.error);

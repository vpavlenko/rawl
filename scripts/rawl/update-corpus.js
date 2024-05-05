const admin = require("firebase-admin");
const fs = require("fs");
const serviceAccount = require("../src/config/firebaseConfig.json");

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function downloadAndMergeAnalyses() {
  const docRef = db.collection("users").doc("RK31rsh4tDdUGlNYQvakXW4AYbB3");
  const userSnapshot = await docRef.get();

  if (userSnapshot.exists) {
    const firebaseAnalyses = userSnapshot.data().analyses;

    // Read the existing corpus
    let localAnalyses;
    try {
      localAnalyses = JSON.parse(
        fs.readFileSync("src/corpus/analyses.json", "utf-8"),
      );
    } catch (error) {
      console.error("No local corpus found", error);
    }

    // Merge the analyses from Firebase into the local corpus
    for (const game in firebaseAnalyses) {
      if (!localAnalyses[game]) {
        console.log(`Created a new game ${game}`);
        localAnalyses[game] = {};
      }

      for (const file in firebaseAnalyses[game]) {
        if (!localAnalyses[game][file]) {
          console.log(`Created a new file ${file}`);
          localAnalyses[game][file] = {};
        }

        for (const subtune in firebaseAnalyses[game][file]) {
          console.log(
            `Write to game ${game}, file ${file}, subtune ${
              Number(subtune) + 1
            }`,
          );
          localAnalyses[game][file][subtune] =
            firebaseAnalyses[game][file][subtune];
        }
      }
    }

    // Write the merged data back to analyses.json
    fs.writeFileSync(
      "src/corpus/analyses.json",
      JSON.stringify(localAnalyses, null, 2),
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

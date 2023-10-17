// scripts/downloadData.js

const admin = require("firebase-admin");
const fs = require("fs");
const serviceAccount = require("../src/config/firebaseConfig.json"); // replace with your service account JSON file path

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function downloadAnalyses() {
  const docRef = db.collection("users").doc("hqAWkYyzu2hIzNgE3ui89f41vFA2");
  const userSnapshot = await docRef.get();

  if (userSnapshot.exists) {
    const analyses = userSnapshot.data().analyses;

    // Write to JSON file
    fs.writeFileSync(
      "src/corpus/analyses.json",
      JSON.stringify(analyses, null, 2),
      "utf-8",
    );
    console.log("Data successfully written to corpus/analyses.json");

    await docRef.update({
      analyses: admin.firestore.FieldValue.delete(),
    });
    console.log("Analyses field deleted from Firestore");
  } else {
    console.error("No data found for the specified user");
  }
}

downloadAnalyses().catch(console.error);

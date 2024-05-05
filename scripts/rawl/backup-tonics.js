const admin = require("firebase-admin");
const fs = require("fs");
const serviceAccount = require("../src/config/firebaseConfig.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const collection = {};

async function fetchTonics() {
  const colRef = db.collection("tonics");
  const snapshot = await colRef.get();

  if (!snapshot.empty) {
    snapshot.forEach((doc) => {
      const data = doc.data();
      collection[doc.id] = data;
      console.log("Fetched: ", data.path);
    });
  } else {
    console.log("No matching documents.");
  }

  fs.writeFileSync(
    "src/corpus/tonics.json",
    JSON.stringify(collection, null, 2),
    "utf-8",
  );
  console.log("Data successfully written into corpus/tonics.json");
}

fetchTonics().catch(console.error);

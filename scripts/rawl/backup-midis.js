const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const serviceAccount = require("../../src/config/firebaseConfigPrivate.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function backupMidiIndexes() {
  const indexDocRef = db.collection("indexes").doc("midis");
  const indexSnapshot = await indexDocRef.get();

  if (indexSnapshot.exists) {
    const midiIndex = indexSnapshot.data();
    fs.writeFileSync(
      "src/midis/midis.json",
      JSON.stringify(midiIndex, null, 2),
      "utf-8",
    );
    console.log("Index data successfully backed up to src/midis/midis.json");
  } else {
    console.error("No index data found for the specified document");
  }
}

async function backupMidiDocuments(limit = 2) {
  const midisCollectionRef = db.collection("midis");
  const midisSnapshot = await midisCollectionRef.limit(limit).get();

  if (!midisSnapshot.empty) {
    for (const doc of midisSnapshot.docs) {
      const midiFilePath = path.join("src/midis", `${doc.id}.json`);

      if (!fs.existsSync(midiFilePath)) {
        const midiData = doc.data();

        // Check and handle the blob field correctly
        if (midiData.blob) {
          if (midiData.blob instanceof Uint8Array) {
            midiData.blobBase64 = Buffer.from(midiData.blob).toString("base64");
            delete midiData.blob; // Remove the original blob field
          } else {
            console.log("Unhandled blob format");
          }
        }

        fs.writeFileSync(
          midiFilePath,
          JSON.stringify(midiData, null, 2),
          "utf-8",
        );
        console.log(`Midi data backed up to ${midiFilePath}`);
      } else {
        console.log(`File ${midiFilePath} already exists, skipping download`);
      }
    }
  } else {
    console.error("No midi documents found in the collection");
  }
}

async function backupMidiData() {
  try {
    await backupMidiIndexes();
    await backupMidiDocuments(10000); // Limiting to 2 MIDI documents
    console.log("Midi data backup completed successfully");
  } catch (error) {
    console.error("Error during backup process", error);
  }
}

backupMidiData().catch(console.error);

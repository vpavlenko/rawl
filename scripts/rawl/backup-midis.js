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

async function backupMidiDocuments() {
  const midisCollectionRef = db.collection("midis");

  // Prefetch the document IDs
  const midisSnapshot = await midisCollectionRef.select().get();
  if (midisSnapshot.empty) {
    console.error("No midi documents found in the collection");
    return;
  }

  // Iterate over the document IDs
  for (const doc of midisSnapshot.docs) {
    const docId = doc.id;
    const midiFilePath = path.join("src/midis", `${docId}.json`);

    if (!fs.existsSync(midiFilePath)) {
      // Fetch the full document data only if the file doesn't exist
      const fullDocSnapshot = await midisCollectionRef.doc(docId).get();

      if (fullDocSnapshot.exists) {
        const midiData = fullDocSnapshot.data();

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
        console.log(`Document with ID ${docId} no longer exists`);
      }
    } else {
      console.log(`File ${midiFilePath} already exists, skipping download`);
    }
  }
}

async function backupMidiData() {
  try {
    await backupMidiIndexes();
    await backupMidiDocuments();
    console.log("Midi data backup completed successfully");
  } catch (error) {
    console.error("Error during backup process", error);
  }
}

backupMidiData().catch(console.error);

import * as admin from "firebase-admin";
import * as fs from "fs";
import { readFile } from "fs/promises";
import path from "path";
import STATIC_MIDI_FILES from "../../src/components/staticMidiFilles";
import serviceAccount from "../../src/config/firebaseConfigPrivate.json";

async function createFirestoreBuffer(filePath: string): Promise<Buffer> {
  try {
    // Read the file into a buffer using the promise-based readFile
    const buffer = await readFile(filePath);

    // Return the buffer, which can be directly used with Firestore
    return buffer;
  } catch (error) {
    console.error("Failed to read file and create buffer:", error);
    throw error; // Rethrow or handle as needed
  }
}

// Initialize Firebase
admin.initializeApp({
  // @ts-ignore
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

// {
//   idx: 0,
//   path: "/static/Yes/Close_to_the_edge.mid",
//   size: 1337,
//   type: "file",
// },

const extractFilename = (path: string): string | null => {
  const startIdx = path.lastIndexOf("/") + 1;
  const endIdx = path.lastIndexOf(".mid");

  if (startIdx === 0 || endIdx === -1 || startIdx > endIdx) {
    return null;
  }

  return path.substring(startIdx, endIdx);
};

async function updateStaticFilesToF() {
  STATIC_MIDI_FILES.slice(0, 1).forEach(async ({ path: sitePath, link }) => {
    const [_, subpath] = sitePath.split("/static/");
    const resolvedPath = path.resolve(__dirname, "../../public/midi/", subpath);

    console.log({ sitePath, link, subpath, __dirname, resolvedPath });

    if (!fs.existsSync(resolvedPath)) {
      console.log("File does not exist.");
      return;
    }

    // Get file stats for size
    const stats = fs.statSync(resolvedPath);
    console.log(`File size: ${stats.size} bytes`);

    // Read the first 15 bytes of the file
    const buffer = Buffer.alloc(15);
    const fd = fs.openSync(resolvedPath, "r");
    fs.readSync(fd, buffer, 0, 15, 0);
    fs.closeSync(fd);

    // Convert to base64
    const base64Data = buffer.toString("base64");
    console.log(`First 15 bytes in Base64: ${base64Data}`);

    const slug = extractFilename(subpath);
    const midisEntry = {
      url: link ?? null,
      slug,
      title: slug,
      blob: await createFirestoreBuffer(resolvedPath),
    };

    console.log({ midisEntry });

    const midisCollection = firestore.collection("midis");

    // Add a document to the 'midis' collection
    try {
      const docRef = await midisCollection.add(midisEntry);
      console.log("MIDI file written with ID: ", docRef.id);

      const indexRef = firestore.doc("indexes/midis");

      try {
        const arrayUnion = admin.firestore.FieldValue.arrayUnion;
        await indexRef.update({
          midis: arrayUnion({ title: slug, slug, id: docRef.id }),
        });
        console.log("Index updated successfully.");
      } catch (error) {
        console.error("Error updating index: ", error);
      }
    } catch (error) {
      console.error("Error adding MIDI file: ", error);
    }
    console.log();
    console.log();
    console.log();
  });
}

updateStaticFilesToF().catch(console.error);

import * as admin from "firebase-admin";
import * as fs from "fs";
import path from "path";
import STATIC_MIDI_FILES from "../../src/components/staticMidiFilles";
import serviceAccount from "../../src/config/firebaseConfigPrivate.json";

// Initialize Firebase
admin.initializeApp({
  // @ts-ignore
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// {
//   idx: 0,
//   path: "/static/Yes/Close_to_the_edge.mid",
//   size: 1337,
//   type: "file",
// },

async function updateStaticFilesToF() {
  STATIC_MIDI_FILES.slice(0, 2).map(({ path: sitePath, link }) => {
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
  });
}

updateStaticFilesToF().catch(console.error);

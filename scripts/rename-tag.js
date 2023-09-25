const admin = require("firebase-admin");
const serviceAccount = require("../src/config/firebaseConfig.json"); // replace with your service account JSON file path

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Get command line arguments
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.error("Usage: yarn run rename-tag <oldTagName> <newTagName>");
  process.exit(1);
}

const oldTagName = args[0];
const newTagName = args[1];

// Fetch all analyses for Vitaly Pavlenko
const docRef = db.collection("users").doc("hqAWkYyzu2hIzNgE3ui89f41vFA2");

docRef
  .get()
  .then((snapshot) => {
    if (!snapshot.exists) {
      console.log("User not found!");
      return;
    }

    const data = snapshot.data();
    const analyses = data.analyses;

    // Iterate over each analysis and rename the tag
    for (let game in analyses) {
      for (let song in analyses[game]) {
        for (let subtune in analyses[game][song]) {
          if (analyses[game][song][subtune].tags) {
            const tagIndex =
              analyses[game][song][subtune].tags.indexOf(oldTagName);
            if (tagIndex !== -1) {
              console.log(
                `Renaming: in ${game} in ${song} in subtune ${subtune}`,
              );
              analyses[game][song][subtune].tags[tagIndex] = newTagName;
            }
          }
        }
      }
    }

    // Update the document in Firestore
    docRef
      .update({ analyses: analyses })
      .then(() => {
        console.log(
          `Successfully renamed tag "${oldTagName}" to "${newTagName}"!`,
        );
      })
      .catch((error) => {
        console.error("Error updating document:", error);
      });
  })
  .catch((error) => {
    console.error("Error fetching user data:", error);
  });

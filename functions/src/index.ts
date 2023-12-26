import { Midi } from "@tonejs/midi"
import axios from "axios"
import * as admin from "firebase-admin"
import * as functions from "firebase-functions"

admin.initializeApp()

export const storeMidiFile = functions.https.onCall(async (data) => {
  const { midiFileUrl } = data

  try {
    // Check if the file already exists in Firestore
    const midiCollection = admin.firestore().collection("midis")
    const existingMidi = await midiCollection
      .where("url", "==", midiFileUrl)
      .limit(1)
      .get()

    if (!existingMidi.empty) {
      return {
        message: "This MIDI file is already stored.",
        docId: existingMidi.docs[0].id,
      }
    }

    // Download the MIDI file
    const midiResponse = await axios.get(midiFileUrl, {
      responseType: "arraybuffer",
    })
    const midiData = midiResponse.data

    // Validate the MIDI file
    const midi = new Midi(midiData)
    if (!midi) {
      throw new functions.https.HttpsError("internal", "Invalid MIDI file.")
    }

    // Save to Firestore
    const docRef = await midiCollection.add({
      url: midiFileUrl,
      data: midiData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    return { message: "MIDI file has been stored.", docId: docRef.id }
  } catch (error) {
    console.error("An error occurred", error)
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while processing the MIDI file.",
    )
  }
})

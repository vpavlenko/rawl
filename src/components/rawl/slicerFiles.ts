import { doc, getDoc, getFirestore } from "firebase/firestore/lite";
import { FirestoreMidiDocument, FirestoreMidiIndex } from "../App";

export const loadMidiFromSlug = async (urlSlug) => {
  const firestore = getFirestore();
  const index = await getDoc(doc(firestore, "indexes", "midis"));
  const filteredMidis = (index.data() as FirestoreMidiIndex).midis.filter(
    ({ slug }) => slug === urlSlug,
  );
  if (filteredMidis.length > 1) {
    alert(`More than one midi is found for a slug ${urlSlug}`);
  } else if (filteredMidis.length === 0) {
    alert(`No midi is found for a slug ${urlSlug}`);
  } else {
    const { id } = filteredMidis[0];
    const { blob } = (
      await getDoc(doc(firestore, "midis", id))
    ).data() as FirestoreMidiDocument;

    return blob.toUint8Array();
  }
};

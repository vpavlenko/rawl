import { doc, getDoc, getFirestore } from "firebase/firestore/lite";
import keySlugMapping from "../keySlugMapping";
import { FirestoreMidiDocument, FirestoreMidiIndex } from "../types/firestore";

type HandleSongClickDependencies = {
  setState: (state: any, callback?: () => void) => void;
  loadMidi: (midiBlob: Blob, callback?: () => void) => void;
  state: {
    analyses: any;
  };
};

export const handleSongClick = async (
  deps: HandleSongClickDependencies,
  slug: string,
  isHiddenRoute: boolean = false,
): Promise<void> => {
  const firestore = getFirestore();
  try {
    console.log("Fetching index document");
    const indexDoc = await getDoc(doc(firestore, "indexes", "midis"));
    const indexData = indexDoc.data() as FirestoreMidiIndex;
    console.log("Index document data:", indexData);

    if (!indexData) {
      console.error("Index document not found");
      return;
    }

    let analysisKey;
    let fSlug = slug;
    if (isHiddenRoute) {
      fSlug = keySlugMapping[slug] || slug;
      analysisKey = `f/${fSlug}`;
    } else {
      analysisKey = `f/${slug}`;
    }

    console.log("Searching for MIDI info with slug:", slug);
    let midiInfo = indexData.midis.find(
      (midi) => midi.slug === slug || midi.id === slug,
    );
    console.log("Found MIDI info:", midiInfo);

    if (!midiInfo) {
      console.error(`No MIDI found for slug: ${slug}`);
      return;
    }

    console.log("Fetching MIDI document with ID:", midiInfo.id);
    const midiDoc = await getDoc(doc(firestore, "midis", midiInfo.id));
    if (midiDoc.exists()) {
      const midiData = midiDoc.data() as FirestoreMidiDocument;
      console.log("MIDI document data:", midiData);

      // Convert Firestore Bytes to Blob
      const midiBlob = new Blob([midiData.blob.toUint8Array()], {
        type: "audio/midi",
      });
      console.log("Created MIDI Blob:", midiBlob);

      const currentMidi = {
        id: midiInfo.id,
        title: midiData.title,
        slug: fSlug,
        sourceUrl: midiData.url,
        isHiddenRoute: isHiddenRoute,
      };
      const savedAnalysis = deps.state.analyses[analysisKey];

      return new Promise<void>((resolve) => {
        deps.setState(
          {
            currentMidi,
            rawlProps: {
              savedAnalysis,
              isHiddenRoute,
            },
          },
          () => {
            console.log("State updated with currentMidi:", currentMidi);
            console.log("State updated with rawlProps");
            // Create a promise that resolves when playback starts
            const playbackPromise = new Promise<void>((playbackResolve) => {
              deps.loadMidi(midiBlob, playbackResolve);
            });
            // Wait for playback to start before resolving the main promise
            playbackPromise.then(() => {
              resolve();
            });
          },
        );
      });
    } else {
      console.error("No such document!");
    }
  } catch (error) {
    console.error("Error loading MIDI:", error);
    throw error; // Re-throw to trigger the finally block in the click handler
  }
};

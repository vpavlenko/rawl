import { doc, getDoc, getFirestore } from "firebase/firestore/lite";
import { FirestoreMidiDocument, FirestoreMidiIndex } from "../types/firestore";
import { canonicalMidiSlug } from "./midiSlugAliases";
import {
  fakebookMidiPath,
  fakebookScorePath,
  getFakebookSetting,
} from "../components/rawl/horo/fakebookScores";

type HandleSongClickDependencies = {
  setState: (state: any, callback?: () => void) => void;
  loadMidi: (
    midiBlob: Blob,
    callback?: () => void,
    shouldAutoPlay?: boolean,
  ) => void;
  state: {
    analyses: any;
  };
};

export const handleSongClick = async (
  deps: HandleSongClickDependencies,
  slug: string,
  startPaused = false,
): Promise<void> => {
  const canonicalSlug = canonicalMidiSlug(slug);
  const analysisKey = `f/${canonicalSlug}`;
  const savedAnalysis = deps.state.analyses[analysisKey];

  const load = (
    midiBlob: Blob,
    currentMidi: {
      id: string;
      title: string;
      slug: string;
      sourceUrl: string;
      originalAudio?: FirestoreMidiDocument["originalAudio"];
    },
  ) =>
    new Promise<void>((resolve) => {
      deps.setState(
        { currentMidi, rawlProps: { savedAnalysis } },
        // For examples, resolve once the paused score is ready to seek.
        () => deps.loadMidi(midiBlob, resolve, !startPaused),
      );
    });

  const setting = getFakebookSetting(canonicalSlug);
  if (setting) {
    const response = await fetch(fakebookMidiPath(canonicalSlug));
    if (!response.ok)
      throw new Error(`Could not load ${setting.title} (${response.status}).`);
    const bytes = await response.arrayBuffer();
    if (new TextDecoder().decode(bytes.slice(0, 4)) !== "MThd") {
      throw new Error(`Invalid MIDI for ${setting.title}.`);
    }
    return load(new Blob([bytes], { type: "audio/midi" }), {
      id: canonicalSlug,
      title: setting.title,
      slug: canonicalSlug,
      sourceUrl: `${fakebookScorePath}#page=${setting.page}`,
    });
  }

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

    console.log("Searching for MIDI info with slug:", slug);
    const midiInfo = indexData.midis.find(
      (midi) =>
        canonicalMidiSlug(midi.slug) === canonicalSlug || midi.id === slug,
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
      const midiBlob = new Blob(
        [new Uint8Array(midiData.blob.toUint8Array())],
        {
          type: "audio/midi",
        },
      );
      console.log("Created MIDI Blob:", midiBlob);

      const currentMidi = {
        id: midiInfo.id,
        title: midiData.title,
        slug: canonicalSlug,
        sourceUrl: midiData.url,
        originalAudio: midiData.originalAudio,
      };
      return load(midiBlob, currentMidi);
    } else {
      console.error("No such document!");
    }
  } catch (error) {
    console.error("Error loading MIDI:", error);
    throw error; // Re-throw to trigger the finally block in the click handler
  }
};

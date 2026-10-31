import { Bytes, Timestamp } from "firebase/firestore/lite";

export interface FirestoreMidiIndex {
  midis: { id: string; slug: string; title: string }[];
}

export interface OriginalAudioAsset {
  url: string;
  storagePath: string;
  sha256: string;
  midiSha256: string;
  durationSeconds: number;
  sourceOffsetSeconds: number;
  sourceUrl: string;
}

export interface FirestoreMidiDocument {
  originalAudio?: OriginalAudioAsset;
  blob: Bytes;
  slug: string;
  title: string;
  url: string | null; // This is named 'url' in Firestore but we use it as 'sourceUrl' internally
}

// Add Firestore edit document type definitions
export interface FirestoreEditDocument {
  title?: string;
  versions?: string[]; // Make versions optional for legacy documents
  source?: string; // Optional legacy field
  createdAt: Timestamp;
  updatedAt: Timestamp;
  owner: string | null;
}

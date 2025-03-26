import { Bytes, Timestamp } from "firebase/firestore/lite";

export interface FirestoreMidiIndex {
  midis: { id: string; slug: string; title: string }[];
}

export interface FirestoreMidiDocument {
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

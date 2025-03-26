import { Bytes } from "firebase/firestore";

export interface FirestoreMidiIndex {
  midis: { id: string; slug: string; title: string }[];
}

export interface FirestoreMidiDocument {
  blob: Bytes;
  slug: string;
  title: string;
  url: string | null; // This is named 'url' in Firestore but we use it as 'sourceUrl' internally
}

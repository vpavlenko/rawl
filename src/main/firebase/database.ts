import {
  collection,
  DocumentReference,
  FirestoreDataConverter,
  Timestamp,
} from "firebase/firestore"
import { firestore } from "./firebase"

export interface FirestoreSongData {
  createdAt: Timestamp
  updatedAt: Timestamp
  data?: Blob
}

export interface FirestoreSong {
  name: string
  createdAt: Timestamp
  updatedAt: Timestamp
  data: DocumentReference
}

export const songConverter: FirestoreDataConverter<FirestoreSong> = {
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options)
    return data as FirestoreSong
  },
  toFirestore(song) {
    return song
  },
}

export const songDataConverter: FirestoreDataConverter<FirestoreSongData> = {
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options)
    return data as FirestoreSongData
  },
  toFirestore(song) {
    return song
  },
}

export const songCollection = collection(firestore, "songs").withConverter(
  songConverter
)

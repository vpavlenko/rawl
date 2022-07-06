import {
  collection,
  DocumentReference,
  FirestoreDataConverter,
  getDoc,
  Timestamp,
} from "firebase/firestore"
import { songFromMidi } from "../../common/midi/midiConversion"
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

export const loadSong = async (song: FirestoreSong) => {
  const snapshot = await getDoc(song.data.withConverter(songDataConverter))
  const data = snapshot.data()?.data
  if (data === undefined) {
    throw new Error("Song data does not exist")
  }
  const buf = await data.arrayBuffer()

  return songFromMidi(new Uint8Array(buf))
}

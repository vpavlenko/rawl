import {
  addDoc,
  Bytes,
  collection,
  DocumentReference,
  FirestoreDataConverter,
  getDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { songFromMidi, songToMidi } from "../../common/midi/midiConversion"
import Song from "../../common/song"
import { firestore } from "./firebase"

export interface FirestoreSongData {
  createdAt: Timestamp
  updatedAt: Timestamp
  data?: Bytes
}

export interface FirestoreSong {
  name: string
  createdAt: Timestamp
  updatedAt: Timestamp
  dataRef: DocumentReference
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

export const songDataCollection = collection(
  firestore,
  "songData"
).withConverter(songDataConverter)

export const loadSong = async (song: FirestoreSong) => {
  const snapshot = await getDoc(song.dataRef.withConverter(songDataConverter))
  const data = snapshot.data()?.data
  if (data === undefined) {
    throw new Error("Song data does not exist")
  }
  return songFromMidi(data.toUint8Array())
}

export const saveSong = async (song: Song) => {
  const bytes = songToMidi(song)

  const dataDoc = await addDoc(songDataCollection, {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    data: Bytes.fromUint8Array(bytes),
  })

  return await addDoc(songCollection, {
    name: song.name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    dataRef: dataDoc,
  })
}

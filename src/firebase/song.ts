import {
  addDoc,
  Bytes,
  collection,
  deleteDoc,
  doc,
  DocumentReference,
  FirestoreDataConverter,
  getDoc,
  getDocs,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore"
import { httpsCallable } from "firebase/functions"
import { basename } from "path"
import { songFromMidi, songToMidi } from "../common/midi/midiConversion"
import Song from "../common/song"
import { auth, firestore, functions } from "./firebase"

export interface FirestoreSongData {
  createdAt: Timestamp
  updatedAt: Timestamp
  data?: Bytes
  userId: string
}

export interface FirestoreSong {
  name: string
  createdAt: Timestamp
  updatedAt: Timestamp
  dataRef: DocumentReference
  userId: string
}

export interface FirestoreMidi {
  url: string
  data: Bytes
  createdAt: Timestamp
  updatedAt: Timestamp
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

export const midiConverter: FirestoreDataConverter<FirestoreMidi> = {
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options)
    return data as FirestoreMidi
  },
  toFirestore(midi) {
    return midi
  },
}

export const songCollection = collection(firestore, "songs").withConverter(
  songConverter,
)

export const songDataCollection = collection(
  firestore,
  "songData",
).withConverter(songDataConverter)

export const loadSong = async (
  songSnapshot: QueryDocumentSnapshot<FirestoreSong>,
) => {
  const snapshot = await getDoc(
    songSnapshot.data().dataRef.withConverter(songDataConverter),
  )
  const data = snapshot.data()?.data
  if (data === undefined) {
    throw new Error("Song data does not exist")
  }
  const song = songFromMidi(data.toUint8Array())
  song.name = songSnapshot.data().name
  song.firestoreReference = songSnapshot.ref
  song.firestoreDataReference = snapshot.ref
  song.isSaved = true
  return song
}

export const createSong = async (song: Song) => {
  if (auth.currentUser === null) {
    throw new Error("You must be logged in to save songs to the cloud")
  }

  const bytes = songToMidi(song)

  const dataDoc = await addDoc(songDataCollection, {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    data: Bytes.fromUint8Array(bytes),
    userId: auth.currentUser.uid,
  })

  const doc = await addDoc(songCollection, {
    name: song.name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    dataRef: dataDoc,
    userId: auth.currentUser.uid,
  })

  song.firestoreDataReference = dataDoc
  song.firestoreReference = doc
  song.isSaved = true
}

export const updateSong = async (song: Song) => {
  if (auth.currentUser === null) {
    throw new Error("You must be logged in to save songs to the cloud")
  }

  if (
    song.firestoreReference === null ||
    song.firestoreDataReference === null
  ) {
    throw new Error("This song is not loaded from the cloud")
  }

  const bytes = songToMidi(song)

  await updateDoc(song.firestoreReference, {
    updatedAt: serverTimestamp(),
    name: song.name,
  })

  await updateDoc(song.firestoreDataReference, {
    updatedAt: serverTimestamp(),
    data: Bytes.fromUint8Array(bytes),
  })

  song.isSaved = true
}

export const deleteSong = async (
  song: QueryDocumentSnapshot<FirestoreSong>,
) => {
  if (auth.currentUser === null) {
    throw new Error("You must be logged in to save songs to the cloud")
  }
  await deleteDoc(song.data().dataRef)
  await deleteDoc(song.ref)
}

export const getCurrentUserSongs = async () => {
  if (auth.currentUser === null) {
    throw new Error("You must be logged in to get songs from the cloud")
  }

  return await getDocs(
    query(songCollection, where("userId", "==", auth.currentUser.uid)),
  )
}

interface StoreMidiFileResponse {
  message: string
  docId: string
}

export const loadSongFromExternalMidiFile = async (midiFileUrl: string) => {
  const storeMidiFile = httpsCallable<
    { midiFileUrl: string },
    StoreMidiFileResponse
  >(functions, "storeMidiFile")
  const res = await storeMidiFile({ midiFileUrl })
  const midiCollection = collection(firestore, "midis")
  const snapshot = await getDoc(
    doc(midiCollection, res.data.docId).withConverter(midiConverter),
  )
  const data = snapshot.data()?.data
  if (data === undefined) {
    throw new Error("Midi data does not exist")
  }
  const song = songFromMidi(data.toUint8Array())
  song.name = basename(midiFileUrl)
  song.isSaved = true
  return song
}

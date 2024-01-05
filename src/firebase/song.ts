import {
  Bytes,
  collection,
  doc,
  FirestoreDataConverter,
  getDoc,
  Timestamp,
} from "firebase/firestore"
import { httpsCallable } from "firebase/functions"
import { basename } from "../common/helpers/path"
import { songFromMidi, songToMidi } from "../common/midi/midiConversion"
import Song from "../common/song"
import RootStore from "../main/stores/RootStore"
import { CloudSong } from "../repositories/ICloudSongRepository"
import { auth, firestore, functions } from "./firebase"

export interface FirestoreMidi {
  url: string
  data: Bytes
  createdAt: Timestamp
  updatedAt: Timestamp
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

export const loadSong =
  ({ cloudSongDataRepository }: RootStore) =>
  async (cloudSong: CloudSong) => {
    const songData = await cloudSongDataRepository.get(cloudSong.songDataId)
    const song = songFromMidi(songData)
    song.name = cloudSong.name
    song.cloudSongId = cloudSong.id
    song.cloudSongDataId = cloudSong.songDataId
    song.isSaved = true
    return song
  }

export const createSong =
  ({ cloudSongRepository, cloudSongDataRepository }: RootStore) =>
  async (song: Song) => {
    const bytes = songToMidi(song)
    const songDataId = await cloudSongDataRepository.create({ data: bytes })
    const songId = await cloudSongRepository.create({
      name: song.name,
      songDataId: songDataId,
    })

    song.cloudSongDataId = songDataId
    song.cloudSongId = songId
    song.isSaved = true
  }

export const updateSong =
  ({ cloudSongRepository, cloudSongDataRepository }: RootStore) =>
  async (song: Song) => {
    if (auth.currentUser === null) {
      throw new Error("You must be logged in to save songs to the cloud")
    }

    if (song.cloudSongId === null || song.cloudSongDataId === null) {
      throw new Error("This song is not loaded from the cloud")
    }

    const bytes = songToMidi(song)

    await cloudSongRepository.update(song.cloudSongId, {
      name: song.name,
    })

    await cloudSongDataRepository.update(song.cloudSongDataId, {
      data: bytes,
    })

    song.isSaved = true
  }

export const deleteSong =
  ({ cloudSongRepository, cloudSongDataRepository }: RootStore) =>
  async (song: CloudSong) => {
    if (auth.currentUser === null) {
      throw new Error("You must be logged in to delete song")
    }
    await cloudSongDataRepository.delete(song.songDataId)
    await cloudSongRepository.delete(song.id)
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
  song.name = basename(midiFileUrl) ?? ""
  song.isSaved = true
  return song
}

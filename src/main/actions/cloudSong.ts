import { httpsCallable } from "firebase/functions"
import { basename } from "../../common/helpers/path"
import { songFromMidi, songToMidi } from "../../common/midi/midiConversion"
import Song from "../../common/song"
import { functions } from "../../firebase/firebase"
import { CloudSong } from "../../repositories/ICloudSongRepository"
import { User } from "../../repositories/IUserRepository"
import RootStore from "../stores/RootStore"

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
    await cloudSongDataRepository.delete(song.songDataId)
    await cloudSongRepository.delete(song.id)
  }

interface StoreMidiFileResponse {
  message: string
  docId: string
}

export const loadSongFromExternalMidiFile =
  ({ cloudMidiRepository }: RootStore) =>
  async (midiFileUrl: string) => {
    const storeMidiFile = httpsCallable<
      { midiFileUrl: string },
      StoreMidiFileResponse
    >(functions, "storeMidiFile")
    const res = await storeMidiFile({ midiFileUrl })
    const data = await cloudMidiRepository.get(res.data.docId)
    const song = songFromMidi(data)
    song.name = basename(midiFileUrl) ?? ""
    song.isSaved = true
    return song
  }

export const publishSong =
  ({ cloudSongRepository }: RootStore) =>
  async (song: Song, user: User) => {
    if (song.cloudSongId === null) {
      throw new Error("This song is not saved in the cloud")
    }
    await cloudSongRepository.publish(song.cloudSongId, user)
  }

export const unpublishSong =
  ({ cloudSongRepository }: RootStore) =>
  async (song: Song) => {
    if (song.cloudSongId === null) {
      throw new Error("This song is not loaded from the cloud")
    }

    await cloudSongRepository.unpublish(song.cloudSongId)
  }

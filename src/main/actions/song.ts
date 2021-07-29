import {
  downloadSongAsMidi,
  songFromMidi,
} from "../../common/midi/midiConversion"
import Song, { emptySong } from "../../common/song"
import { emptyTrack } from "../../common/track"
import RootStore from "../stores/RootStore"
import { pushHistory } from "./history"

const openSongFile = (
  input: HTMLInputElement,
  callback: (song: Song | null) => void
) => {
  if (input.files === null || input.files.length === 0) {
    return
  }

  const file = input.files[0]
  const reader = new FileReader()

  reader.onload = (e) => {
    if (e.target == null) {
      callback(null)
      return
    }
    const buf = e.target.result as ArrayBuffer

    try {
      const song = songFromMidi(new Uint8Array(buf))
      song.filepath = file.name
      callback(song)
    } catch (e) {
      alert(e)
    }
  }

  reader.readAsArrayBuffer(file)
}

const setSong = (rootStore: RootStore) => (song: Song) => {
  rootStore.song = song
  rootStore.trackMute.reset()
  rootStore.pianoRollStore.setScrollLeftInPixels(0)
  rootStore.pianoRollStore.ghostTracks = {}
  rootStore.historyStore.clear()

  const { player } = rootStore.services
  player.stop()
  player.reset()
  player.position = 0
}

export const createSong = (rootStore: RootStore) => () => {
  const store = rootStore
  setSong(store)(emptySong())
}

export const saveSong = (rootStore: RootStore) => () => {
  const { song } = rootStore
  downloadSongAsMidi(song)
}

export const openSong = (rootStore: RootStore) => (input: HTMLInputElement) => {
  openSongFile(input, (song) => {
    if (song === null) {
      return
    }
    setSong(rootStore)(song)
  })
}

export const addTrack = (rootStore: RootStore) => () => {
  pushHistory(rootStore)()
  rootStore.song.addTrack(emptyTrack(rootStore.song.tracks.length - 1))
}

export const removeTrack = (rootStore: RootStore) => (trackId: number) => {
  if (rootStore.song.tracks.filter((t) => !t.isConductorTrack).length <= 1) {
    // conductor track を除き、最後のトラックの場合
    // トラックがなくなるとエラーが出るので削除できなくする
    // For the last track except for Conductor Track
    // I can not delete it because there is an error when there is no track
    return
  }
  pushHistory(rootStore)()
  rootStore.song.removeTrack(trackId)
}

export const selectTrack = (rootStore: RootStore) => (trackId: number) => {
  const { song } = rootStore
  song.selectTrack(trackId)
}

export const insertTrack = (rootStore: RootStore) => (trackId: number) => {
  pushHistory(rootStore)()
  rootStore.song.insertTrack(
    emptyTrack(rootStore.song.tracks.length - 1),
    trackId
  )
}

export const duplicateTrack = (rootStore: RootStore) => (trackId: number) => {
  if (trackId === 0) {
    throw new Error("Don't remove conductor track")
  }
  const track = rootStore.song.getTrack(trackId)
  if (track === undefined) {
    throw new Error("No track found")
  }
  const newTrack = track.clone()
  newTrack.channel = undefined
  pushHistory(rootStore)()
  rootStore.song.insertTrack(newTrack, trackId + 1)
}

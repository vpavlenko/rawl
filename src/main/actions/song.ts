import {
  read as readSong,
  write as writeSong,
} from "../../common/midi/SongFile"
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
    const song = readSong(new Uint8Array(buf))
    song.filepath = file.name
    callback(song)
  }

  reader.readAsArrayBuffer(file)
}

const setSong = (rootStore: RootStore) => (song: Song) => {
  rootStore.song = song
  rootStore.services.player.reset()
  rootStore.trackMute.reset()
  rootStore.services.player.timebase = song.timebase
  rootStore.services.player.position = 0
  rootStore.services.player.stop()
  rootStore.services.quantizer.ticksPerBeat = song.timebase
  rootStore.pianoRollStore.scrollLeft = 0
  rootStore.pianoRollStore.ghostTracks = {}
  rootStore.historyStore.clear()
}

export const createSong = (rootStore: RootStore) => () => {
  const store = rootStore

  setSong(store)(emptySong())
}

export const saveSong = (rootStore: RootStore) => () => {
  const { song } = rootStore

  writeSong(song, song.filepath)
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
  pushHistory(rootStore)
  rootStore.song.addTrack(emptyTrack(rootStore.song.tracks.length - 1))
}

export const removeTrack = (rootStore: RootStore) => (trackId: number) => {
  if (rootStore.song.tracks.filter((t) => !t.isConductorTrack).length <= 1) {
    // conductor track を除き、最後のトラックの場合
    // トラックがなくなるとエラーが出るので削除できなくする
    return
  }
  pushHistory(rootStore)
  rootStore.song.removeTrack(trackId)
}

export const selectTrack = (rootStore: RootStore) => (trackId: number) => {
  const { song } = rootStore

  song.selectTrack(trackId)
}

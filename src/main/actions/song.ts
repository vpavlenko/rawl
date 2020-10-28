import { toJS } from "mobx"
import {
  read as readSong,
  write as writeSong,
} from "../../common/midi/SongFile"
import Song, { emptySong } from "../../common/song"
import { emptyTrack } from "../../common/track"
import RootStore from "../stores/RootStore"

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
    callback(song)
  }

  reader.readAsArrayBuffer(file)
}

export const setSong = (rootStore: RootStore, song: Song) => {
  rootStore.song = song
  rootStore.services.player.reset()
  rootStore.trackMute.reset()
  rootStore.services.player.timebase = song.timebase
  rootStore.services.player.position = 0
  rootStore.services.player.stop()
  rootStore.services.quantizer.ticksPerBeat = song.timebase
  rootStore.pianoRollStore.scrollLeft = 0
  rootStore.pianoRollStore.ghostTracks = {}
}

export const createSong = (rootStore: RootStore) => () => {
  const store = rootStore

  setSong(store, emptySong())
}

export const saveSong = (rootStore: RootStore) => () => {
  const { song } = rootStore

  writeSong(toJS(song.tracks, { recurseEverything: true }), song.filepath)
}

export const openSong = (rootStore: RootStore) => (input: HTMLInputElement) => {
  const store = rootStore

  openSongFile(input, (song) => {
    if (song === null) {
      return
    }
    setSong(store, song)
  })
}

export const addTrack = (rootStore: RootStore) => () => {
  const store = rootStore

  store.pushHistory()
  store.song.addTrack(emptyTrack(store.song.tracks.length - 1))
}

export const removeTrack = (rootStore: RootStore) => (trackId: number) => {
  const store = rootStore

  if (store.song.tracks.filter((t) => !t.isConductorTrack).length <= 1) {
    // conductor track を除き、最後のトラックの場合
    // トラックがなくなるとエラーが出るので削除できなくする
    return
  }
  store.pushHistory()
  store.song.removeTrack(trackId)
}

export const selectTrack = (rootStore: RootStore) => (trackId: number) => {
  const { song } = rootStore

  song.selectTrack(trackId)
}

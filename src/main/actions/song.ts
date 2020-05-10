import Song, { emptySong } from "common/song"
import { emptyTrack } from "common/track"
import { write as writeSong, read as readSong } from "midi/SongFile"
import RootStore from "../stores/RootStore"
import { toJS } from "mobx"
import { Action, Mutator } from "../createDispatcher"

// Actions

export interface CreateSong {
  type: "createSong"
}
export const createSong = (): CreateSong => ({ type: "createSong" })
export interface SaveSong {
  type: "saveSong"
}
export const saveSong = (): SaveSong => ({ type: "saveSong" })
export interface OpenSong {
  type: "openSong"
  input: HTMLInputElement
}
export const openSong = (input: HTMLInputElement): OpenSong => ({
  type: "openSong",
  input,
})
export interface AddTrack {
  type: "addTrack"
}
export const addTrack = (): AddTrack => ({ type: "addTrack" })
export interface RemoveTrack {
  type: "removeTrack"
  trackId: number
}
export const removeTrack = (trackId: number): RemoveTrack => ({
  type: "removeTrack",
  trackId,
})
export interface SelectTrack {
  type: "selectTrack"
  trackId: number
}
export const selectTrack = (trackId: number): SelectTrack => ({
  type: "selectTrack",
  trackId,
})
export interface SetTempo {
  type: "setTempo"
  tempo: number
}
export const setTempo = (tempo: number): SetTempo => ({
  type: "setTempo",
  tempo,
})

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

export type SongAction =
  | CreateSong
  | SaveSong
  | OpenSong
  | AddTrack
  | RemoveTrack
  | SelectTrack
  | SetTempo

// Mutators

const setSong = (rootStore: RootStore, song: Song) => {
  rootStore.song = song
  rootStore.services.player.reset()
  rootStore.trackMute.reset()
  rootStore.playerStore.setPosition(0)
  rootStore.services.player.stop()
  rootStore.pianoRollStore.scrollLeft = 0
}

export default (action: Action): Mutator | null => {
  switch (action.type) {
    case "createSong":
      return (store) => {
        setSong(store, emptySong())
      }
    case "saveSong":
      return ({ song }) => {
        writeSong(toJS(song.tracks, { recurseEverything: true }), song.filepath)
      }
    case "openSong":
      return (store) => {
        openSongFile(action.input, (song) => {
          if (song === null) {
            return
          }
          setSong(store, song)
        })
      }
    case "addTrack":
      return (store) => {
        store.pushHistory()
        store.song.addTrack(emptyTrack(store.song.tracks.length - 1))
      }
    case "removeTrack":
      return (store) => {
        if (store.song.tracks.length == 2) {
          // conductor track を除き、最後のトラックの場合
          // トラックがなくなるとエラーが出るので削除できなくする
          return
        }
        store.pushHistory()
        store.song.removeTrack(action.trackId)
      }
    case "selectTrack":
      return ({ song }) => {
        song.selectTrack(action.trackId)
      }
    case "setTempo":
      return (store) => {
        store.pushHistory()
        store.song.getTrack(0).setTempo(action.tempo)
      }
  }
  return null
}

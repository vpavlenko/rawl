import Song, { emptySong } from "common/song"
import { emptyTrack } from "common/track"
import { write as writeSong, read as readSong } from "midi/SongFile"
import RootStore from "../stores/RootStore"

export const CREATE_SONG = Symbol()
export const SAVE_SONG = Symbol()
export const OPEN_SONG = Symbol()
export const ADD_TRACK = Symbol()
export const REMOVE_TRACK = Symbol()
export const SELECT_TRACK = Symbol()
export const SET_TEMPO = Symbol()

const openSong = (
  input: HTMLInputElement,
  callback: (song: Song | null) => void
) => {
  if (input.files === null || input.files.length === 0) {
    return
  }

  const file = input.files[0]
  const reader = new FileReader()

  reader.onload = e => {
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

export default (rootStore: RootStore) => {
  const {
    song,
    services: { player }
  } = rootStore

  const saveHistory = () => {
    rootStore.pushHistory()
  }

  const setSong = (song: Song) => {
    rootStore.song = song
    player.reset()
    rootStore.trackMute.reset()
    rootStore.playerStore.setPosition(0)
    rootStore.services.player.stop()
    rootStore.pianoRollStore.scrollLeft = 0
  }

  return {
    [CREATE_SONG]: () => {
      setSong(emptySong())
    },
    [SAVE_SONG]: (filepath: string) => {
      writeSong(song, filepath, e => {
        if (e) {
          console.error(e)
        } else {
          song.filepath = filepath
        }
      })
    },
    [OPEN_SONG]: (input: HTMLInputElement) => {
      openSong(input, song => {
        if (song === null) {
          return
        }
        setSong(song)
      })
    },
    [ADD_TRACK]: () => {
      saveHistory()
      song.addTrack(emptyTrack(song.tracks.length - 1))
    },
    [REMOVE_TRACK]: (trackId: number) => {
      if (song.tracks.length == 2) {
        // conductor track を除き、最後のトラックの場合
        // トラックがなくなるとエラーが出るので削除できなくする
        return
      }
      saveHistory()
      song.removeTrack(trackId)
    },
    [SELECT_TRACK]: (trackId: number) => {
      song.selectTrack(trackId)
    },
    [SET_TEMPO]: (tempo: number) => {
      saveHistory()
      song.getTrack(0).setTempo(tempo)
    }
  }
}

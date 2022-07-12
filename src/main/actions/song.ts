import { isNotNull } from "../../common/helpers/array"
import { downloadSongAsMidi } from "../../common/midi/midiConversion"
import Song, { emptySong } from "../../common/song"
import { emptyTrack, isNoteEvent } from "../../common/track"
import { clampNoteNumber } from "../../common/transform/NotePoint"
import RootStore from "../stores/RootStore"
import { songFromFile } from "./file"
import { pushHistory } from "./history"

const openSongFile = async (input: HTMLInputElement): Promise<Song | null> => {
  if (input.files === null || input.files.length === 0) {
    return Promise.resolve(null)
  }

  const file = input.files[0]
  return await songFromFile(file)
}

export const setSong = (rootStore: RootStore) => (song: Song) => {
  rootStore.song = song
  rootStore.trackMute.reset()
  rootStore.pianoRollStore.setScrollLeftInPixels(0)
  rootStore.pianoRollStore.notGhostTracks = new Set()
  rootStore.rootViewStore.openTrackListDrawer = true
  rootStore.historyStore.clear()

  const { player } = rootStore
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
  song.isSaved = true
  downloadSongAsMidi(song)
}

export const openSong =
  (rootStore: RootStore) => async (input: HTMLInputElement) => {
    try {
      const song = await openSongFile(input)
      if (song === null) {
        return
      }
      setSong(rootStore)(song)
    } catch (e) {
      rootStore.toastStore.showError((e as Error).message)
    }
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

export const transposeNotes =
  (rootStore: RootStore) =>
  (
    deltaPitch: number,
    selectedEventIds: {
      [key: number]: number[] // trackId: eventId
    }
  ) => {
    const { song } = rootStore

    for (const trackIdStr in selectedEventIds) {
      const trackId = parseInt(trackIdStr)
      const eventIds = selectedEventIds[trackId]
      const track = song.getTrack(trackId)
      if (track === undefined) {
        continue
      }
      track.updateEvents(
        eventIds
          .map((id) => {
            const n = track.getEventById(id)
            if (n == undefined || !isNoteEvent(n)) {
              return null
            }
            return {
              id,
              noteNumber: clampNoteNumber(n.noteNumber + deltaPitch),
            }
          })
          .filter(isNotNull)
      )
    }
  }

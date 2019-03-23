import {
  panMidiEvent,
  volumeMidiEvent,
  setTempoMidiEvent,
  pitchBendMidiEvent,
  modulationMidiEvent,
  expressionMidiEvent
} from "midi/MidiEvent"
import RootStore from "../stores/RootStore"
import { NoteEvent } from "src/common/track"

export const CHANGE_TEMPO = Symbol()
export const CREATE_TEMPO = Symbol()
export const CHANGE_NOTES_VELOCITY = Symbol()
export const CREATE_PITCH_BEND = Symbol()
export const CREATE_VOLUME = Symbol()
export const CREATE_PAN = Symbol()
export const CREATE_MODULATION = Symbol()
export const CREATE_EXPRESSION = Symbol()
export const REMOVE_EVENT = Symbol()
export const CREATE_NOTE = Symbol()
export const MOVE_NOTE = Symbol()
export const RESIZE_NOTE_LEFT = Symbol()
export const RESIZE_NOTE_RIGHT = Symbol()
export const SET_TRACK_NAME = Symbol()
export const SET_TRACK_VOLUME = Symbol()
export const SET_TRACK_PAN = Symbol()
export const SET_TRACK_INSTRUMENT = Symbol()

export default (rootStore: RootStore) => {
  const {
    song,
    pianoRollStore,
    services: { player, quantizer }
  } = rootStore
  const { tracks, selectedTrack } = song

  const saveHistory = () => {
    rootStore.pushHistory()
  }

  return {
    /* conductor track */

    [CHANGE_TEMPO]: (id: number, microsecondsPerBeat: number) => {
      saveHistory()
      song.conductorTrack.updateEvent(id, {
        microsecondsPerBeat: microsecondsPerBeat
      })
    },
    [CREATE_TEMPO]: (tick: number, microsecondsPerBeat: number) => {
      saveHistory()
      const e = {
        ...setTempoMidiEvent(0, Math.round(microsecondsPerBeat)),
        tick: quantizer.round(tick)
      }
      song.conductorTrack.createOrUpdate(e)
    },

    /* events */

    [CHANGE_NOTES_VELOCITY]: (notes: NoteEvent[], velocity: number) => {
      saveHistory()
      selectedTrack.updateEvents(notes.map(item => ({ id: item.id, velocity })))
    },
    [CREATE_PITCH_BEND]: (value: number, tick: number = player.position) => {
      saveHistory()
      const e = pitchBendMidiEvent(0, 0, Math.round(value))
      selectedTrack.createOrUpdate({ ...e, tick: quantizer.round(tick) })
    },
    [CREATE_VOLUME]: (value: number, tick: number = player.position) => {
      saveHistory()
      const e = volumeMidiEvent(0, 0, Math.round(value))
      selectedTrack.createOrUpdate({
        ...e,
        tick: quantizer.round(tick)
      })
    },
    [CREATE_PAN]: (value: number, tick: number = player.position) => {
      saveHistory()
      const e = panMidiEvent(0, 0, Math.round(value))
      selectedTrack.createOrUpdate({ ...e, tick: quantizer.round(tick) })
    },
    [CREATE_MODULATION]: (value: number, tick: number = player.position) => {
      saveHistory()
      const e = modulationMidiEvent(0, 0, Math.round(value))
      selectedTrack.createOrUpdate({ ...e, tick: quantizer.round(tick) })
    },
    [CREATE_EXPRESSION]: (value: number, tick: number = player.position) => {
      saveHistory()
      const e = expressionMidiEvent(0, 0, Math.round(value))
      selectedTrack.createOrUpdate({ ...e, tick: quantizer.round(tick) })
    },
    [REMOVE_EVENT]: (eventId: number) => {
      saveHistory()
      selectedTrack.removeEvent(eventId)
    },

    /* note */

    [CREATE_NOTE]: (tick: number, noteNumber: number) => {
      saveHistory()
      tick = quantizer.floor(tick)
      const note: NoteEvent = {
        id: 0,
        type: "channel",
        subtype: "note",
        noteNumber: noteNumber,
        tick,
        velocity: 127,
        duration: pianoRollStore.lastNoteDuration || quantizer.unit
      }
      const added = selectedTrack.addEvent(note)

      player.playNote({
        ...note,
        channel: selectedTrack.channel
      })
      return added.id
    },
    [MOVE_NOTE]: ({
      id,
      tick,
      noteNumber,
      quantize
    }: Pick<NoteEvent, "id" | "tick" | "noteNumber"> & {
      quantize: "floor" | "round" | "ceil"
    }) => {
      const note = selectedTrack.getEventById(id) as NoteEvent
      tick = quantizer[quantize || "floor"](tick)
      const tickChanged = tick !== note.tick
      const pitchChanged = noteNumber !== note.noteNumber

      if (pitchChanged || tickChanged) {
        saveHistory()

        const n = selectedTrack.updateEvent(note.id, {
          tick,
          noteNumber: noteNumber
        }) as NoteEvent

        if (pitchChanged) {
          player.playNote({
            ...n,
            channel: selectedTrack.channel
          })
        }
      }
    },
    [RESIZE_NOTE_LEFT]: (id: number, tick: number) => {
      // 右端を固定して長さを変更
      tick = quantizer.round(tick)
      const note = selectedTrack.getEventById(id) as NoteEvent
      const duration = note.duration + (note.tick - tick)
      if (note.tick !== tick && duration >= quantizer.unit) {
        saveHistory()
        pianoRollStore.lastNoteDuration = duration
        selectedTrack.updateEvent(note.id, { tick, duration })
      }
    },
    [RESIZE_NOTE_RIGHT]: (id: number, tick: number) => {
      const note = selectedTrack.getEventById(id) as NoteEvent
      const right = tick
      const duration = Math.max(
        quantizer.unit,
        quantizer.round(right - note.tick)
      )
      if (note.duration !== duration) {
        saveHistory()
        pianoRollStore.lastNoteDuration = duration
        selectedTrack.updateEvent(note.id, { duration })
      }
    },

    /* track meta */

    [SET_TRACK_NAME]: (name: string) => {
      saveHistory()
      selectedTrack.name = name
    },
    [SET_TRACK_VOLUME]: (trackId: number, volume: number) => {
      saveHistory()
      tracks[trackId].volume = volume
    },
    [SET_TRACK_PAN]: (trackId: number, pan: number) => {
      saveHistory()
      tracks[trackId].pan = pan
    },
    [SET_TRACK_INSTRUMENT]: (trackId: number, programNumber: number) => {
      saveHistory()
      tracks[trackId].programNumber = programNumber
    }
  }
}

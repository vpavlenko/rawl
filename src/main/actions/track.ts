import {
  panMidiEvent,
  volumeMidiEvent,
  setTempoMidiEvent,
  pitchBendMidiEvent,
  modulationMidiEvent,
  expressionMidiEvent,
  programChangeMidiEvent
} from "midi/MidiEvent"
import RootStore from "../stores/RootStore"
import { NoteEvent } from "common/track"

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
  const saveHistory = () => {
    rootStore.pushHistory()
  }

  const updateEvent = (id: number, obj: Partial<TrackEvent>) => {}

  return {
    /* conductor track */

    [CHANGE_TEMPO]: (id: number, microsecondsPerBeat: number) => {
      const track = song.conductorTrack
      if (track === undefined) {
        return
      }
      saveHistory()
      track.updateEvent(id, {
        microsecondsPerBeat: microsecondsPerBeat
      })
    },
    [CREATE_TEMPO]: (tick: number, microsecondsPerBeat: number) => {
      const track = song.conductorTrack
      if (track === undefined) {
        return
      }
      saveHistory()
      const e = {
        ...setTempoMidiEvent(0, Math.round(microsecondsPerBeat)),
        tick: quantizer.round(tick)
      }
      track.createOrUpdate(e)
    },

    /* events */

    [CHANGE_NOTES_VELOCITY]: (notes: NoteEvent[], velocity: number) => {
      const selectedTrack = song.selectedTrack
      if (selectedTrack === undefined) {
        return
      }
      saveHistory()
      selectedTrack.updateEvents(notes.map(item => ({ id: item.id, velocity })))
    },
    [CREATE_PITCH_BEND]: (value: number, tick: number = player.position) => {
      const selectedTrack = song.selectedTrack
      if (selectedTrack === undefined) {
        return
      }
      saveHistory()
      const e = pitchBendMidiEvent(0, 0, Math.round(value))
      selectedTrack.createOrUpdate({ ...e, tick: quantizer.round(tick) })
    },
    [CREATE_VOLUME]: (value: number, tick: number = player.position) => {
      const selectedTrack = song.selectedTrack
      if (selectedTrack === undefined) {
        return
      }
      saveHistory()
      const e = volumeMidiEvent(0, 0, Math.round(value))
      selectedTrack.createOrUpdate({
        ...e,
        tick: quantizer.round(tick)
      })
    },
    [CREATE_PAN]: (value: number, tick: number = player.position) => {
      const selectedTrack = song.selectedTrack
      if (selectedTrack === undefined) {
        return
      }
      saveHistory()
      const e = panMidiEvent(0, 0, Math.round(value))
      selectedTrack.createOrUpdate({ ...e, tick: quantizer.round(tick) })
    },
    [CREATE_MODULATION]: (value: number, tick: number = player.position) => {
      const selectedTrack = song.selectedTrack
      if (selectedTrack === undefined) {
        return
      }
      saveHistory()
      const e = modulationMidiEvent(0, 0, Math.round(value))
      selectedTrack.createOrUpdate({ ...e, tick: quantizer.round(tick) })
    },
    [CREATE_EXPRESSION]: (value: number, tick: number = player.position) => {
      const selectedTrack = song.selectedTrack
      if (selectedTrack === undefined) {
        return
      }
      saveHistory()
      const e = expressionMidiEvent(0, 0, Math.round(value))
      selectedTrack.createOrUpdate({ ...e, tick: quantizer.round(tick) })
    },
    [REMOVE_EVENT]: (eventId: number) => {
      const selectedTrack = song.selectedTrack
      if (selectedTrack === undefined) {
        return
      }
      saveHistory()
      selectedTrack.removeEvent(eventId)
    },

    /* note */

    [CREATE_NOTE]: (tick: number, noteNumber: number) => {
      const selectedTrack = song.selectedTrack
      if (selectedTrack === undefined || selectedTrack.channel == undefined) {
        return
      }
      saveHistory()

      tick = selectedTrack.isRhythmTrack
        ? quantizer.round(tick)
        : quantizer.floor(tick)

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
      const selectedTrack = song.selectedTrack
      if (selectedTrack === undefined || selectedTrack.channel == undefined) {
        return
      }
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
      const selectedTrack = song.selectedTrack
      if (selectedTrack === undefined) {
        return
      }
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
      const selectedTrack = song.selectedTrack
      if (selectedTrack === undefined) {
        return
      }
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
      const selectedTrack = song.selectedTrack
      if (selectedTrack === undefined) {
        return
      }
      saveHistory()
      selectedTrack.setName(name)
    },
    [SET_TRACK_VOLUME]: (trackId: number, volume: number) => {
      saveHistory()
      const track = song.tracks[trackId]
      track.setVolume(volume)

      if (track.channel !== undefined) {
        player.sendEvent(volumeMidiEvent(0, track.channel, volume))
      }
    },
    [SET_TRACK_PAN]: (trackId: number, pan: number) => {
      saveHistory()
      const track = song.tracks[trackId]
      track.setPan(pan)

      if (track.channel !== undefined) {
        player.sendEvent(panMidiEvent(0, track.channel, pan))
      }
    },
    [SET_TRACK_INSTRUMENT]: (trackId: number, programNumber: number) => {
      saveHistory()
      const track = song.tracks[trackId]
      track.setProgramNumber(programNumber)

      // 即座に反映する
      if (track.channel !== undefined) {
        player.sendEvent(
          programChangeMidiEvent(0, track.channel, programNumber)
        )
      }
    }
  }
}

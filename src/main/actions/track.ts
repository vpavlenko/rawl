import {
  panMidiEvent,
  volumeMidiEvent,
  setTempoMidiEvent,
  pitchBendMidiEvent,
  modulationMidiEvent,
  expressionMidiEvent,
  programChangeMidiEvent,
} from "midi/MidiEvent"
import { NoteEvent } from "common/track"
import { Action, Mutator } from "../createDispatcher"

export interface ChangeTempo {
  type: "changeTempo"
  id: number
  microsecondsPerBeat: number
}
export const changeTempo = (
  id: number,
  microsecondsPerBeat: number
): ChangeTempo => ({ type: "changeTempo", id, microsecondsPerBeat })

export interface CreateTempo {
  type: "createTempo"
  tick: number
  microsecondsPerBeat: number
}
export const createTempo = (
  tick: number,
  microsecondsPerBeat: number
): CreateTempo => ({ type: "createTempo", tick, microsecondsPerBeat })

export interface ChangeNotesVelocity {
  type: "changeNotesVelocity"
  noteIds: number[]
  velocity: number
}
export const changeNotesVelocity = (
  noteIds: number[],
  velocity: number
): ChangeNotesVelocity => ({
  type: "changeNotesVelocity",
  noteIds,
  velocity,
})

export interface CreatePitchBend {
  type: "createPitchBend"
  value: number
  tick: number
}
export const createPitchBend = (
  value: number,
  tick: number
): CreatePitchBend => ({
  type: "createPitchBend",
  value,
  tick,
})

export interface CreateVolume {
  type: "createVolume"
  value: number
  tick: number
}
export const createVolume = (value: number, tick: number): CreateVolume => ({
  type: "createVolume",
  value,
  tick,
})

export interface CreatePan {
  type: "createPan"
  value: number
  tick: number
}
export const createPan = (value: number, tick: number): CreatePan => ({
  type: "createPan",
  value,
  tick,
})

export interface CreateModulation {
  type: "createModulation"
  value: number
  tick: number
}
export const createModulation = (
  value: number,
  tick: number
): CreateModulation => ({
  type: "createModulation",
  value,
  tick,
})

export interface CreateExpression {
  type: "createExpression"
  value: number
  tick: number
}
export const createExpression = (
  value: number,
  tick: number
): CreateExpression => ({
  type: "createExpression",
  value,
  tick,
})

export interface RemoveEvent {
  type: "removeEvent"
  eventId: number
}
export const removeEvent = (eventId: number): RemoveEvent => ({
  type: "removeEvent",
  eventId,
})

export interface CreateNote {
  type: "createNote"
  tick: number
  noteNumber: number
}
export const createNote = (tick: number, noteNumber: number): CreateNote => ({
  type: "createNote",
  tick,
  noteNumber,
})

export type MoveNote = {
  type: "moveNote"
  quantize: "floor" | "round" | "ceil"
} & Pick<NoteEvent, "id" | "tick" | "noteNumber">
export const moveNote = (params: Omit<MoveNote, "type">): MoveNote => ({
  type: "moveNote",
  ...params,
})

export interface ResizeNoteLeft {
  type: "resizeNoteLeft"
  id: number
  tick: number
}
export const resizeNoteLeft = (id: number, tick: number): ResizeNoteLeft => ({
  type: "resizeNoteLeft",
  id,
  tick,
})

export interface ResizeNoteRight {
  type: "resizeNoteRight"
  id: number
  tick: number
}
export const resizeNoteRight = (id: number, tick: number): ResizeNoteRight => ({
  type: "resizeNoteRight",
  id,
  tick,
})

export interface SetTrackName {
  type: "setTrackName"
  name: string
}
export const setTrackName = (name: string): SetTrackName => ({
  type: "setTrackName",
  name,
})

export interface SetTrackVolume {
  type: "setTrackVolume"
  trackId: number
  volume: number
}
export const setTrackVolume = (
  trackId: number,
  volume: number
): SetTrackVolume => ({ type: "setTrackVolume", trackId, volume })

export interface SetTrackPan {
  type: "setTrackPan"
  trackId: number
  pan: number
}
export const setTrackPan = (trackId: number, pan: number): SetTrackPan => ({
  type: "setTrackPan",
  trackId,
  pan,
})

export interface SetTrackInstrument {
  type: "setTrackInstrument"
  trackId: number
  programNumber: number
}
export const setTrackInstrument = (
  trackId: number,
  programNumber: number
): SetTrackInstrument => ({
  type: "setTrackInstrument",
  trackId,
  programNumber,
})

export type TrackAction =
  | ChangeTempo
  | CreateTempo
  | ChangeNotesVelocity
  | CreatePitchBend
  | CreateVolume
  | CreatePan
  | CreateModulation
  | CreateExpression
  | RemoveEvent
  | CreateNote
  | MoveNote
  | ResizeNoteLeft
  | ResizeNoteRight
  | SetTrackName
  | SetTrackVolume
  | SetTrackPan
  | SetTrackInstrument

export default (action: Action): Mutator | null => {
  const updateEvent = (id: number, obj: Partial<TrackEvent>) => {}

  switch (action.type) {
    /* conductor track */

    case "changeTempo":
      return ({ song, pushHistory }) => {
        const track = song.conductorTrack
        if (track === undefined) {
          return
        }
        pushHistory()
        track.updateEvent(action.id, {
          microsecondsPerBeat: action.microsecondsPerBeat,
        })
      }
    case "createTempo":
      return ({ song, services: { quantizer }, pushHistory }) => {
        const track = song.conductorTrack
        if (track === undefined) {
          return
        }
        pushHistory()
        const e = {
          ...setTempoMidiEvent(0, Math.round(action.microsecondsPerBeat)),
          tick: quantizer.round(action.tick),
        }
        track.createOrUpdate(e)
      }

    /* events */

    case "changeNotesVelocity":
      return ({ song, pushHistory }) => {
        const selectedTrack = song.selectedTrack
        if (selectedTrack === undefined) {
          return
        }
        pushHistory()
        selectedTrack.updateEvents(
          action.noteIds.map((id) => ({
            id,
            velocity: action.velocity,
          }))
        )
      }
    case "createPitchBend":
      return ({ song, pushHistory, services: { quantizer } }) => {
        const selectedTrack = song.selectedTrack
        if (selectedTrack === undefined) {
          return
        }
        pushHistory()
        const e = pitchBendMidiEvent(0, 0, Math.round(action.value))
        selectedTrack.createOrUpdate({
          ...e,
          tick: quantizer.round(action.tick),
        })
      }
    case "createVolume":
      return ({ song, pushHistory, services: { quantizer } }) => {
        const selectedTrack = song.selectedTrack
        if (selectedTrack === undefined) {
          return
        }
        pushHistory()
        const e = volumeMidiEvent(0, 0, Math.round(action.value))
        selectedTrack.createOrUpdate({
          ...e,
          tick: quantizer.round(action.tick),
        })
      }
    case "createPan":
      return ({ song, pushHistory, services: { quantizer } }) => {
        const selectedTrack = song.selectedTrack
        if (selectedTrack === undefined) {
          return
        }
        pushHistory()
        const e = panMidiEvent(0, 0, Math.round(action.value))
        selectedTrack.createOrUpdate({
          ...e,
          tick: quantizer.round(action.tick),
        })
      }
    case "createModulation":
      return ({ song, pushHistory, services: { quantizer } }) => {
        const selectedTrack = song.selectedTrack
        if (selectedTrack === undefined) {
          return
        }
        pushHistory()
        const e = modulationMidiEvent(0, 0, Math.round(action.value))
        selectedTrack.createOrUpdate({
          ...e,
          tick: quantizer.round(action.tick),
        })
      }
    case "createExpression":
      return ({ song, pushHistory, services: { quantizer } }) => {
        const selectedTrack = song.selectedTrack
        if (selectedTrack === undefined) {
          return
        }
        pushHistory()
        const e = expressionMidiEvent(0, 0, Math.round(action.value))
        selectedTrack.createOrUpdate({
          ...e,
          tick: quantizer.round(action.tick),
        })
      }
    case "removeEvent":
      return ({ song, pushHistory }) => {
        const selectedTrack = song.selectedTrack
        if (selectedTrack === undefined) {
          return
        }
        pushHistory()
        selectedTrack.removeEvent(action.eventId)
      }

    /* note */

    case "createNote":
      return ({
        song,
        pianoRollStore,
        services: { player, quantizer },
        pushHistory,
      }) => {
        const selectedTrack = song.selectedTrack
        if (selectedTrack === undefined || selectedTrack.channel == undefined) {
          return
        }
        pushHistory()

        const tick = selectedTrack.isRhythmTrack
          ? quantizer.round(action.tick)
          : quantizer.floor(action.tick)

        const note: NoteEvent = {
          id: 0,
          type: "channel",
          subtype: "note",
          noteNumber: action.noteNumber,
          tick,
          velocity: 127,
          duration: pianoRollStore.lastNoteDuration || quantizer.unit,
        }
        const added = selectedTrack.addEvent(note)

        player.playNote({
          ...note,
          channel: selectedTrack.channel,
        })
        return added.id
      }
    case "moveNote":
      return ({ song, pushHistory, services: { player, quantizer } }) => {
        const selectedTrack = song.selectedTrack
        if (selectedTrack === undefined || selectedTrack.channel == undefined) {
          return
        }
        const note = selectedTrack.getEventById(action.id) as NoteEvent
        const tick = quantizer[action.quantize || "floor"](action.tick)
        const tickChanged = tick !== note.tick
        const pitchChanged = action.noteNumber !== note.noteNumber

        if (pitchChanged || tickChanged) {
          pushHistory()

          const n = selectedTrack.updateEvent(note.id, {
            tick,
            noteNumber: action.noteNumber,
          }) as NoteEvent

          if (pitchChanged) {
            player.playNote({
              ...n,
              channel: selectedTrack.channel,
            })
          }
        }
      }
    case "resizeNoteLeft":
      return ({
        song,
        pianoRollStore,
        services: { quantizer },
        pushHistory,
      }) => {
        const selectedTrack = song.selectedTrack
        if (selectedTrack === undefined) {
          return
        }
        // 右端を固定して長さを変更
        const tick = quantizer.round(action.tick)
        const note = selectedTrack.getEventById(action.id) as NoteEvent
        const duration = note.duration + (note.tick - tick)
        if (note.tick !== tick && duration >= quantizer.unit) {
          pushHistory()
          pianoRollStore.lastNoteDuration = duration
          selectedTrack.updateEvent(note.id, { tick, duration })
        }
      }
    case "resizeNoteRight":
      return ({
        song,
        pianoRollStore,
        services: { quantizer },
        pushHistory,
      }) => {
        const selectedTrack = song.selectedTrack
        if (selectedTrack === undefined) {
          return
        }
        const note = selectedTrack.getEventById(action.id) as NoteEvent
        const right = action.tick
        const duration = Math.max(
          quantizer.unit,
          quantizer.round(right - note.tick)
        )
        if (note.duration !== duration) {
          pushHistory()
          pianoRollStore.lastNoteDuration = duration
          selectedTrack.updateEvent(note.id, { duration })
        }
      }

    /* track meta */

    case "setTrackName":
      return ({ song, pushHistory }) => {
        const selectedTrack = song.selectedTrack
        if (selectedTrack === undefined) {
          return
        }
        pushHistory()
        selectedTrack.setName(name)
      }
    case "setTrackVolume":
      return ({ song, pushHistory, services: { player } }) => {
        pushHistory()
        const track = song.tracks[action.trackId]
        track.setVolume(action.volume)

        if (track.channel !== undefined) {
          player.sendEvent(volumeMidiEvent(0, track.channel, action.volume))
        }
      }
    case "setTrackPan":
      return ({ song, pushHistory, services: { player } }) => {
        pushHistory()
        const track = song.tracks[action.trackId]
        track.setPan(action.pan)

        if (track.channel !== undefined) {
          player.sendEvent(panMidiEvent(0, track.channel, action.pan))
        }
      }
    case "setTrackInstrument":
      return ({ song, pushHistory, services: { player } }) => {
        pushHistory()
        const track = song.tracks[action.trackId]
        track.setProgramNumber(action.programNumber)

        // 即座に反映する
        if (track.channel !== undefined) {
          player.sendEvent(
            programChangeMidiEvent(0, track.channel, action.programNumber)
          )
        }
      }
  }
  return null
}

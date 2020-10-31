import {
  expressionMidiEvent,
  modulationMidiEvent,
  panMidiEvent,
  pitchBendMidiEvent,
  programChangeMidiEvent,
  setTempoMidiEvent,
  volumeMidiEvent,
} from "../../common/midi/MidiEvent"
import { NoteEvent, TrackMidiEvent } from "../../common/track"
import { ControlMode } from "../components/ControlPane/ControlPane"
import RootStore from "../stores/RootStore"
import {
  moveSelectionBy,
  resizeNotesInSelectionLeftBy,
  resizeNotesInSelectionRightBy,
} from "./selection"

export const changeTempo = (rootStore: RootStore) => (
  id: number,
  microsecondsPerBeat: number
) => {
  const { song } = rootStore

  const track = song.conductorTrack
  if (track === undefined) {
    return
  }
  rootStore.pushHistory()
  track.updateEvent(id, {
    microsecondsPerBeat: microsecondsPerBeat,
  })
}

export const createTempo = (rootStore: RootStore) => (
  tick: number,
  microsecondsPerBeat: number
) => {
  const {
    song,
    services: { quantizer },
    pushHistory,
  } = rootStore

  const track = song.conductorTrack
  if (track === undefined) {
    return
  }
  rootStore.pushHistory()
  const e = {
    ...setTempoMidiEvent(0, Math.round(microsecondsPerBeat)),
    tick: quantizer.round(tick),
  }
  track.createOrUpdate(e)
}

/* events */

export const changeNotesVelocity = (rootStore: RootStore) => (
  noteIds: number[],
  velocity: number
) => {
  const { song } = rootStore

  const selectedTrack = song.selectedTrack
  if (selectedTrack === undefined) {
    return
  }
  rootStore.pushHistory()
  selectedTrack.updateEvents(
    noteIds.map((id) => ({
      id,
      velocity: velocity,
    }))
  )
}

const createEvent = (rootStore: RootStore) => <T extends TrackMidiEvent>(
  e: T,
  tick?: number
) => {
  const {
    song,
    pushHistory,
    services: { quantizer, player },
  } = rootStore

  const selectedTrack = song.selectedTrack
  if (selectedTrack === undefined) {
    return
  }
  rootStore.pushHistory()
  selectedTrack.createOrUpdate({
    ...e,
    tick: quantizer.round(tick ?? player.position),
  })
}

export const createPitchBend = (rootStore: RootStore) => (
  value: number,
  tick?: number
) => {
  const e = pitchBendMidiEvent(0, 0, Math.round(value))
  createEvent(rootStore)(e, tick)
}

export const createVolume = (rootStore: RootStore) => (
  value: number,
  tick?: number
) => {
  const e = volumeMidiEvent(0, 0, Math.round(value))
  createEvent(rootStore)(e, tick)
}

export const createPan = (rootStore: RootStore) => (
  value: number,
  tick?: number
) => {
  const e = panMidiEvent(0, 0, Math.round(value))
  createEvent(rootStore)(e, tick)
}

export const createModulation = (rootStore: RootStore) => (
  value: number,
  tick?: number
) => {
  const e = modulationMidiEvent(0, 0, Math.round(value))
  createEvent(rootStore)(e, tick)
}

export const createExpression = (rootStore: RootStore) => (
  value: number,
  tick?: number
) => {
  const e = expressionMidiEvent(0, 0, Math.round(value))
  createEvent(rootStore)(e, tick)
}

export const createControlEvent = (rootStore: RootStore) => (
  mode: ControlMode,
  value: number,
  tick?: number
) => {
  const action = (() => {
    switch (mode) {
      case "volume":
        return createVolume
      case "pitchBend":
        return createPitchBend
      case "pan":
        return createPan
      case "modulation":
        return createModulation
      case "expression":
        return createExpression
      case "velocity":
        throw new Error("invalid type")
    }
  })()
  action(rootStore)(value, tick)
}

export const removeEvent = (rootStore: RootStore) => (eventId: number) => {
  const { song } = rootStore

  const selectedTrack = song.selectedTrack
  if (selectedTrack === undefined) {
    return
  }
  rootStore.pushHistory()
  selectedTrack.removeEvent(eventId)
}

/* note */

export const createNote = (rootStore: RootStore) => (
  tick: number,
  noteNumber: number
) => {
  const {
    song,
    pianoRollStore,
    services: { player, quantizer },
    pushHistory,
  } = rootStore
  const selectedTrack = song.selectedTrack
  if (selectedTrack === undefined || selectedTrack.channel == undefined) {
    return
  }
  rootStore.pushHistory()

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
    duration: pianoRollStore.lastNoteDuration || quantizer.unit,
  }
  const added = selectedTrack.addEvent(note)

  player.playNote({
    ...note,
    channel: selectedTrack.channel,
  })
  return added.id
}

export type MoveNote = {
  type: "moveNote"
  quantize: "floor" | "round" | "ceil"
} & Pick<NoteEvent, "id" | "tick" | "noteNumber">

export const moveNote = (rootStore: RootStore) => (
  params: Omit<MoveNote, "type">
) => {
  const {
    song,
    services: { player, quantizer },
  } = rootStore

  const selectedTrack = song.selectedTrack
  if (selectedTrack === undefined || selectedTrack.channel == undefined) {
    return
  }
  const note = selectedTrack.getEventById(params.id) as NoteEvent
  const tick = quantizer[params.quantize || "floor"](params.tick)
  const tickChanged = tick !== note.tick
  const pitchChanged = params.noteNumber !== note.noteNumber

  if (pitchChanged || tickChanged) {
    moveSelectionBy(rootStore)({
      tick: tick - note.tick,
      noteNumber: params.noteNumber - note.noteNumber,
    })

    if (pitchChanged) {
      player.playNote({
        ...note,
        noteNumber: params.noteNumber,
        channel: selectedTrack.channel,
      })
    }
  }
}
export const resizeNoteLeft = (rootStore: RootStore) => (
  id: number,
  tick: number
) => {
  const {
    song,
    pianoRollStore,
    services: { quantizer },
  } = rootStore
  const selectedTrack = song.selectedTrack
  if (selectedTrack === undefined) {
    return
  }
  // 右端を固定して長さを変更
  tick = quantizer.round(tick)
  const note = selectedTrack.getEventById(id) as NoteEvent
  const duration = note.duration + (note.tick - tick)
  if (note.tick !== tick && duration >= quantizer.unit) {
    rootStore.pushHistory()
    pianoRollStore.lastNoteDuration = duration
    resizeNotesInSelectionLeftBy(rootStore)(tick - note.tick)
  }
}

export const resizeNoteRight = (rootStore: RootStore) => (
  id: number,
  tick: number
) => {
  const {
    song,
    pianoRollStore,
    services: { quantizer },
  } = rootStore
  const selectedTrack = song.selectedTrack
  if (selectedTrack === undefined) {
    return
  }
  const note = selectedTrack.getEventById(id) as NoteEvent
  const right = tick
  const duration = Math.max(quantizer.unit, quantizer.round(right - note.tick))
  if (note.duration !== duration) {
    rootStore.pushHistory()
    pianoRollStore.lastNoteDuration = duration
    resizeNotesInSelectionRightBy(rootStore)(duration - note.duration)
  }
}

/* track meta */

export const setTrackName = (rootStore: RootStore) => (name: string) => {
  const { song } = rootStore

  const selectedTrack = song.selectedTrack
  if (selectedTrack === undefined) {
    return
  }
  rootStore.pushHistory()
  selectedTrack.setName(name)
}

export const setTrackVolume = (rootStore: RootStore) => (
  trackId: number,
  volume: number
) => {
  const {
    song,
    pushHistory,
    services: { player },
  } = rootStore

  rootStore.pushHistory()
  const track = song.tracks[trackId]
  track.setVolume(volume, player.position)

  if (track.channel !== undefined) {
    player.sendEvent(volumeMidiEvent(0, track.channel, volume))
  }
}

export const setTrackPan = (rootStore: RootStore) => (
  trackId: number,
  pan: number
) => {
  const {
    song,
    pushHistory,
    services: { player },
  } = rootStore

  rootStore.pushHistory()
  const track = song.tracks[trackId]
  track.setPan(pan, player.position)

  if (track.channel !== undefined) {
    player.sendEvent(panMidiEvent(0, track.channel, pan))
  }
}

export const setTrackInstrument = (rootStore: RootStore) => (
  trackId: number,
  programNumber: number
) => {
  const {
    song,
    pushHistory,
    services: { player },
  } = rootStore

  rootStore.pushHistory()
  const track = song.tracks[trackId]
  track.setProgramNumber(programNumber)

  // 即座に反映する
  if (track.channel !== undefined) {
    player.sendEvent(programChangeMidiEvent(0, track.channel, programNumber))
  }
}

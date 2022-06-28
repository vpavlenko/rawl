import { AnyChannelEvent, AnyEvent, SetTempoEvent } from "midifile-ts"
import { closedRange } from "../../common/helpers/array"
import {
  createValueEvent,
  isValueEvent,
  ValueEventType,
} from "../../common/helpers/valueEvent"
import {
  panMidiEvent,
  programChangeMidiEvent,
  timeSignatureMidiEvent,
  volumeMidiEvent,
} from "../../common/midi/MidiEvent"
import Quantizer from "../../common/quantizer"
import { getMeasureStart } from "../../common/song/selector"
import Track, {
  isNoteEvent,
  NoteEvent,
  TrackEvent,
  TrackEventOf,
} from "../../common/track"
import RootStore from "../stores/RootStore"
import { pushHistory } from "./history"
import {
  resizeNotesInSelectionLeftBy,
  resizeNotesInSelectionRightBy,
} from "./selection"

export const changeTempo =
  (rootStore: RootStore) => (id: number, microsecondsPerBeat: number) => {
    const { song } = rootStore

    const track = song.conductorTrack
    if (track === undefined) {
      return
    }
    pushHistory(rootStore)()
    track.updateEvent<TrackEventOf<SetTempoEvent>>(id, {
      microsecondsPerBeat: microsecondsPerBeat,
    })
  }

/* events */

export const changeNotesVelocity =
  (rootStore: RootStore) => (noteIds: number[], velocity: number) => {
    const { song } = rootStore

    const selectedTrack = song.selectedTrack
    if (selectedTrack === undefined) {
      return
    }
    pushHistory(rootStore)()
    selectedTrack.updateEvents(
      noteIds.map((id) => ({
        id,
        velocity: velocity,
      }))
    )
  }

export const createEvent =
  (rootStore: RootStore) => (e: AnyChannelEvent, tick?: number) => {
    const {
      song,
      player,
      pianoRollStore: { quantizer },
    } = rootStore

    const selectedTrack = song.selectedTrack
    if (selectedTrack === undefined) {
      throw new Error("selected track is undefined")
    }
    pushHistory(rootStore)()
    const id = selectedTrack.createOrUpdate({
      ...e,
      tick: quantizer.round(tick ?? player.position),
    }).id

    // 即座に反映する
    // Reflect immediately
    if (tick !== undefined) {
      rootStore.player.sendEvent(e)
    }

    return id
  }

// Update controller events in the range with linear interpolation values
export const updateEventsInRange =
  (
    track: Track | undefined,
    quantizer: Quantizer,
    filterEvent: (e: TrackEvent) => boolean,
    createEvent: (value: number) => AnyEvent
  ) =>
  (
    startValue: number,
    endValue: number,
    startTick: number,
    endTick: number
  ) => {
    if (track === undefined) {
      throw new Error("track is undefined")
    }

    const minTick = Math.min(startTick, endTick)
    const maxTick = Math.max(startTick, endTick)
    const _startTick = quantizer.floor(Math.max(0, minTick))
    const _endTick = quantizer.floor(Math.max(0, maxTick))

    const minValue = Math.min(startValue, endValue)
    const maxValue = Math.max(startValue, endValue)

    // linear interpolate
    const getValue =
      endTick === startTick
        ? (_tick: number) => endValue
        : (tick: number) =>
            Math.floor(
              Math.min(
                maxValue,
                Math.max(
                  minValue,
                  ((tick - startTick) / (endTick - startTick)) *
                    (endValue - startValue) +
                    startValue
                )
              )
            )

    // Delete events in the dragged area
    const events = track.events.filter(filterEvent).filter(
      (e) =>
        // to prevent remove the event created previously, do not remove the event placed at startTick
        e.tick !== startTick &&
        e.tick >= Math.min(minTick, _startTick) &&
        e.tick <= Math.max(maxTick, _endTick)
    )

    track.transaction((it) => {
      it.removeEvents(events.map((e) => e.id))

      const newEvents = closedRange(_startTick, _endTick, quantizer.unit).map(
        (tick) => ({
          ...createEvent(getValue(tick)),
          tick,
        })
      )

      it.addEvents(newEvents)
    })
  }

export const updateValueEvents =
  (type: ValueEventType) => (rootStore: RootStore) =>
    updateEventsInRange(
      rootStore.song.selectedTrack,
      rootStore.pianoRollStore.quantizer,
      isValueEvent(type),
      createValueEvent(type)
    )

export const removeEvent = (rootStore: RootStore) => (eventId: number) => {
  const { song } = rootStore

  const selectedTrack = song.selectedTrack
  if (selectedTrack === undefined) {
    return
  }
  pushHistory(rootStore)()
  selectedTrack.removeEvent(eventId)
}

/* note */

export const createNote =
  (rootStore: RootStore) => (tick: number, noteNumber: number) => {
    const {
      song,
      pianoRollStore,
      player,
      pianoRollStore: { quantizer },
    } = rootStore
    const selectedTrack = song.selectedTrack
    if (selectedTrack === undefined || selectedTrack.channel == undefined) {
      return
    }
    pushHistory(rootStore)()

    tick = selectedTrack.isRhythmTrack
      ? quantizer.round(tick)
      : quantizer.floor(tick)

    const note: Omit<NoteEvent, "id"> = {
      type: "channel",
      subtype: "note",
      noteNumber: noteNumber,
      tick,
      velocity: 127,
      duration: pianoRollStore.lastNoteDuration || quantizer.unit,
    }
    const added = selectedTrack.addEvent(note)

    player.startNote({
      ...note,
      channel: selectedTrack.channel,
    })
    return added
  }

export const muteNote = (rootStore: RootStore) => (noteNumber: number) => {
  const { song, player } = rootStore
  const selectedTrack = song.selectedTrack
  if (selectedTrack === undefined || selectedTrack.channel == undefined) {
    return
  }
  player.stopNote({ channel: selectedTrack.channel, noteNumber })
}

const MIN_DURATION = 10

export const resizeNoteLeft =
  (rootStore: RootStore) => (id: number, tick: number, quantize: boolean) => {
    const {
      song,
      pianoRollStore,
      pianoRollStore: { quantizer },
    } = rootStore
    const selectedTrack = song.selectedTrack
    if (selectedTrack === undefined) {
      return
    }
    // 右端を固定して長さを変更
    // Fix the right end and change the length
    if (quantize) {
      tick = quantizer.round(tick)
    }
    const note = selectedTrack.getEventById(id)
    if (note == undefined || !isNoteEvent(note)) {
      return null
    }
    const duration = note.duration + (note.tick - tick)
    const minDuration = quantize ? quantizer.unit : MIN_DURATION
    if (note.tick !== tick && duration >= minDuration) {
      pushHistory(rootStore)()
      pianoRollStore.lastNoteDuration = duration
      resizeNotesInSelectionLeftBy(rootStore)(tick - note.tick)
    }
  }

export const resizeNoteRight =
  (rootStore: RootStore) => (id: number, tick: number, quantize: boolean) => {
    const {
      song,
      pianoRollStore,
      pianoRollStore: { quantizer },
    } = rootStore
    const selectedTrack = song.selectedTrack
    if (selectedTrack === undefined) {
      return
    }
    const note = selectedTrack.getEventById(id)
    if (note == undefined || !isNoteEvent(note)) {
      return null
    }
    const right = quantize ? quantizer.round(tick) : tick
    const minDuration = quantize ? quantizer.unit : MIN_DURATION
    const duration = Math.max(minDuration, right - note.tick)
    if (note.duration !== duration) {
      pushHistory(rootStore)()
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
  pushHistory(rootStore)()
  selectedTrack.setName(name)
}

export const setTrackVolume =
  (rootStore: RootStore) => (trackId: number, volume: number) => {
    const { song, player } = rootStore

    pushHistory(rootStore)()
    const track = song.tracks[trackId]
    track.setVolume(volume, player.position)

    if (track.channel !== undefined) {
      player.sendEvent(volumeMidiEvent(0, track.channel, volume))
    }
  }

export const setTrackPan =
  (rootStore: RootStore) => (trackId: number, pan: number) => {
    const { song, player } = rootStore

    pushHistory(rootStore)()
    const track = song.tracks[trackId]
    track.setPan(pan, player.position)

    if (track.channel !== undefined) {
      player.sendEvent(panMidiEvent(0, track.channel, pan))
    }
  }

export const setTrackInstrument =
  (rootStore: RootStore) => (trackId: number, programNumber: number) => {
    const { song, player } = rootStore

    pushHistory(rootStore)()
    const track = song.tracks[trackId]
    track.setProgramNumber(programNumber)

    // 即座に反映する
    // Reflect immediately
    if (track.channel !== undefined) {
      player.sendEvent(programChangeMidiEvent(0, track.channel, programNumber))
    }
  }

export const toogleGhostTrack = (rootStore: RootStore) => (trackId: number) => {
  const { pianoRollStore } = rootStore

  pushHistory(rootStore)()
  if (pianoRollStore.notGhostTracks.has(trackId)) {
    pianoRollStore.notGhostTracks.delete(trackId)
  } else {
    pianoRollStore.notGhostTracks.add(trackId)
  }
}

export const toogleAllGhostTracks = (rootStore: RootStore) => () => {
  const { pianoRollStore } = rootStore

  pushHistory(rootStore)()
  if (
    pianoRollStore.notGhostTracks.size >
    Math.floor(rootStore.song.tracks.length / 2)
  ) {
    pianoRollStore.notGhostTracks = new Set()
  } else {
    for (let i = 0; i < rootStore.song.tracks.length; ++i) {
      pianoRollStore.notGhostTracks.add(i)
    }
  }
}

export const addTimeSignature =
  (rootStore: RootStore) =>
  (tick: number, numerator: number, denominator: number) => {
    const { song } = rootStore

    const measureStart = getMeasureStart(song, tick)

    const timeSignatureTick = measureStart?.tick ?? 0

    // prevent duplication
    if (
      measureStart !== null &&
      measureStart.timeSignature.tick === measureStart.tick
    ) {
      return
    }

    pushHistory(rootStore)()

    rootStore.song.conductorTrack?.addEvent({
      ...timeSignatureMidiEvent(0, numerator, denominator),
      tick: timeSignatureTick,
    })
  }

export const updateTimeSignature =
  (rootStore: RootStore) =>
  (id: number, numerator: number, denominator: number) => {
    pushHistory(rootStore)()

    rootStore.song.conductorTrack?.updateEvent(id, {
      numerator,
      denominator,
    })
  }

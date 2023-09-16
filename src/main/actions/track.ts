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
  ({ song, pushHistory }: RootStore) =>
  (id: number, microsecondsPerBeat: number) => {
    const track = song.conductorTrack
    if (track === undefined) {
      return
    }
    pushHistory()
    track.updateEvent<TrackEventOf<SetTempoEvent>>(id, {
      microsecondsPerBeat: microsecondsPerBeat,
    })
  }

/* events */

export const changeNotesVelocity =
  ({ pianoRollStore: { selectedTrack }, pushHistory }: RootStore) =>
  (noteIds: number[], velocity: number) => {
    if (selectedTrack === undefined) {
      return
    }
    pushHistory()
    selectedTrack.updateEvents(
      noteIds.map((id) => ({
        id,
        velocity: velocity,
      })),
    )
  }

export const createEvent =
  ({
    player,
    pianoRollStore: { quantizer, selectedTrack },
    pushHistory,
  }: RootStore) =>
  (e: AnyChannelEvent, tick?: number) => {
    if (selectedTrack === undefined) {
      throw new Error("selected track is undefined")
    }
    pushHistory()
    const id = selectedTrack.createOrUpdate({
      ...e,
      tick: quantizer.round(tick ?? player.position),
    }).id

    // 即座に反映する
    // Reflect immediately
    if (tick !== undefined) {
      player.sendEvent(e)
    }

    return id
  }

// Update controller events in the range with linear interpolation values
export const updateEventsInRange =
  (
    track: Track | undefined,
    quantizer: Quantizer,
    filterEvent: (e: TrackEvent) => boolean,
    createEvent: (value: number) => AnyEvent,
  ) =>
  (
    startValue: number,
    endValue: number,
    startTick: number,
    endTick: number,
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
                    startValue,
                ),
              ),
            )

    // Delete events in the dragged area
    const events = track.events.filter(filterEvent).filter(
      (e) =>
        // to prevent remove the event created previously, do not remove the event placed at startTick
        e.tick !== startTick &&
        e.tick >= Math.min(minTick, _startTick) &&
        e.tick <= Math.max(maxTick, _endTick),
    )

    track.transaction((it) => {
      it.removeEvents(events.map((e) => e.id))

      const newEvents = closedRange(_startTick, _endTick, quantizer.unit).map(
        (tick) => ({
          ...createEvent(getValue(tick)),
          tick,
        }),
      )

      it.addEvents(newEvents)
    })
  }

export const updateValueEvents =
  (type: ValueEventType) =>
  ({ pianoRollStore }: RootStore) =>
    updateEventsInRange(
      pianoRollStore.selectedTrack,
      pianoRollStore.quantizer,
      isValueEvent(type),
      createValueEvent(type),
    )

export const removeEvent =
  ({ pianoRollStore: { selectedTrack }, pushHistory }: RootStore) =>
  (eventId: number) => {
    if (selectedTrack === undefined) {
      return
    }
    pushHistory()
    selectedTrack.removeEvent(eventId)
  }

/* note */

export const createNote =
  ({
    pianoRollStore,
    pianoRollStore: { quantizer, selectedTrack },
    pushHistory,
    song,
  }: RootStore) =>
  (tick: number, noteNumber: number) => {
    if (selectedTrack === undefined || selectedTrack.channel == undefined) {
      return
    }
    pushHistory()

    tick = selectedTrack.isRhythmTrack
      ? quantizer.round(tick)
      : quantizer.floor(tick)

    const duration = selectedTrack.isRhythmTrack
      ? song.timebase / 8 // 32th note in the rhythm track
      : pianoRollStore.lastNoteDuration ?? quantizer.unit

    const note: Omit<NoteEvent, "id"> = {
      type: "channel",
      subtype: "note",
      noteNumber: noteNumber,
      tick,
      velocity: 127,
      duration,
    }

    return selectedTrack.addEvent(note)
  }

export const muteNote =
  ({ player, pianoRollStore: { selectedTrack } }: RootStore) =>
  (noteNumber: number) => {
    if (selectedTrack === undefined || selectedTrack.channel == undefined) {
      return
    }
    player.stopNote({ channel: selectedTrack.channel, noteNumber })
  }

const MIN_DURATION = 10

export const resizeNoteLeft =
  (rootStore: RootStore) => (id: number, tick: number, quantize: boolean) => {
    const {
      pianoRollStore,
      pianoRollStore: { quantizer, selectedTrack },
    } = rootStore
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
      pianoRollStore,
      pianoRollStore: { quantizer, selectedTrack },
    } = rootStore
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

export const setTrackName =
  ({ pianoRollStore: { selectedTrack }, pushHistory }: RootStore) =>
  (name: string) => {
    if (selectedTrack === undefined) {
      return
    }
    pushHistory()
    selectedTrack.setName(name)
  }

export const setTrackVolume =
  ({ song, player, pushHistory }: RootStore) =>
  (trackId: number, volume: number) => {
    pushHistory()
    const track = song.tracks[trackId]
    track.setVolume(volume, player.position)

    if (track.channel !== undefined) {
      player.sendEvent(volumeMidiEvent(0, track.channel, volume))
    }
  }

export const setTrackPan =
  ({ song, player, pushHistory }: RootStore) =>
  (trackId: number, pan: number) => {
    pushHistory()
    const track = song.tracks[trackId]
    track.setPan(pan, player.position)

    if (track.channel !== undefined) {
      player.sendEvent(panMidiEvent(0, track.channel, pan))
    }
  }

export const setTrackInstrument =
  ({ song, player, pushHistory }: RootStore) =>
  (trackId: number, programNumber: number) => {
    pushHistory()
    const track = song.tracks[trackId]
    track.setProgramNumber(programNumber)

    // 即座に反映する
    // Reflect immediately
    if (track.channel !== undefined) {
      player.sendEvent(programChangeMidiEvent(0, track.channel, programNumber))
    }
  }

export const toogleGhostTrack =
  ({ pianoRollStore, pushHistory }: RootStore) =>
  (trackId: number) => {
    pushHistory()
    if (pianoRollStore.notGhostTracks.has(trackId)) {
      pianoRollStore.notGhostTracks.delete(trackId)
    } else {
      pianoRollStore.notGhostTracks.add(trackId)
    }
  }

export const toogleAllGhostTracks =
  ({ song, pianoRollStore, pushHistory }: RootStore) =>
  () => {
    pushHistory()
    if (
      pianoRollStore.notGhostTracks.size > Math.floor(song.tracks.length / 2)
    ) {
      pianoRollStore.notGhostTracks = new Set()
    } else {
      for (let i = 0; i < song.tracks.length; ++i) {
        pianoRollStore.notGhostTracks.add(i)
      }
    }
  }

export const addTimeSignature =
  ({ song, pushHistory }: RootStore) =>
  (tick: number, numerator: number, denominator: number) => {
    const measureStart = getMeasureStart(song, tick)

    const timeSignatureTick = measureStart?.tick ?? 0

    // prevent duplication
    if (
      measureStart !== null &&
      measureStart.timeSignature.tick === measureStart.tick
    ) {
      return
    }

    pushHistory()

    song.conductorTrack?.addEvent({
      ...timeSignatureMidiEvent(0, numerator, denominator),
      tick: timeSignatureTick,
    })
  }

export const updateTimeSignature =
  ({ song, pushHistory }: RootStore) =>
  (id: number, numerator: number, denominator: number) => {
    pushHistory()
    song.conductorTrack?.updateEvent(id, {
      numerator,
      denominator,
    })
  }

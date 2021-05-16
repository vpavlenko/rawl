import { isNoteEvent } from "../../common/track/identify"
import RootStore from "../stores/RootStore"

export const play = (rootStore: RootStore) => () => {
  const {
    services: { player },
  } = rootStore
  if (player.isPlaying) {
    player.stop()
  } else {
    player.play()
  }
}

export const stop = (rootStore: RootStore) => () => {
  const {
    services: { player },
  } = rootStore
  if (player.isPlaying) {
    player.stop()
  } else {
    player.stop()
    player.position = 0
  }
}

export const setPlayerPosition = (rootStore: RootStore) => (tick: number) => {
  const {
    services: { player, quantizer },
  } = rootStore
  player.position = quantizer.round(tick)
}

const defaultTimeSignature = {
  numerator: 4,
  denominator: 4,
  tick: 0,
}

export const rewindOneBar = (rootStore: RootStore) => () => {
  const {
    song,
    services: { player },
  } = rootStore
  const e =
    song.conductorTrack?.getTimeSignatureEvent(player.position) ??
    defaultTimeSignature
  const ticksPerMeasure = ((player.timebase * 4) / e.denominator) * e.numerator
  const measures = (player.position - e.tick) / ticksPerMeasure
  const fixedMeasures = Math.floor(measures)

  // move to the beginning of current measure
  // or if already there (smaller than 1 beat) we further rewind
  const beginMeasureTick = e.tick + ticksPerMeasure * fixedMeasures
  if (measures - fixedMeasures >= 1 / e.denominator) {
    player.position = beginMeasureTick
  } else if (beginMeasureTick !== e.tick) {
    // same time signature
    player.position = beginMeasureTick - ticksPerMeasure
  } else {
    // another time signature
    const e2 = song.conductorTrack?.getTimeSignatureEvent(beginMeasureTick - 1)
    if (e2 !== undefined) {
      const ticksPerMeasure2 =
        ((player.timebase * 4) / e2.denominator) * e2.numerator
      player.position = beginMeasureTick - ticksPerMeasure2
    }
  }
}

export const fastForwardOneBar = (rootStore: RootStore) => () => {
  const {
    song,
    services: { player, quantizer },
  } = rootStore
  const e =
    song.conductorTrack?.getTimeSignatureEvent(player.position) ??
    defaultTimeSignature
  const ticksPerBeat = (player.timebase * 4) / e.denominator
  const ticksPerMeasure = ticksPerBeat * e.numerator
  player.position = quantizer.round(player.position + ticksPerMeasure)
}

export const previewNote =
  (rootStore: RootStore) => (channel: number, noteNumber: number) => {
    const {
      services: { player },
    } = rootStore
    player.playNote({
      channel: channel,
      noteNumber: noteNumber,
      velocity: 100,
      duration: 128,
    })
  }

export const previewNoteById = (rootStore: RootStore) => (noteId: number) => {
  const {
    song,
    services: { quantizer, player },
  } = rootStore
  const selectedTrack = song.selectedTrack
  if (selectedTrack === undefined) {
    return
  }
  const note = selectedTrack.getEventById(noteId)
  if (note == undefined || !isNoteEvent(note)) {
    return
  }
  player.playNote({ ...note, channel: selectedTrack.channel ?? 0 })
}

export const setLoopBegin = (rootStore: RootStore) => (tick: number) => {
  const {
    services: { player, quantizer },
  } = rootStore
  tick = quantizer.round(tick)
  if (player.loop.end !== null) {
    tick = Math.min(player.loop.end, tick)
  }
  player.loop = { ...player.loop, begin: tick }
}

export const setLoopEnd = (rootStore: RootStore) => (tick: number) => {
  const {
    services: { player, quantizer },
  } = rootStore
  tick = quantizer.round(tick)
  if (player.loop.begin !== null) {
    tick = Math.max(player.loop.begin, tick)
  }
  player.loop = { ...player.loop, end: tick }
}

export const toggleEnableLoop = (rootStore: RootStore) => () => {
  const {
    services: { player },
  } = rootStore
  player.loop = { ...player.loop, enabled: !player.loop.enabled }
}

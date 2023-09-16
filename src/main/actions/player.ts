import RootStore from "../stores/RootStore"

export const playOrPause =
  ({ player }: RootStore) =>
  () => {
    if (player.isPlaying) {
      player.stop()
    } else {
      player.play()
    }
  }

export const stop =
  ({ player, pianoRollStore }: RootStore) =>
  () => {
    player.stop()
    player.position = 0
    pianoRollStore.setScrollLeftInTicks(0)
  }

const defaultTimeSignature = {
  numerator: 4,
  denominator: 4,
  tick: 0,
}

export const rewindOneBar =
  ({ song, player, pianoRollStore }: RootStore) =>
  () => {
    const e =
      song.conductorTrack?.getTimeSignatureEvent(player.position) ??
      defaultTimeSignature
    const ticksPerMeasure = ((song.timebase * 4) / e.denominator) * e.numerator
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
      const e2 = song.conductorTrack?.getTimeSignatureEvent(
        beginMeasureTick - 1,
      )
      if (e2 !== undefined) {
        const ticksPerMeasure2 =
          ((song.timebase * 4) / e2.denominator) * e2.numerator
        player.position = beginMeasureTick - ticksPerMeasure2
      }
    }

    // make sure player doesn't move out of sight to the left
    if (player.position < pianoRollStore.scrollLeftTicks) {
      pianoRollStore.setScrollLeftInTicks(player.position)
    }
  }

export const fastForwardOneBar = (rootStore: RootStore) => () => {
  const { song, player, pianoRollStore } = rootStore
  const { quantizer } = pianoRollStore

  const e =
    song.conductorTrack?.getTimeSignatureEvent(player.position) ??
    defaultTimeSignature
  const ticksPerBeat = (song.timebase * 4) / e.denominator
  const ticksPerMeasure = ticksPerBeat * e.numerator
  player.position = quantizer.round(player.position + ticksPerMeasure)

  // make sure player doesn't move out of sight to the right
  const { transform, scrollLeft } = pianoRollStore
  const x = transform.getX(player.position)
  const screenX = x - scrollLeft
  if (screenX > pianoRollStore.canvasWidth * 0.7) {
    pianoRollStore.setScrollLeftInPixels(x - pianoRollStore.canvasWidth * 0.7)
  }
}

export const nextTrack =
  ({ pianoRollStore, song }: RootStore) =>
  () => {
    pianoRollStore.selectedTrackId = Math.min(
      pianoRollStore.selectedTrackId + 1,
      song.tracks.length - 1,
    )
  }

export const previousTrack =
  ({ pianoRollStore }: RootStore) =>
  () => {
    pianoRollStore.selectedTrackId = Math.max(
      pianoRollStore.selectedTrackId - 1,
      1,
    )
  }

export const toggleSolo =
  ({ pianoRollStore: { selectedTrackId }, trackMute }: RootStore) =>
  () => {
    if (trackMute.isSolo(selectedTrackId)) {
      trackMute.unsolo(selectedTrackId)
    } else {
      trackMute.solo(selectedTrackId)
    }
  }

export const toggleMute =
  ({ pianoRollStore: { selectedTrackId }, trackMute }: RootStore) =>
  () => {
    if (trackMute.isMuted(selectedTrackId)) {
      trackMute.unmute(selectedTrackId)
    } else {
      trackMute.mute(selectedTrackId)
    }
  }

export const toggleGhost =
  ({ pianoRollStore: { selectedTrackId }, pianoRollStore }: RootStore) =>
  () => {
    if (pianoRollStore.notGhostTracks.has(selectedTrackId)) {
      pianoRollStore.notGhostTracks.delete(selectedTrackId)
    } else {
      pianoRollStore.notGhostTracks.add(selectedTrackId)
    }
  }

export const setLoopBegin =
  ({ player }: RootStore) =>
  (tick: number) => {
    player.loop = {
      end: Math.max(tick, player.loop?.end ?? tick),
      enabled: player.loop?.enabled ?? false,
      begin: tick,
    }
  }

export const setLoopEnd =
  ({ player }: RootStore) =>
  (tick: number) => {
    player.loop = {
      begin: Math.min(tick, player.loop?.begin ?? tick),
      enabled: player.loop?.enabled ?? false,
      end: tick,
    }
  }

export const toggleEnableLoop =
  ({ player }: RootStore) =>
  () => {
    if (player.loop === null) {
      return
    }
    player.loop = { ...player.loop, enabled: !player.loop.enabled }
  }

import RootStore from "../stores/RootStore"

export const toggleMuteTrack = (rootStore: RootStore) => (trackId: number) => {
  const {
    song: { tracks },
    trackMute,
    player,
  } = rootStore
  const channel = tracks[trackId].channel
  if (channel === undefined) {
    return
  }

  if (trackMute.isMuted(trackId)) {
    trackMute.unmute(trackId)
  } else {
    trackMute.mute(trackId)
    player.allSoundsOffChannel(channel)
  }
}

export const toggleSoloTrack = (rootStore: RootStore) => (trackId: number) => {
  const {
    song: { tracks },
    trackMute,
    player,
  } = rootStore
  const channel = tracks[trackId].channel
  if (channel === undefined) {
    return
  }

  if (trackMute.isSolo(trackId)) {
    trackMute.unsolo(trackId)
    player.allSoundsOffChannel(channel)
  } else {
    trackMute.solo(trackId)
    player.allSoundsOffExclude(channel)
  }
}

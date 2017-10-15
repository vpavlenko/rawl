export default ({ trackMute, song: { tracks }, services: { player } }) => {

  return {
    "TOGGLE_MUTE_TRACK": ({ trackId }) => {
      if (trackMute.isMuted(trackId)) {
        trackMute.unmute(trackId)
      } else {
        trackMute.mute(trackId)
        const channel = tracks[trackId].channel
        player.allSoundsOffChannel(channel)
      }
    },
    "TOGGLE_SOLO_TRACK": ({ trackId }) => {
      const channel = tracks[trackId].channel
      if (trackMute.isSolo(trackId)) {
        trackMute.unsolo(trackId)
        player.allSoundsOffChannel(channel)
      } else {
        trackMute.solo(trackId)
        player.allSoundsOffExclude(channel)
      }
    }
  }
}

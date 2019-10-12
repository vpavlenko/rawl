import RootStore from "../stores/RootStore"

export const TOGGLE_MUTE_TRACK = Symbol()
export const TOGGLE_SOLO_TRACK = Symbol()

export default ({
  trackMute,
  song: { tracks },
  services: { player }
}: RootStore) => {
  return {
    [TOGGLE_MUTE_TRACK]: (trackId: number) => {
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
    },
    [TOGGLE_SOLO_TRACK]: (trackId: number) => {
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
  }
}

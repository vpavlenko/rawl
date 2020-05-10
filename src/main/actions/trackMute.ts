import { Mutator, Action } from "../createDispatcher"

export interface ToggleMuteTrack {
  type: "toggleMuteTrack"
  trackId: number
}
export const toggleMuteTrack = (trackId: number): ToggleMuteTrack => ({
  type: "toggleMuteTrack",
  trackId,
})
export interface ToggleSoloTrack {
  type: "toggleSoloTrack"
  trackId: number
}
export const toggleSoloTrack = (trackId: number): ToggleSoloTrack => ({
  type: "toggleSoloTrack",
  trackId,
})

export type TrackMuteAction = ToggleMuteTrack | ToggleSoloTrack

export default (action: Action): Mutator | null => {
  switch (action.type) {
    case "toggleMuteTrack":
      return ({ song: { tracks }, trackMute, services: { player } }) => {
        const { trackId } = action
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
    case "toggleSoloTrack":
      return ({ song: { tracks }, trackMute, services: { player } }) => {
        const { trackId } = action
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
  return null
}

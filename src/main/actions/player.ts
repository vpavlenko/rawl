import RootStore from "../stores/RootStore"

export const PLAY = Symbol()
export const STOP = Symbol()
export const SET_PLAYER_POSITION = Symbol()
export const MOVE_PLAYER_POSITION = Symbol()
export const PREVIEW_NOTE = Symbol()
export const SET_LOOP_BEGIN = Symbol()
export const SET_LOOP_END = Symbol()
export const TOGGLE_ENABLE_LOOP = Symbol()

export default ({
  playerStore,
  services: { player, quantizer },
  song
}: RootStore) => {
  return {
    [PLAY]: () => {
      player.play(song)
    },
    [STOP]: () => {
      if (player.isPlaying) {
        player.stop()
      } else {
        player.stop()
        player.position = 0
      }
    },
    [SET_PLAYER_POSITION]: (tick: number) => {
      player.position = quantizer.round(tick)
    },
    [MOVE_PLAYER_POSITION]: (tick: number) => {
      player.position = quantizer.round(player.position + tick)
    },
    [PREVIEW_NOTE]: (noteNumber: number, channel: number) => {
      player.playNote({ channel, noteNumber, velocity: 100, duration: 128 })
    },
    [SET_LOOP_BEGIN]: (tick: number) => {
      tick = quantizer.round(tick)
      if (player.loop.end !== null) {
        tick = Math.min(player.loop.end, tick)
      }
      player.loop.begin = tick
      playerStore.setLoop({ ...player.loop })
    },
    [SET_LOOP_END]: (tick: number) => {
      tick = quantizer.round(tick)
      if (player.loop.begin !== null) {
        tick = Math.max(player.loop.begin, tick)
      }
      playerStore.setLoop({
        ...player.loop,
        end: tick
      })
    },
    [TOGGLE_ENABLE_LOOP]: () => {
      playerStore.setLoop({ ...player.loop, enabled: !player.loop.enabled })
    }
  }
}

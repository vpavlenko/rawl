import { Mutator, Action } from "../createDispatcher"

// Actions

export interface Play {
  type: "play"
}
export interface Stop {
  type: "stop"
}
export interface SetPlayerPosition {
  type: "setPlayerPosition"
  tick: number
}
export interface MovePlayerPosition {
  type: "movePlayerPosition"
  tick: number
}
export interface PreviewNote {
  type: "previewNote"
  channel: number
  noteNumber: number
}
export interface SetLoopBegin {
  type: "setLoopBegin"
  tick: number
}
export interface SetLoopEnd {
  type: "setLoopEnd"
  tick: number
}
export interface ToggleEnableLoop {
  type: "toggleEnableLoop"
}

export type PlayerAction =
  | Play
  | Stop
  | SetPlayerPosition
  | MovePlayerPosition
  | PreviewNote
  | SetLoopBegin
  | SetLoopEnd
  | ToggleEnableLoop

// Action Creators

export const play = (): Play => ({ type: "play" })
export const stop = (): Stop => ({ type: "stop" })
export const setPlayerPosition = (tick: number): SetPlayerPosition => ({
  type: "setPlayerPosition",
  tick,
})
export const movePlayerPosition = (tick: number): MovePlayerPosition => ({
  type: "movePlayerPosition",
  tick,
})
export const previewNote = (
  channel: number,
  noteNumber: number
): PreviewNote => ({ type: "previewNote", channel, noteNumber })
export const setLoopBegin = (tick: number): SetLoopBegin => ({
  type: "setLoopBegin",
  tick,
})
export const setLoopEnd = (tick: number): SetLoopEnd => ({
  type: "setLoopEnd",
  tick,
})
export const toggleEnableLoop = (): ToggleEnableLoop => ({
  type: "toggleEnableLoop",
})

// Mutators

export default (action: Action): Mutator | null => {
  switch (action.type) {
    case "play":
      return ({ services: { player }, song }) => {
        player.play(song)
      }
    case "stop":
      return ({ services: { player } }) => {
        if (player.isPlaying) {
          player.stop()
        } else {
          player.stop()
          player.position = 0
        }
      }
    case "setPlayerPosition":
      return ({ services: { player, quantizer } }) => {
        player.position = quantizer.round(action.tick)
      }
    case "movePlayerPosition":
      return ({ services: { player, quantizer } }) => {
        player.position = quantizer.round(player.position + action.tick)
      }
    case "previewNote":
      return ({ services: { player } }) => {
        player.playNote({
          channel: action.channel,
          noteNumber: action.noteNumber,
          velocity: 100,
          duration: 128,
        })
      }
    case "setLoopBegin":
      return ({ services: { player, quantizer }, playerStore }) => {
        let tick = quantizer.round(action.tick)
        if (player.loop.end !== null) {
          tick = Math.min(player.loop.end, tick)
        }
        player.loop.begin = tick
        playerStore.setLoop({ ...player.loop })
      }
    case "setLoopEnd":
      return ({ services: { player, quantizer }, playerStore }) => {
        let tick = quantizer.round(action.tick)
        if (player.loop.begin !== null) {
          tick = Math.max(player.loop.begin, tick)
        }
        playerStore.setLoop({
          ...player.loop,
          end: tick,
        })
      }
    case "toggleEnableLoop":
      return ({ services: { player }, playerStore }) => {
        playerStore.setLoop({ ...player.loop, enabled: !player.loop.enabled })
      }
  }
  return null
}

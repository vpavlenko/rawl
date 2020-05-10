import {
  openContextMenu,
  ContextMenuMouseEvent,
} from "../components/groups/ContextMenu"
import { PianoContextMenu } from "../menus/PianoContextMenu"
import { Action, Mutator } from "../createDispatcher"

export interface ChangeCursor {
  type: "changeCursor"
  cursor: string
}
export const changeCursor = (cursor: string): ChangeCursor => ({
  type: "changeCursor",
  cursor,
})
export interface ScrollBy {
  type: "scrollBy"
  x: number
  y: number
}
export const scrollBy = (x: number, y: number): ScrollBy => ({
  type: "scrollBy",
  x,
  y,
})
export interface OpenContextMenu {
  type: "openContextMenu"
  e: ContextMenuMouseEvent
  isNoteSelected: boolean
}
export const openContextMenuAction = (
  e: ContextMenuMouseEvent,
  isNoteSelected: boolean
): OpenContextMenu => ({ type: "openContextMenu", e, isNoteSelected })
export interface SetControlMode {
  type: "setControlMode"
  name: string
}
export const setControlMode = (name: string): SetControlMode => ({
  type: "setControlMode",
  name,
})
export interface ToggleTool {
  type: "toggleTool"
}
export const toggleTool = (): ToggleTool => ({ type: "toggleTool" })

export type PianoRollAction =
  | ChangeCursor
  | ScrollBy
  | OpenContextMenu
  | SetControlMode
  | ToggleTool

export default (action: Action): Mutator | null => {
  switch (action.type) {
    case "changeCursor":
      return ({ pianoRollStore: s }) => {
        s.notesCursor = action.cursor
      }
    case "scrollBy":
      return ({ pianoRollStore: s }) => {
        s.scrollLeft = s.scrollLeft - action.x
        s.scrollTop = s.scrollTop - action.y
      }
    case "openContextMenu":
      return (store) => {
        openContextMenu(
          action.e,
          PianoContextMenu(store.dispatch2, action.isNoteSelected)
        )
      }
    case "setControlMode":
      return ({ pianoRollStore: s }) => {
        s.controlMode = name
      }
    case "toggleTool":
      return ({ pianoRollStore: s }) => {
        s.mouseMode === "pencil" ? "selection" : "pencil"
      }
  }
  return null
}

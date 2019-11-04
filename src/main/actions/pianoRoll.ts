import { IPoint } from "common/geometry"
import RootStore from "../stores/RootStore"
import { openContextMenu } from "../components/groups/ContextMenu"
import { PianoContextMenu } from "../menus/PianoContextMenu"

export const CHANGE_CURSOR = Symbol()
export const SCROLL_BY = Symbol()
export const OPEN_CONTEXT_MENU = Symbol()
export const SET_CONTROL_MODE = Symbol()
export const TOGGLE_TOOL = Symbol()

export default ({ dispatch, pianoRollStore: s }: RootStore) => {
  return {
    [CHANGE_CURSOR]: (cursor: string) => {
      s.notesCursor = cursor
    },

    [SCROLL_BY]: ({ x, y }: IPoint) => {
      s.scrollLeft = s.scrollLeft - x
      s.scrollTop = s.scrollTop - y
    },

    [OPEN_CONTEXT_MENU]: (e: React.MouseEvent, isNoteSelected: boolean) => {
      openContextMenu(e, PianoContextMenu(dispatch, isNoteSelected))
    },

    [SET_CONTROL_MODE]: (name: string) => {
      s.controlMode = name
    },

    [TOGGLE_TOOL]: () => {
      s.mouseMode = s.mouseMode === "pencil" ? "selection" : "pencil"
    }
  }
}

import { open as openContextMenu } from "containers/PianoRollEditor/PianoRoll/PianoContextMenu"
import { IPoint } from "common/geometry"

export const CHANGE_CURSOR = Symbol()
export const SCROLL_BY = Symbol()
export const OPEN_CONTEXT_MENU = Symbol()
export const SET_CONTROL_MODE = Symbol()
export const TOGGLE_TOOL = Symbol()

export default ({ dispatch, pianoRollStore: s }) => {
  return {
    [CHANGE_CURSOR]: ({ cursor }) => {
      s.notesCursor = cursor
    },

    [SCROLL_BY]: ({ x, y }: IPoint) => {
      s.scrollLeft = s.scrollLeft - x
      s.scrollTop = s.scrollTop - y
    },

    [OPEN_CONTEXT_MENU]: (params) => {
      openContextMenu(dispatch, params)
    },

    [SET_CONTROL_MODE]: ({ name }) => {
      s.controlMode = name
    },

    [TOGGLE_TOOL]: () => {
      s.mouseMode = (s.mouseMode === 0 ? 1 : 0)
    }
  }
}

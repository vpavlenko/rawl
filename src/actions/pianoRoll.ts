import { open as openContextMenu } from "containers/PianoRollEditor/PianoRoll/PianoContextMenu"
import { IPoint } from "model/Point"

export default ({ dispatch, pianoRollStore: s }) => {
  return {
    "CHANGE_CURSOR": ({ cursor }) => {
      s.notesCursor = cursor
    },

    "SCROLL_BY": ({ x, y }: IPoint) => {
      s.scrollLeft = s.scrollLeft - x
      s.scrollTop = s.scrollTop - y
    },

    "OPEN_CONTEXT_MENU": (params) => {
      openContextMenu(dispatch, params)
    },

    "SET_CONTROL_MODE": ({ name }) => {
      s.controlMode = name
    },

    "TOGGLE_TOOL": () => {
      s.mouseMode = (s.mouseMode === 0 ? 1 : 0)
    }
  }
}

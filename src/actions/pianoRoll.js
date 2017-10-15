import { open as openContextMenu } from "containers/PianoRoll/PianoContextMenu"

export default ({ dispatch, pianoRollStore: s }) => {
  return {
    "CHANGE_CURSOR": ({ cursor }) => {
      s.notesCursor = cursor
    },

    "SCROLL_BY": ({ x, y }) => {
      s.scrollLeft = s.scrollLeft - x
      s.scrollTop = s.scrollTop - y
    },

    "OPEN_CONTEXT_MENU": (params) => {
      openContextMenu(dispatch, params)
    },

    "SELECT_CONTROL_TAB": ({ name }) => {
      s.controlMode = name
    }
  }
}

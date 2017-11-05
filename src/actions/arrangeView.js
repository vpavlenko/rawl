import { open as openContextMenu } from "containers/PianoRollEditor/PianoRoll/PianoContextMenu"

export default ({ dispatch, arrangeView: s, services: { quantizer } }) => {
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

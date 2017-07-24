import React from "react"
import MouseHandler from "./NoteMouseHandler"
import { pointSub, pointAdd } from "../helpers/point"

import { ContextMenu, MenuItem as ContextMenuItem, createContextMenu } from "../components/molecules/ContextMenu"

export default class SelectionMouseHandler extends MouseHandler {
  actionForMouseDown(e) {
    const original = super.actionForMouseDown(e)
    if (original) {
      return original
    }

    const { dispatch } = this

    if (e.relatedTarget) {
      return null
    }

    const type = this.getPositionType(e.local)

    if (e.nativeEvent.button === 0) {
      switch (type) {
        case "center": return moveSelectionAction(dispatch)
        case "right": return dragSelectionRightEdgeAction(dispatch)
        case "left": return dragSelectionLeftEdgeAction(dispatch)
        case "outside": break
        default: break
      }

      return createSelectionAction(dispatch)
    }

    if (e.nativeEvent.button === 2) {
      let selected
      switch (type) {
        case "center":
        case "right":
        case "left":
          selected = true
          break
        case "outside":
          selected = false
          break
        default: break
      }
      return contextMenuAction(selected,　dispatch)
    }

    return null
  }

  getPositionType = position =>
    this.dispatch("GET_SELECTION_POSITION_TYPE", { position })

  getCursor(e) {
    const type = this.getPositionType(e.local)
    switch(type) {
      case "center" : return "move"
      case "left": return "w-resize"
      case "right": return "w-resize"
      default: return "crosshair"
    }
  }
}

const contextMenuAction = (selected, dispatch) => (onMouseDown, onMouseMove, onMouseUp) => {
  const contextMenu = close =>
    <ContextMenu>
      {selected && <ContextMenuItem onClick={() => {
        dispatch("COPY_SELECTION")
        dispatch("DELETE_SELECTION")
        close()
      }}>Cut</ContextMenuItem>}
      {selected && <ContextMenuItem onClick={() => {
        dispatch("COPY_SELECTION")
        close()
      }}>Copy</ContextMenuItem>}
      <ContextMenuItem onClick={() => {
        dispatch("PASTE_SELECTION")
        close()
      }}>Paste</ContextMenuItem>
      {selected && <ContextMenuItem onClick={() => {
        dispatch("DELETE_SELECTION")
        close()
      }}>Delete</ContextMenuItem>}
    </ContextMenu>

  const menuCreator = createContextMenu(contextMenu)

  onMouseUp(e => {
    menuCreator(e.nativeEvent)
  })
}

// 選択範囲外でクリックした場合は選択範囲をリセット
const createSelectionAction = dispatch => (onMouseDown) => {
  let rect
  let scrollLeft
  onMouseDown(e => {
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)

    rect =  e.currentTarget.getBoundingClientRect()
    scrollLeft = e.local.x - (e.clientX - rect.left)

    dispatch("START_SELECTION", { position: e.local })
    dispatch("SET_PLAYER_CURSOR", { position: e.local })
  })

  function onMouseMove(e) {
    const position = {
      x: Math.round(e.clientX - rect.left + scrollLeft),
      y: Math.round(e.clientY - rect.top)
    }
    dispatch("RESIZE_SELECTION", { position })
  }

  function onMouseUp() {
    document.removeEventListener("mousemove", onMouseMove)
    document.removeEventListener("mouseup", onMouseUp)

    dispatch("FIX_SELECTION")
  }
}

const moveSelectionAction = dispatch => (onMouseDown, onMouseMove) => {
  let startPos
  let selectionPos

  onMouseDown(e => {
    startPos = e.local
    selectionPos = dispatch("GET_SELECTION_RECT")
  })

  onMouseMove(e => {
    const position = pointAdd(selectionPos, pointSub(e.local, startPos))
    dispatch("MOVE_SELECTION", { position })
  })
}

const dragSelectionLeftEdgeAction = dispatch => (onMouseDown, onMouseMove) => {
  onMouseDown(() => {})

  onMouseMove(e => {
    dispatch("RESIZE_SELECTION_LEFT", { position: e.local })
  })
}

const dragSelectionRightEdgeAction = dispatch => (onMouseDown, onMouseMove) => {
  onMouseDown(() => {})

  onMouseMove(e => {
    dispatch("RESIZE_SELECTION_RIGHT", { position: e.local })
  })
}

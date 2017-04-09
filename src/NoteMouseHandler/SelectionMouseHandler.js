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

    const c = this.selectionController
    if (!c) {
      throw new Error("this.selectionController をセットすること")
    }

    if (e.relatedTarget) {
      return null
    }

    const type = c.positionType(e.local)

    if (e.nativeEvent.button === 0) {
      switch (type) {
        case "center": return moveSelectionAction(
          p => c.moveTo(p),
          () => c.getRect())
        case "right": return dragSelectionRightEdgeAction(p => c.resizeRight(p))
        case "left": return dragSelectionLeftEdgeAction(p => c.resizeLeft(p))
        case "outside": break
      }

      return createSelectionAction(
        p => c.startAt(p),
        p => c.resize(p),
        () => c.selectNotes(),
        p => c.setPlayerCursor(p)
      )
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
      }
      return contextMenuAction(selected,
        () => c.copySelection(),
        () => c.pasteSelection(),
        () => c.deleteSelection()
      )
    }

    return null
  }

  getCursor(e) {
    const c = this.selectionController
    if (!c) {
      throw new Error("this.selectionController をセットすること")
    }

    const type = c.positionType(e.local)
    switch(type) {
      case "center" : return "move"
      case "left": return "w-resize"
      case "right": return "w-resize"
      default: return "crosshair"
    }
  }
}

const contextMenuAction = (selected, copySelection, pasteSelection, deleteSelection) => (onMouseDown, onMouseMove, onMouseUp) => {
  const contextMenu = close =>
    <ContextMenu>
      {selected && <ContextMenuItem onClick={() => {
        copySelection()
        deleteSelection()
        close()
      }}>Cut</ContextMenuItem>}
      {selected && <ContextMenuItem onClick={() => {
        copySelection()
        close()
      }}>Copy</ContextMenuItem>}
      <ContextMenuItem onClick={() => {
        pasteSelection()
        close()
      }}>Paste</ContextMenuItem>
      {selected && <ContextMenuItem onClick={() => {
        deleteSelection()
        close()
      }}>Delete</ContextMenuItem>}
    </ContextMenu>

  const menuCreator = createContextMenu(contextMenu)

  onMouseUp(e => {
    menuCreator(e.nativeEvent)
  })
}

// 選択範囲外でクリックした場合は選択範囲をリセット
const createSelectionAction = (startAt, resize, selectNotes, setPlayerCursor) => (onMouseDown, onMouseMove, onMouseUp) => {
  onMouseDown(e => {
    startAt(e.local)
    setPlayerCursor(e.local)
  })
  onMouseMove(e => resize(e.local))
  onMouseUp(() => selectNotes())
}

const moveSelectionAction = (moveTo, getRect) => (onMouseDown, onMouseMove) => {
  let startPos
  let selectionPos

  onMouseDown(e => {
    startPos = e.local
    selectionPos = getRect()
  })

  onMouseMove(e => {
    const pos = pointAdd(selectionPos, pointSub(e.local, startPos))
    moveTo(pos)
  })
}

const dragSelectionLeftEdgeAction = resizeLeft => (onMouseDown, onMouseMove) => {
  onMouseDown(() => {})

  onMouseMove(e => {
    resizeLeft(e.local)
  })
}

const dragSelectionRightEdgeAction = resizeRight => (onMouseDown, onMouseMove) => {
  onMouseDown(() => {})

  onMouseMove(e => {
    resizeRight(e.local)
  })
}

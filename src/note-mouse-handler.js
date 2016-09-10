import observable from "riot-observable"
import Rect from "./rect"

const DRAG_POSITION = {
  NONE: -1,
  LEFT_EDGE: 0,
  CENTER: 1,
  RIGHT_EDGE: 2
}

function getDragPositionType(localX, targetWidth) {
  const edgeSize = Math.min(targetWidth / 3, 8)
  if (localX <= edgeSize) { return DRAG_POSITION.LEFT_EDGE }
  if (targetWidth - localX <= edgeSize) { return DRAG_POSITION.RIGHT_EDGE }
  return DRAG_POSITION.CENTER
}

function cursorForPositionType(type) {
  switch(type) {
    case DRAG_POSITION.LEFT_EDGE:
    case DRAG_POSITION.RIGHT_EDGE: 
      return "w-resize"
    default: return "move"
  }
}

class DragScrollAction {
  constructor(emitter) {
    this.emitter = emitter
  }

  onMouseDown() {}

  onMouseMove(e) {
    this.emitter.trigger("drag-scroll", {movement: {
      x: e.nativeEvent.movementX,
      y: e.nativeEvent.movementY
    }})
  }

  onMouseUp() {}
}

class CreateNoteAction {
  constructor(emitter) {
    this.emitter = emitter
  }

  onMouseDown(e, position) {
    this.startPosition = position
    this.emitter.trigger("add-note", position)
  }

  onMouseMove(e, position) {
    this.emitter.trigger("drag-note-center", {movement: {
      x: position.x - this.startPosition.x,
      y: position.y - this.startPosition.y
    }})
  }

  onMouseUp() {}
}

class RemoveNoteAction {
  constructor(emitter, note) {
    this.emitter = emitter
    this.note = note
  }

  onMouseDown() {
    this.emitter.trigger("remove-note", this.note.id)
  }

  onMouseMove() {}
  onMouseUp() {}
}

class ResizeNoteAction {
  constructor(emitter, dragType, note) {
    this.emitter = emitter
    this.dragType = dragType
    this.note = note
  }

  onMouseDown(e, position) {
    this.startPosition = position
    this.emitter.trigger("start-note-dragging", this.note)
  }

  onMouseMove(e, position) {
    const eventName = (type => { switch(type) {
      case DRAG_POSITION.LEFT_EDGE: return "drag-note-left-edge"
      case DRAG_POSITION.RIGHT_EDGE: return "drag-note-right-edge"
      case DRAG_POSITION.CENTER: return "drag-note-center"
    }})(this.dragType)

    this.emitter.trigger(eventName, { movement: {
      x: position.x - this.startPosition.x,
      y: position.y - this.startPosition.y
    }})
  }

  onMouseUp() {}
}

class ChangeToolAction {
  constructor(emitter) {
    this.emitter = emitter
  }

  onMouseDown() {
    this.emitter.trigger("change-tool")
  }

  onMouseMove() {}
  onMouseUp() {}
}

class CreateSelectionAction {
  constructor(emitter) {
    this.emitter = emitter
  }

  onMouseDown(e, position) {
    this.startPosition = position
    this.emitter.trigger("clear-selection")
    this.emitter.trigger("move-cursor", position.x)
  }

  onMouseMove(e, position) {
    const rect = Rect.fromPoints(this.startPosition, position)
    this.emitter.trigger("resize-selection", rect)
  }

  onMouseUp(e, position) {
    const rect = Rect.fromPoints(this.startPosition, position)
    this.emitter.trigger("select-notes", rect)
  }
}

class ResizeSelectionAction {
  constructor(emitter, dragType, selection) {
    this.emitter = emitter
    this.dragType = dragType
    this.selection = selection
  }

  onMouseDown(e, position) {
    this.startPosition = position
  }

  onMouseMove(e, position) {
    const eventName = (type => { switch(type) {
      case DRAG_POSITION.LEFT_EDGE: return "drag-selection-left-edge"
      case DRAG_POSITION.RIGHT_EDGE: return "drag-selection-right-edge"
      case DRAG_POSITION.CENTER: return "drag-selection-center"
    }})(this.dragType)

    this.emitter.trigger(eventName, { movement: {
      x: position.x - this.startPosition.x,
      y: position.y - this.startPosition.y
    }})
  }

  onMouseUp() {
    this.emitter.trigger("end-dragging")
  }
}

class MouseHandler {
   // override this
  _getAction(container, e) {
    if (e.nativeEvent.button == 1) {
      // wheel drag to start scrolling
      return new DragScrollAction(container)
    }

    if (e.nativeEvent.button == 2 && e.nativeEvent.detail == 2) {
      return new ChangeToolAction(container)
    }

    return null
  }

  // override this
  _getCursor() {
    return "auto"
  }

  onMouseDown(container, e, loc) { 
    this.action = this._getAction(container, e)
    if (this.action) {
      this.action.onMouseDown(e, loc)
    }
  }

  onMouseMove(container, e, loc) {
    if (this.action) {
      this.action.onMouseMove(e, loc)
    } else {
      container.trigger("change-cursor", this._getCursor(container, e))
    }
  }

  onMouseUp(container, e, loc) {
    if (this.action) {
      this.action.onMouseUp(e, loc)
    }
    this.action = null
  }
}

class PencilMouseHandler extends MouseHandler {
  _getAction(container, e) {
    const baseAction = super._getAction(container, e)
    if (baseAction) return baseAction

    const cpos = container.globalToLocal(e.stageX, e.stageY)
    const view = container.getNoteViewUnderPoint(cpos.x, cpos.y)

    if (e.nativeEvent.button != 0) {
      return null
    }
    
    if (view) {
      if (e.nativeEvent.detail == 2) {
        return new RemoveNoteAction(container, view.note)
      } else {
        const local = view.globalToLocal(e.stageX, e.stageY)
        const type = getDragPositionType(local.x, view.getBounds().width)
        return new ResizeNoteAction(container, type, view.note)
      }
    } else if (!e.relatedTarget) {
      return new CreateNoteAction(container)
    }
    return null
  }

  _getCursor(container, e) {
    const cpos = container.globalToLocal(e.stageX, e.stageY)
    const view = container.getNoteViewUnderPoint(cpos.x, cpos.y)
    if (view) {
      const pos = view.globalToLocal(e.stageX, e.stageY)
      const type = getDragPositionType(pos.x, view.getBounds().width)
      return cursorForPositionType(type)
    }

    return `url("./images/iconmonstr-pencil-14-16.png") 0 16, default`
  }
}

class SelectionMouseHandler extends MouseHandler {
  _getAction(container, e) {
    const baseAction = super._getAction(container, e)
    if (baseAction) return baseAction

    if (e.relatedTarget) {
      return null
    }

    const selectionRect = container.selectionRect
    const cpos = container.globalToLocal(e.stageX, e.stageY)
    const clicked = selectionRect.contains(cpos.x, cpos.y)
    if (!clicked) {
      if (e.nativeEvent.detail == 2) {
        return CreateNoteAction(container)
      }
      return new CreateSelectionAction(container)
    }
    const type = getDragPositionType(cpos.x - selectionRect.x, selectionRect.width)
    return new ResizeSelectionAction(container, type, selectionRect)
  }

  _getCursor(container, e) {
    const selectionRect = container.selectionRect
    const loc = container.globalToLocal(e.stageX, e.stageY)
    const hover = selectionRect.contains(loc.x, loc.y)
    if (container.selectionView.visible && hover) {
      const type = getDragPositionType(loc.x - selectionRect.x, selectionRect.width)
      return cursorForPositionType(type)
    }
    return "crosshair"
  }
}

export {
  PencilMouseHandler,
  SelectionMouseHandler
}

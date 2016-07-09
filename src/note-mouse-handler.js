"use strict"
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

  onMouseDown(e, position) {}

  onMouseMove(e) {
    this.emitter.trigger("drag-scroll", {movement: {
      x: e.nativeEvent.movementX,
      y: e.nativeEvent.movementY
    }})
  }

  onMouseUp(e, position) {}
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

  onMouseUp(e, position) {}
}

class RemoveNoteAction {
  constructor(emitter, note) {
    this.emitter = emitter
    this.note = note
  }

  onMouseDown(e, position) {
    this.emitter.trigger("remove-note", this.note.id)
  }

  onMouseMove(e, position) {}
  onMouseUp(e, position) {}
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

  onMouseUp(e, position) {}
}

class ChangeToolAction {
  constructor(emitter) {
    this.emitter = emitter
  }

  onMouseDown(e, position) {
    this.emitter.trigger("change-tool")
  }

  onMouseMove(e, position) {}
  onMouseUp(e, position) {}
}

class CreateSelectionAction {
  constructor(emitter) {
    this.emitter = emitter
  }

  onMouseDown(e, position) {
    this.startPosition = position
    this.emitter.trigger("clear-selection")
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

  onMouseUp(e, position) {
    this.emitter.trigger("end-dragging")
  }
}

class MouseHandler {
  constructor(container) {
    this.container = container
    riot.observable(this)
  }

   // override this
  _getAction(e) {
    if (e.nativeEvent.button == 1) {
      // wheel drag to start scrolling
      return new DragScrollAction(this)
    }

    if (e.nativeEvent.button == 2 && e.nativeEvent.detail == 2) {
      return new ChangeToolAction(this)
    }

    return null
  }

  // override this
  _getCursor(e) {
    return "auto"
  }

  onMouseDown(e, loc) { 
    this.action = this._getAction(e)
    if (this.action) {
      this.action.onMouseDown(e, loc)
    }
  }

  onMouseMove(e, loc) {
    if (this.action) {
      this.action.onMouseMove(e, loc)
    } else {
      this.trigger("change-cursor", this._getCursor(e))
    }
  }

  onMouseUp(e, loc) {
    if (this.action) {
      this.action.onMouseUp(e, loc)
    }
    this.action = null
  }
}

class PencilMouseHandler extends MouseHandler {
  constructor(container) {
    super(container)
  }

  _getAction(e) {
    const baseAction = super._getAction(e)
    if (baseAction) return baseAction

    const cpos = this.container.globalToLocal(e.stageX, e.stageY)
    const view = this.container.getNoteViewUnderPoint(cpos.x, cpos.y)

    if (e.nativeEvent.button != 0) {
      return null
    }
    
    if (view) {
      if (e.nativeEvent.detail == 2) {
        return new RemoveNoteAction(this, view.note)
      } else {
        const local = view.globalToLocal(e.stageX, e.stageY)
        const type = getDragPositionType(local.x, view.getBounds().width)
        return new ResizeNoteAction(this, type, view.note)
      }
    } else if (!e.relatedTarget) {
      return new CreateNoteAction(this)
    }
    return null
  }

  _getCursor(e) {
    const cpos = this.container.globalToLocal(e.stageX, e.stageY)
    const view = this.container.getNoteViewUnderPoint(cpos.x, cpos.y)
    if (view) {
      const pos = view.globalToLocal(e.stageX, e.stageY)
      const type = getDragPositionType(pos.x, view.getBounds().width)
      return cursorForPositionType(type)
    }

    return `url("./images/iconmonstr-pencil-14-16.png") 0 16, default`
  }
}

class SelectionMouseHandler extends MouseHandler {
  constructor(container, selectionView) {
    super(container)
    this.selectionView = selectionView
  }

  get _selectionRect() {
    const b = this.selectionView.getBounds()
    return new createjs.Rectangle(
      this.selectionView.x,
      this.selectionView.y,
      b.width,
      b.height
    )
  }

  _getAction(e) {
    const baseAction = super._getAction(e)
    if (baseAction) return baseAction
      
    if (e.relatedTarget) {
      return null
    }

    const cpos = this.container.globalToLocal(e.stageX, e.stageY)
    const clicked = this._selectionRect.contains(cpos.x, cpos.y)
    if (!clicked) {
      if (e.nativeEvent.detail == 2) {
        return CreateNoteAction(this)
      } else {
        return new CreateSelectionAction(this)
      }
    } else {
      const type = getDragPositionType(cpos.x - this._selectionRect.x, this._selectionRect.width)
      return new ResizeSelectionAction(this, type, this.selectionRect)
    }
    return null
  }

  _getCursor(e) {
    const loc = this.container.globalToLocal(e.stageX, e.stageY)
    const hover = this._selectionRect.contains(loc.x, loc.y)
    if (this.selectionView.visible && hover) {
      const type = getDragPositionType(loc.x - this._selectionRect.x, this._selectionRect.width)
      return cursorForPositionType(type)
    }
    return "crosshair"
  }
}

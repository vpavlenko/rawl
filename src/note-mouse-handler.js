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

class PencilMouseHandler {
  constructor(container) {
    this.container = container
    riot.observable(this)
    bindAllMethods(this)
  }

  onMouseDown(e) { 
    const cpos = this.container.globalToLocal(e.stageX, e.stageY)
    const view = this.container.getNoteViewUnderPoint(cpos.x, cpos.y)
    if (view) {
      const local = view.globalToLocal(e.stageX, e.stageY)
      this.target = {
        touchOrigin: {
          x: cpos.x,
          y: cpos.y
        },
        noteId: view.noteId,
        type: getDragPositionType(local.x, view.getBounds().width),
        bounds: {
          x: view.x,
          y: view.y,
          width: view.getBounds().width,
          height: view.getBounds().height
        }
      }
      if (e.nativeEvent.detail == 2) {
        this.trigger("remove-note", view.noteId)
      }
    } else if (!e.relatedTarget) {
      this.target = null
      this.trigger("add-note", cpos)
    }
  }

  onMouseMove(e) {
    if (!this.target) {
      this.updateCursor(e)
      return
    }

    const loc = this.container.globalToLocal(e.stageX, e.stageY)
    const prevOrigin = this.target.prevOrigin || this.target.touchOrigin
    const r = {
      noteId: this.target.noteId,
      changed: (dx, dy = 0) => {
        // notify actually moved
        this.target.prevOrigin = {
          x: prevOrigin.x + dx,
          y: prevOrigin.y + dy
        }
      },
      movement: {
        x: loc.x - prevOrigin.x,
        y: loc.y - prevOrigin.y
      }
    }

    switch (this.target.type) {
      case DRAG_POSITION.LEFT_EDGE:
      this.trigger("drag-note-left-edge", r)
      return
      case DRAG_POSITION.RIGHT_EDGE:
      this.trigger("drag-note-right-edge", r)
      return
      case DRAG_POSITION.CENTER:
      this.trigger("drag-note-center", r)
      break
    }
  }

  updateCursor(e) {
    const cpos = this.container.globalToLocal(e.stageX, e.stageY)
    const view = this.container.getNoteViewUnderPoint(cpos.x, cpos.y)
    if (view) {
      const pos = view.globalToLocal(e.stageX, e.stageY)
      const type = getDragPositionType(pos.x, view.getBounds().width)
      this.trigger("change-cursor", cursorForPositionType(type))
    } else {
      this.trigger("change-cursor", `url("./images/iconmonstr-pencil-14-16.png") 0 16, default`)
    }
  }

  onMouseUp(e) {
    this.target = null
  }
}

class SelectionMouseHandler {
  constructor(container, selectionView) {
    this.container = container
    this.selectionView = selectionView
    this.isMouseDown = false
    this._isResizing = false
    riot.observable(this)
    bindAllMethods(this)
  }

  get selectionRect() {
    const b = this.selectionView.getBounds()
    return new createjs.Rectangle(
      this.selectionView.x,
      this.selectionView.y,
      b.width,
      b.height
    )
  }

  onMouseDown(e) { 
    if (e.relatedTarget) return
    this.isMouseDown = true

    const cpos = this.container.globalToLocal(e.stageX, e.stageY)
    const clicked = this.selectionRect.contains(cpos.x, cpos.y)
    if (!clicked) {
      this.target = { 
        touchOrigin: cpos,
        type: DRAG_POSITION.NONE
      }
      this.trigger("clear-selection")
    } else {
      this.target = {
        touchOrigin: cpos,
        bounds: this.selectionRect,
        type: getDragPositionType(cpos.x - this.selectionRect.x, this.selectionRect.width),
      }
    }
    if (e.nativeEvent.detail == 2) {
      this.trigger("add-note", this.start)
    }
  }

  onMouseMove(e) {
    if (!this.isMouseDown) {
      this.updateCursor(e)
      return
    }

    const loc = this.container.globalToLocal(e.stageX, e.stageY)
    const prevOrigin = this.target.prevOrigin || this.target.touchOrigin
    const changed = (dx, dy = 0) => {
      // notify actually moved
      this.target.prevOrigin = {
        x: prevOrigin.x + dx,
        y: prevOrigin.y + dy
      }
    }
    const dx = loc.x - prevOrigin.x
    const dy = loc.y - prevOrigin.y

    switch (this.target.type) {
      case DRAG_POSITION.NONE: {
        const rect = Rect.fromPoints(this.target.touchOrigin, loc)
        this.trigger("resize-selection", rect)
        break
      }
      case DRAG_POSITION.CENTER: {
        this.trigger("drag-selection-center", {
          changed: changed,
          movement: { x: dx, y: dy }
        })
        break
      }
      case DRAG_POSITION.LEFT_EDGE: {
        this.trigger("drag-selection-left-edge", {
          changed: changed,
          movement: { x: dx, y: dy }
        })
        break
      }
      case DRAG_POSITION.RIGHT_EDGE: {
        this.trigger("drag-selection-right-edge", {
          changed: changed,
          movement: { x: dx, y: dy }
        })
        break
      }
    }
  }

  updateCursor(e) {
    const loc = this.container.globalToLocal(e.stageX, e.stageY)
    const hover = this.selectionRect.contains(loc.x, loc.y)
    if (this.selectionView.visible && hover) {
      const type = getDragPositionType(loc.x - this.selectionRect.x, this.selectionRect.width)
      this.trigger("change-cursor", cursorForPositionType(type))
    } else {
      this.trigger("change-cursor", "crosshair")
    }
  }

  onMouseUp(e) { 
    this.isMouseDown = false
    if (this.target.type == DRAG_POSITION.NONE) {
      this.trigger("select-notes", this.container.getNoteIdsInRect(this.selectionRect))
    }
  }
}

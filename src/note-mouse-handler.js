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

    const p = this.container.globalToLocal(e.stageX, e.stageY)
    const movement = {
      x: p.x - this.target.touchOrigin.x,
      y: p.y - this.target.touchOrigin.y
    }

    switch (this.target.type) {
      case DRAG_POSITION.LEFT_EDGE:
      this.trigger("drag-note-left-edge", { target: this.target, movement: movement })
      return
      case DRAG_POSITION.RIGHT_EDGE:
      this.trigger("drag-note-right-edge", { target: this.target, movement: movement })
      return
      case DRAG_POSITION.CENTER:
      this.trigger("drag-note-center", { target: this.target, movement: movement })
      break
    }
  }

  updateCursor(e) {
    const cpos = this.container.globalToLocal(e.stageX, e.stageY)
    const view = this.container.getNoteViewUnderPoint(cpos.x, cpos.y)
    if (view) {
      const pos = view.globalToLocal(e.stageX, e.stageY)
      const type = getDragPositionType(pos.x, view.getBounds().width)
      switch (type) {
        case DRAG_POSITION.LEFT_EDGE:
        case DRAG_POSITION.RIGHT_EDGE: 
          this.trigger("change-cursor", "w-resize")
          break
        default:
          this.trigger("change-cursor", "move")
          break
      }
    } else {
      this.trigger("change-cursor", `url("./images/iconmonstr-pencil-14-16.png") 0 16, default`)
    }
  }

  onMouseUp(e) {
    this.target = null
  }
}

class SelectionMouseHandler {
  constructor(container, selectionView, selectedNoteIdStore) {
    this.container = container
    this.selectionView = selectionView
    this.selectedNoteIdStore = selectedNoteIdStore
    this.isMouseDown = false
    riot.observable(this)
    bindAllMethods(this)
  }

  get quantizer() {
    return SharedService.quantizer
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
    const dx = this.quantizer.roundX(loc.x - prevOrigin.x)
    const dy = this.quantizer.roundY(loc.y - prevOrigin.y)

    switch (this.target.type) {
      case DRAG_POSITION.NONE: {
        if (dx == 0 && dy == 0) {
          return
        }
        const rect = Rect.fromPoints(this.target.touchOrigin, loc)
        this.trigger("resize-selection", rect)
        break
      }
      case DRAG_POSITION.CENTER: {
        if (dx == 0 && dy == 0) {
          return
        }
        this.target.prevOrigin = loc
        this.trigger("drag-selection-center", {
          target: this.target, 
          movement: { x: dx, y: dy }
        })
        break
      }
      case DRAG_POSITION.LEFT_EDGE: {
        if (dx == 0) {
          return
        }

        const rects = this.selectedNoteIdStore
          .map(id => this.container.findNoteViewById(id))
          .filter(v => v != null)
          .map(view => { return {
            noteId: view.noteId,
            x: view.x + dx,
            width: view.getBounds().width - dx
          }})

        // 幅がゼロになるノートがあるときは変形しない
        if (!_.every(rects, r => r.width > 0)) {
          return
        }
        this.target.prevOrigin = loc
        this.trigger("drag-selection-left-edge", {
          movement: { x: dx, y: dy },
          rects: rects
        })
        break
      }
      case DRAG_POSITION.RIGHT_EDGE: {
        if (dx == 0) {
          return
        }

        const rects = this.selectedNoteIdStore
          .map(id => this.container.findNoteViewById(id))
          .filter(v => v != null)
          .map(view => { return {
            noteId: view.noteId,
            width: view.getBounds().width + dx
          }})

        // 幅がゼロになるノートがあるときは変形しない
        if (!_.every(rects, r => r.width > 0)) {
          return
        }
        this.target.prevOrigin = loc
        this.trigger("drag-selection-right-edge", {
          movement: { x: dx, y: dy },
          rects: rects
        })
        break
      }
    }
  }

  updateCursor(e) {
    const loc = this.container.globalToLocal(e.stageX, e.stageY)
    const hover = this.selectionRect.contains(loc.x, loc.y)
    if (this.selectionView.visible && hover) {
      switch(getDragPositionType(loc.x - this.selectionRect.x, this.selectionRect.width)) {
        case DRAG_POSITION.LEFT_EDGE:
        case DRAG_POSITION.RIGHT_EDGE: 
          this.trigger("change-cursor", "w-resize")
          break
        default:
          this.trigger("change-cursor", "move")
          break
      }
    } else {
      this.trigger("change-cursor", "crosshair")
    }
  }

  set selectedNoteIds(ids) {
    this.selectedNoteIdStore.removeAll()
    this.selectedNoteIdStore.pushArray(ids)
    this.selectedNoteIdStore.trigger("change", this.selectedNoteIdStore)
  }

  get selectedNoteIds() {
    return this.selectedNoteIdStore
  }

  onMouseUp(e) { 
    if (!this.selectionView.fixed) {
      this.selectionView.fixed = true
      this.selectedNoteIds = this.container.getNoteIdsInRect(this.selectionRect)
    }
    this.isMouseDown = false
  }
}

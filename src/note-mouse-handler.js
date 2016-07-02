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

  setTrack(track) {
    this.track = track
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
        this.track.removeEventById(view.noteId)
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

  get coordConverter() {
    return SharedService.coordConverter
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

  set selectionRect(rect) {
    this.selectionView.x = rect.x
    this.selectionView.y = rect.y
    this.selectionView.setSize(rect.width, rect.height)
  }

  setTrack(track) {
    this.track = track
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
    const bounds = this.selectionRect
    switch (this.target.type) {
      case DRAG_POSITION.NONE: {
        // 選択範囲の変形
        const rect = Rect.fromPoints(this.target.touchOrigin, loc)
        this.trigger("resize-selection", rect)
        break
      }
      case DRAG_POSITION.CENTER: {
        const prevOrigin = this.target.prevOrigin || this.target.touchOrigin
        const dx = this.quantizer.roundX(loc.x - prevOrigin.x)
        const dy = this.quantizer.roundY(loc.y - prevOrigin.y)

        if (dx == 0 && dy == 0) {
          return
        }

        this.trigger("drag-selection-center", {target: this.target, movement: {
          x: dx,
          y: dy
        }})

        this.target.prevOrigin = loc
        break
      }
      case DRAG_POSITION.LEFT_EDGE: {
        const qx = this.quantizer.floorX(loc.x)
        if (bounds.x - qx == 0) {
          return
        }
        // 右端を固定して長さを変更
        const width = Math.max(this.quantizer.unitX, bounds.width + bounds.x - qx)
        const x = Math.min(bounds.width + bounds.x - this.quantizer.unitX, qx)
        const dw = width - bounds.width
        const dx = x - bounds.x
        console.log(dw, dx)

        const noteViews = this.selectedNoteIds
          .map(id => this.container.findNoteViewById(id))

        // TODO: noteViews を走査してどのビューも幅が0にならないように dx, dw を調節する

        noteViews.forEach(v => { 
          const tick = this.coordConverter.getTicksForPixels(v.x + dx)
          const duration = this.coordConverter.getTicksForPixels(v.getBounds().width + dw)

          this.track.updateEvent(rect.id, {
            tick: tick,
            duration: duration
          })
        })
        bounds.x = x
        bounds.width = width
        break
      }
      case DRAG_POSITION.RIGHT_EDGE: {
        const qx = this.quantizer.floorX(loc.x)
        if (qx == 0) {
          return
        }
        // 左端を固定して長さを変更
        const w = Math.max(this.quantizer.unitX, qx - bounds.x)
        const dw = w - bounds.width
        bounds.width = w

        // TODO: noteViews を走査してどのビューも幅が0にならないように dw を調節する

        const noteViews = this.selectedNoteIds
          .map(id => this.container.findNoteViewById(id))
          .forEach(v => { 
            const duration = this.coordConverter.getTicksForPixels(v.getBounds().width + dw)
            this.track.updateEvent(v.noteId, {duration: duration})
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

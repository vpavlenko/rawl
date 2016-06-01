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
  constructor(container, canvas, listener, quantizer, coordConverter, shi) {
    this.container = container
    this.canvas = canvas
    this.listener = listener
    this.quantizer = quantizer
    this.coordConverter = coordConverter
    this.shi = shi
    bindAllMethods(this)
  }

  onMouseDown(e) { 
    const cpos = this.container.globalToLocal(e.stageX, e.stageY)
    const view = this.getNoteViewUnderPoint(cpos.x, cpos.y)
    if (view) {
      const local = view.globalToLocal(e.stageX, e.stageY)
      this.dragPosition = {
        x: local.x,
        y: local.y,
        type: getDragPositionType(local.x, view.getBounds().width),
        view: view
      }
      if (e.nativeEvent.detail == 2) {
        this.shi.remove(`/tracks/_/notes/${view.noteId}`)
      }
    } else if (!e.relatedTarget) {
      this.dragPosition = null
      const x = this.quantizer.floorX(cpos.x)
      const y = this.quantizer.floorY(cpos.y)
      this.shi.create("/tracks/_/notes", {
        tick: this.coordConverter.getTicksForPixels(x),
        noteNumber: this.coordConverter.getNoteNumberForPixels(y),
        duration: 240,
      })
    }
  }

  onMouseMove(e) {
    if (!this.dragPosition) {
      this.updateCursor(e)
      return
    }

    const target = this.dragPosition.view
    const targetSize = target.getBounds()
    const bounds = {
      x: target.x,
      y: target.y,
      width: targetSize.width,
      height: targetSize.height
    }
    const p = this.container.globalToLocal(e.stageX, e.stageY)
    const qx = this.quantizer.roundX(p.x)

    switch (this.dragPosition.type) {
      case DRAG_POSITION.LEFT_EDGE:
      // 右端を固定して長さを変更
      const width = Math.max(this.quantizer.unitX, bounds.width + bounds.x - qx) 
      bounds.x = Math.min(bounds.width + bounds.x - this.quantizer.unitX, qx)
      bounds.width = width
      break
      case DRAG_POSITION.RIGHT_EDGE:
      // 左端を固定して長さを変更
      bounds.width = Math.max(this.quantizer.unitX, qx - bounds.x)
      break
      case DRAG_POSITION.CENTER:
      // 移動
      bounds.x = this.quantizer.roundX(p.x - this.dragPosition.x)
      bounds.y = this.quantizer.roundY(p.y - this.dragPosition.y) 
      break
    }

    if (target.x != bounds.x || target.y != bounds.y || targetSize.width != bounds.width || targetSize.height != bounds.height) {
      const tick = this.coordConverter.getTicksForPixels(bounds.x)
      const noteNumber = this.coordConverter.getNoteNumberForPixels(bounds.y)
      const duration = this.coordConverter.getTicksForPixels(bounds.x + bounds.width) - tick
      this.shi.update(`/tracks/_/notes/${target.noteId}/tick`, tick)
      this.shi.update(`/tracks/_/notes/${target.noteId}/noteNumber`, noteNumber)
      this.shi.update(`/tracks/_/notes/${target.noteId}/duration`, duration)
    }
  }

  updateCursor(e) {
    const cpos = this.container.globalToLocal(e.stageX, e.stageY)
    const view = this.getNoteViewUnderPoint(cpos.x, cpos.y)
    if (view) {
      const pos = view.globalToLocal(e.stageX, e.stageY)
      const type = getDragPositionType(pos.x, view.getBounds().width)
      switch (type) {
        case DRAG_POSITION.LEFT_EDGE:
        case DRAG_POSITION.RIGHT_EDGE: 
          this.listener.onCursorChanged("w-resize")
          break
        default:
          this.listener.onCursorChanged("move")
          break
      }
    } else {
      this.listener.onCursorChanged(`url("./images/iconmonstr-pencil-14-16.png") 0 16, default`)
    }
  }

  onMouseUp(e) {
    this.dragPosition = null
  }

  getNoteViewUnderPoint(x, y) {
    return _.find(this.container.children, c => {
      if (!(c instanceof NoteView)) return false
      const b = c.getBounds()
      return new createjs.Rectangle(c.x, c.y, b.width, b.height).contains(x, y)
    })
  }
}

class SelectionMouseHandler {
  constructor(container, selectionView, listener, selectedNoteStore, quantizer, coordConverter, shi) {
    this.container = container
    this.listener = listener
    this.selectionView = selectionView
    this.selectedNoteStore = selectedNoteStore
    this.quantizer = quantizer
    this.coordConverter = coordConverter
    this.shi = shi
    this.isMouseDown = false
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

  onMouseDown(e) { 
    if (e.relatedTarget) return

    this.isMouseDown = true
    this.start = this.container.globalToLocal(e.stageX, e.stageY)
    const clicked = this.selectionRect.contains(this.start.x, this.start.y)
    if (!clicked) {
      // 選択範囲外でクリックした場合は選択範囲をリセット
      this.selectedNoteIds = []
      this.selectionView.fixed = false
      this.selectionView.visible = false
      this.selectionRect = {
        x: this.start.x,
        y: this.start.y,
        width: 0,
        height: 0
      }
      this.dragPosition = { x: 0, y: 0, type: DRAG_POSITION.NONE }
    } else {
      const x = this.start.x - this.selectionRect.x
      const y = this.start.y - this.selectionRect.y 
      this.dragPosition = {
        x: x,
        y: y,
        type: getDragPositionType(x, this.selectionRect.width),
      }
    }
    if (e.nativeEvent.detail == 2) {
      const tick = this.coordConverter.getTicksForPixels(this.quantizer.floorX(this.start.x))
      const noteNumber = this.coordConverter.getNoteNumberForPixels(this.quantizer.floorY(this.start.y))
      this.shi.create("/tracks/_/notes", {
        tick: tick,
        noteNumber: noteNumber,
      })
    }
  }

  onMouseMove(e) {
    if (!this.isMouseDown) {
      this.updateCursor(e)
      return
    }
    this.selectionView.visible = true

    const loc = this.container.globalToLocal(e.stageX, e.stageY)
    const bounds = this.selectionRect
    if (this.selectionView.fixed) {
      switch (this.dragPosition.type) {
        case DRAG_POSITION.CENTER: {
          // 確定済みの選択範囲をドラッグした場合はノートと選択範囲を移動
          const dx = this.quantizer.roundX(loc.x - this.dragPosition.x - bounds.x)
          const dy = this.quantizer.roundY(loc.y - this.dragPosition.y - bounds.y)

          if (dx == 0 && dy == 0) {
            return
          } 

          const changes = this.selectedNoteIds
            .map(id => { 
              const view = this.findNoteViewById(id)
              const b = view.getBounds()
              return {
                id: id,
                x: view.x + dx,
                y: view.y + dy
              }
            })
            .filter(rect => rect != null)
            .forEach(rect => {
              const tick = this.coordConverter.getTicksForPixels(rect.x)
              const noteNumber = this.coordConverter.getNoteNumberForPixels(rect.y)
              this.shi.update(`/tracks/_/notes/${rect.id}/tick`, tick)
              this.shi.update(`/tracks/_/notes/${rect.id}/noteNumber`, noteNumber)
            })

          bounds.x += dx
          bounds.y += dy
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
            .map(id => this.findNoteViewById(id))

          // TODO: noteViews を走査してどのビューも幅が0にならないように dx, dw を調節する

          noteViews.forEach(v => { 
            const tick = this.coordConverter.getTicksForPixels(v.x + dx)
            const duration = this.coordConverter.getTicksForPixels(v.getBounds().width + dw)
            this.shi.update(`/tracks/_/notes/${v.noteId}/tick`, tick)
            this.shi.update(`/tracks/_/notes/${v.noteId}/duration`, duration)
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
            .map(id => this.findNoteViewById(id))
            .forEach(v => { 
              const duration = this.coordConverter.getTicksForPixels(v.getBounds().width + dw)
              this.shi.update(`/tracks/_/notes/${v.noteId}/duration`, duration)
            })
          break
        }
      }
    } else {
      // 選択範囲の変形
      const rect = Rect.fromPoints(this.start, loc)
      bounds.x = this.quantizer.roundX(rect.x)
      bounds.y = this.quantizer.roundY(rect.y)
      bounds.width = (this.quantizer.roundX(rect.x + rect.width) - bounds.x) || this.quantizer.unitX
      bounds.height = (this.quantizer.roundY(rect.y + rect.height) - bounds.y) || this.quantizer.unitY
    }
    this.selectionRect = bounds
  }

  updateCursor(e) {
    const loc = this.container.globalToLocal(e.stageX, e.stageY)
    const hover = this.selectionRect.contains(loc.x, loc.y)
    if (this.selectionView.visible && hover) {
      switch(getDragPositionType(loc.x - this.selectionRect.x, this.selectionRect.width)) {
        case DRAG_POSITION.LEFT_EDGE:
        case DRAG_POSITION.RIGHT_EDGE: 
          this.listener.onCursorChanged("w-resize")
          break
        default:
          this.listener.onCursorChanged("move")
          break
      }
    } else {
      this.listener.onCursorChanged("crosshair")
    }
  }

  findNoteViewById(id) {
    return _.find(this.container.children, c => {
      return c instanceof NoteView && c.noteId == id
    }) 
  }

  getNoteViewsInRect(rect) {
    return this.container.children.filter(c => {
        if (!(c instanceof NoteView)) return
        const b = c.getBounds()
        return rect.contains(c.x, c.y, b.width, b.height)
      })
  }

  getNoteIdsInRect(rect) {
    return this.getNoteViewsInRect(rect).map(c => c.noteId)
  }

  set selectedNoteIds(ids) {
    this.selectedNoteStore.removeAll()
    this.selectedNoteStore.pushArray(ids)
    this.selectedNoteStore.trigger("change", {noteIds: this.selectedNoteStore})
  }

  get selectedNoteIds() {
    return this.selectedNoteStore
  }

  onMouseUp(e) { 
    if (!this.selectionView.fixed) {
      this.selectionView.fixed = true
      this.selectedNoteIds = this.getNoteIdsInRect(this.selectionRect)
      this.listener.onSelectNotes(this.selectedNoteIds)
    } else if (!this.isMouseMoved) {
      this.listener.onClickNotes(this.selectedNoteIds, e)
    }
    this.isMouseDown = false
  }
}

const DRAG_POSITION = {
  LEFT_EDGE: 0,
  CENTER: 1,
  RIGHT_EDGE: 2
}

class PencilMouseHandler {
  constructor(container, canvas, listener) {
    this.container = container
    this.canvas = canvas
    this.listener = listener
    bindAllMethods(this)
  }

  resetCursor() {
    this.container.style.cursor = "default"
  }

  onMouseDown(e) { 
    const cpos = this.container.globalToLocal(e.stageX, e.stageY)
    const view = this.getNoteViewUnderPoint(cpos.x, cpos.y)
    if (view) {
      const local = view.globalToLocal(e.stageX, e.stageY)
      this.dragPosition = {
        x: local.x,
        y: local.y,
        type: this.getDragPositionType(local.x, view.getBounds().width),
        view: view
      }
    } else if (!e.relatedTarget) {
      this.dragPosition = null
      this.listener.onCreateNote({
        x: quantizer.floorX(cpos.x),
        y: quantizer.floorY(cpos.y),
        width: quantizer.unitX
      })
    }
  }

  getDragPositionType(localX, noteWidth) {
    const edgeSize = Math.min(noteWidth / 3, 8)
    if (localX <= edgeSize) { return DRAG_POSITION.LEFT_EDGE }
    if (noteWidth - localX <= edgeSize) { return DRAG_POSITION.RIGHT_EDGE }
    return DRAG_POSITION.CENTER
  }

  onMouseMove(e) {
    if (!this.dragPosition) {
      this.updateCursor(e)
      return
    }

    const target = this.dragPosition.view
    const bounds = {
      x: target.x,
      y: target.y,
      width: target.getBounds().width,
      height: target.getBounds().height
    }
    const p = this.container.globalToLocal(e.stageX, e.stageY)
    const qx = quantizer.roundX(p.x)

    switch (this.dragPosition.type) {
      case DRAG_POSITION.LEFT_EDGE:
      // 右端を固定して長さを変更
      bounds.width = bounds.width + bounds.x - qx 
      bounds.x = qx
      break
      case DRAG_POSITION.RIGHT_EDGE:
      // 左端を固定して長さを変更
      bounds.width = qx - bounds.x
      break
      case DRAG_POSITION.CENTER:
      // 移動
      bounds.x = quantizer.roundX(p.x - this.dragPosition.x)
      bounds.y = quantizer.roundY(p.y - this.dragPosition.y) 
      break
    }

    this.listener.onResizeNote(target.noteId, bounds)
  }

  updateCursor(e) {
    const cpos = this.container.globalToLocal(e.stageX, e.stageY)
    const view = this.getNoteViewUnderPoint(cpos.x, cpos.y)
    if (view) {
      const pos = view.globalToLocal(e.stageX, e.stageY)
      const type = this.getDragPositionType(pos.x, view.getBounds().width)
      switch (type) {
        case DRAG_POSITION.LEFT_EDGE:
        case DRAG_POSITION.RIGHT_EDGE: 
        this.setCursor("w-resize")
        break
        default:
        this.setCursor("move")
        break
      }
    } else {
      this.setCursor("default")
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

  setCursor(cursor) {
    const style = this.canvas.parentNode.style
    if (style.cursor != cursor) {
      style.cursor = cursor
    }
  }
}

class SelectionMouseHandler {
  constructor(container, selectionView, listener, selectedNoteIdStore) {
    this.container = container
    this.listener = listener
    this.selectionView = selectionView
    this.selectedNoteIdStore = selectedNoteIdStore
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
    }

    this.dragOffset = { 
      x: this.start.x - this.selectionRect.x, 
      y: this.start.y - this.selectionRect.y 
    }
  }

  onMouseMove(e) {
    if (!this.isMouseDown) {
      return
    }
    this.selectionView.visible = true

    const loc = this.container.globalToLocal(e.stageX, e.stageY)
    const bounds = this.selectionRect
    if (this.selectionView.fixed) {
      // 確定済みの選択範囲をドラッグした場合はノートと選択範囲を移動
      const qx = quantizer.roundX(loc.x - this.dragOffset.x)
      const qy = quantizer.roundY(loc.y - this.dragOffset.y)

      const movementX = qx - bounds.x
      const movementY = qy - bounds.y

      const changes = this.selectedNoteIds
        .map(id => { 
          const view = this.findNoteViewById(id)
          const b = view.getBounds()
          return {
            id: id,
            x: view.x + movementX,
            y: view.y + movementY,
            width: b.width,
            height: b.height
          }
        })

      this.listener.onMoveNotes(changes)
      bounds.x = qx
      bounds.y = qy
    } else {
      // 選択範囲の変形
      const rect = Rect.fromPoints(this.start, loc)
      bounds.x = quantizer.roundX(rect.x)
      bounds.y = quantizer.roundY(rect.y)
      bounds.width = (quantizer.roundX(rect.x + rect.width) - bounds.x) || quantizer.unitX
      bounds.height = (quantizer.roundY(rect.y + rect.height) - bounds.y) || quantizer.unitY
    }
    this.selectionRect = bounds
  }

  findNoteViewById(id) {
    return _.find(this.container.children, c => {
      return c instanceof NoteView && c.noteId == id
    }) 
  }

  getNoteIdsInRect(rect) {
    return this.container.children.filter(c => {
        if (!(c instanceof NoteView)) return
        const b = c.getBounds()
        return rect.contains(c.x, c.y, b.width, b.height)
      }).map(c => c.noteId)
  }

  set selectedNoteIds(ids) {
    this.selectedNoteIdStore.removeAll()
    this.selectedNoteIdStore.pushArray(ids)
    this.selectedNoteIdStore.trigger("change")
  }

  get selectedNoteIds() {
    return this.selectedNoteIdStore
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

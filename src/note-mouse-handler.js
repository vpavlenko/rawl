const DRAG_POSITION = {
  LEFT_EDGE: 0,
  CENTER: 1,
  RIGHT_EDGE: 2
}

class PencilMouseHandler {
  constructor(container, listener) {
    this.container = container
    this.listener = listener
    bindAllMethods(this)
  }

  resetCursor() {
    this.container.style.cursor = "default"
  }

  onMouseDownNote(e) {
    this.dragPosition = this.getPositionInNote(e)
  }

  onMouseDown(e) { 
    if (e.target == this.container) {
      const p = this.container.globalToLocal(e.stageX, e.stageY)
      this.listener.onCreateNote({
        x: quantizer.floorX(p.x),
        y: quantizer.floorY(p.y),
        width: quantizer.unitX
      })
    }
  }

  onPressMoveNote(e) {
    const bounds = e.target.getBounds()
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

    this.listener.onResizeNote(e.target.noteId, bounds)
  }

  getPositionInNote(e) {
    const width = e.target.getBounds().width
    const edgeSize = Math.min(width / 3, 8)
    const p = {
      x: e.localX,
      y: e.localY,
      type: DRAG_POSITION.CENTER
    }
    if (p.x <= edgeSize) { p.type = DRAG_POSITION.LEFT_EDGE }
    if (width - p.x <= edgeSize) { p.type = DRAG_POSITION.RIGHT_EDGE }
    console.log(p, width)
    return p
  }

  onMouseOverNote(e) {
    this.updateCursor(e)
  }

  onMouseOutNote(e) {
    this.setCursor("default")
  }

  setCursor(cursor) {
    const style = this.container.parent.canvas.style
    style.cursor = cursor
  }

  updateCursor(e) {
    switch (this.getPositionInNote(e).type) {
      case DRAG_POSITION.LEFT_EDGE:
      case DRAG_POSITION.RIGHT_EDGE: 
      this.setCursor("w-resize")
      break
      default:
      this.setCursor("move")
      break
    }
  }
}

class SelectionMouseHandler {
  constructor(container, listener) {
    this.container = container
    this.listener = listener
  }

  onMouseDown(e) { 
    this.start = this.getLocation(e)
    const clicked = new Rect(selection).containsPoint(this.start)
    if (!clicked) {
      // 選択範囲外でクリックした場合は選択範囲をリセット
      Object.assign(selection, {
        x: this.start.x,
        y: this.start.y,
        width: 0,
        height: 0,
        fixed: false,
        hidden: true
      })
      this.listener.onSelectNotes([])
    }

    this.dragOffset = { x: this.start.x - selection.x, y: this.start.y - selection.y }
  }

  onMouseMove(e) { 
    if (!this.isMouseDown) return
    selection.hidden = false

    const loc = this.getLocation(e)
    if (selection.fixed) {
      // 確定済みの選択範囲をドラッグした場合はノートと選択範囲を移動
      const qx = quantizer.roundX(loc.x - this.dragOffset.x)
      const qy = quantizer.roundY(loc.y - this.dragOffset.y)

      this.listener.onMoveNotes(selection.notes, {
        x: qx - selection.x,
        y: qy - selection.y
      })
      selection.x = qx
      selection.y = qy
    } else {
      // 選択範囲の変形
      const rect = Rect.fromPoints(this.start, loc)
      selection.x = quantizer.roundX(rect.x)
      selection.y = quantizer.roundY(rect.y)
      selection.width = (quantizer.roundX(rect.x + rect.width) - selection.x) || quantizer.unitX
      selection.height = (quantizer.roundY(rect.y + rect.height) - selection.y) || quantizer.unitY
    }
  }

  onMouseUp(e) { 
    if (!selection.fixed) {
      selection.fixed = true
      selection.notes = this.listener.notes.filter(n => new Rect(selection).containsPoint(n))
      this.listener.onSelectNotes(selection.notes)
    } else if (!this.isMouseMoved) {
      this.listener.onClickNotes(selection.notes, e)
    }
  }
}

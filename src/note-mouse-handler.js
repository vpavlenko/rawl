const DRAG_POSITION = {
  LEFT_EDGE: 0,
  CENTER: 1,
  RIGHT_EDGE: 2
}

class MouseHandler {
  constructor(container, listener) {
    this.container = container
    this.listener = listener
    this.startLocation = {x: undefined, y: undefined}
    this.isMouseDown = false
    this.isMouseMoved = false
  }

  onMouseDown(e) {
    this.startLocation = this.getLocation(e)
    this.isMouseDown = true
    this.isMouseMoved = false
  }

  onMouseMove(e) { 
    this.isMouseMoved = true
  }

  onMouseUp(e) {
    this.isMouseDown = false
    this.isMouseMoved = false
  }

  onMouseDownNote(e) {}
  resetCursor(e) {}
  updateCursor(e) {}
}

class PencilMouseHandler extends MouseHandler {
  constructor(container, listener) {
    super(container, listener)
    bindAllMethods(this)
  }

  resetCursor() {
    this.container.style.cursor = "default"
  }

  onMouseDownNote(e) {
    this.dragPosition = this.getPositionInNote(e)
  }

  onMouseDown(e) { 
    super.onMouseDown(e) 
    if (e.target == this.container) {
      this.listener.onCreateNote({
        x: quantizer.floorX(e.stageX),
        y: quantizer.floorY(e.stageY),
        width: quantizer.unitX
      })
    }
  }

  onPressMoveNote(e) {
    super.onMouseMove(e)

    const bounds = e.target.getBounds()
    const qx = quantizer.roundX(e.stageX)

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
      bounds.x = quantizer.roundX(e.stageX - this.dragPosition.x)
      bounds.y = quantizer.roundY(e.stageY - this.dragPosition.y) 
      break
    }

    this.listener.onResizeNote(e.target.noteId, bounds)
  }

  getPositionInNote(e) {
    const p = {
      x: e.stageX - e.target.x,
      y: e.stageY - e.target.y,
      type: DRAG_POSITION.CENTER
    }
    if (p.x <= 8) p.type = DRAG_POSITION.LEFT_EDGE
    if (e.target.getBounds().width - p.x <= 8) p.type = DRAG_POSITION.RIGHT_EDGE
    return p
  }

  updateCursor(e) {
    if (this.isMouseDown) return
    switch (this.getDragPosition(e)) {
      case DRAG_POSITION.LEFT_EDGE:
      case DRAG_POSITION.RIGHT_EDGE: 
      this.container.style.cursor = "w-resize"
      break
      default:
      this.container.style.cursor = "move"
      break
    }
  }
}

class SelectionMouseHandler extends MouseHandler {
  constructor(container) {
    super(container)
    bindAllMethods(this)
    this.container = container
  }

  onMouseDown(e) { 
    super.onMouseDown(e)
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
    super.onMouseMove(e)
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
    super.onMouseUp(e)
  }
}

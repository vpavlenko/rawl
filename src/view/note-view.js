function drawNoteView(g, note, bounds) {
  const alpha = note.velocity / 127
  const color = note.selected ? "black" : `rgba(88, 103, 250, ${alpha})`
  g.clear()
    .beginFill(color)
    .rect(0, 0, bounds.width, bounds.height)
    .setStrokeStyle(1)
    .beginStroke("black")
    .rect(0.5, 0.5, bounds.width - 1, bounds.height - 1)
}

class NoteView extends createjs.Shape {
  constructor() {
    super()
    this.setBounds(0, 0, 0, 0)
    this.isDirty = true
    this.mouseEnabled = false
  }

  refresh() {
    if (!this.isDirty || !this._note) return
    this.isDirty = false
    drawNoteView(this.graphics, this._note, this.getBounds())
  }

  _updateBounds() {
    if (!this._note || !this._transform) {
      return
    }
    const r = this._transform.getRect(this._note)
    this.x = r.x
    this.y = r.y
    this.setBounds(0, 0, r.width, r.height)
  }

  set transform(transform) {
    this._transform = transform
    this._updateBounds()
    this.isDirty = true
    this.refresh()
  }

  get note() {
    return this._note
  }

  set note(note) {
    this._note = note
    this._updateBounds()
    this.isDirty = true
    this.refresh()
  }
}

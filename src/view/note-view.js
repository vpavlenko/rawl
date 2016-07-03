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
    const b = this.getBounds()
    const alpha = this._note.velocity / 127
    const color = this._note.selected ? "black" : `rgba(88, 103, 250, ${alpha})`
    this.graphics
      .clear()
      .beginFill(color)
      .rect(0, 0, b.width, b.height)
      .setStrokeStyle(1)
      .beginStroke("black")
      .rect(0.5, 0.5, b.width - 1, b.height - 1)
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

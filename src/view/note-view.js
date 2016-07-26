function drawNoteView(g, note, bounds) {
  const alpha = note.velocity / 127
  const color = note.selected ? Theme.textColor : hslWithAlpha(Theme.themeColor, alpha)
  g.clear()
    .beginFill(color)
    .beginStroke(Theme.textColor)
    .rect(0, 0, bounds.width, bounds.height)
    .endFill()
    .beginStroke("rgba(255, 255, 255, 0.2)") // highlight
    .moveTo(1, 1)
    .lineTo(bounds.width, 1)
}

class NoteView extends createjs.Shape {
  constructor() {
    super()
    this.setBounds(0, 0, 0, 0)
    this.mouseEnabled = false
  }

  refresh() {
    if (!this._note) return
    drawNoteView(this.graphics, this._note, this.getBounds())
  }

  _updateBounds() {
    if (!this._note || !this._transform) {
      return
    }
    const r = this._transform.getRect(this._note)
    this.x = r.x + 0.5
    this.y = r.y + 0.5
    this.setBounds(0, 0, r.width, r.height)
  }

  set transform(transform) {
    this._transform = transform
    this._updateBounds()
    this.refresh()
  }

  get note() {
    return this._note
  }

  set note(note) {
    this._note = note
    this._updateBounds()
    this.refresh()
  }
}

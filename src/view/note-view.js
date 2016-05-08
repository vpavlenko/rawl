class NoteView extends createjs.Shape {
  constructor() {
    super()
    this.isSelected = false
    this.setBounds(0, 0, 0, 0)
    this.isDirty = true
  }
  
  setSize(width, height) {
    const b = this.getBounds()
    if (b.width == width && b.height == height) return
    this.setBounds(0, 0, width, height)
    this.isDirty = true
  }

  refresh() {
    if (!this.isDirty) return
    this.isDirty = false
    const b = this.getBounds()
    const alpha = this._velocity / 127
    const color = this.isSelected ? "black" : `rgba(88, 103, 250, ${alpha})`
    this.graphics
      .clear()
      .beginFill(color)
      .rect(0, 0, b.width, b.height)
      .setStrokeStyle(1)
      .beginStroke("black")
      .rect(0.5, 0.5, b.width - 1, b.height - 1)
  }

  set velocity(velocity) {
    this._velocity = velocity
    this.isDirty = true
  }

  get velocity() {
    return this._velocity
  }

  set selected(selected) {
    if (this.isSelected == selected) return
    this.isSelected = selected
    this.isDirty = true
    this.refresh()
  }
}

class NoteView extends createjs.Shape {
  constructor() {
    super()
    this.isSelected = false
    this.setBounds(0, 0, 0, 0)
  }
  
  setSize(width, height) {
    this.setBounds(0, 0, width, height)
    this.refresh()
  }

  refresh() {
    const b = this.getBounds()
    const color = this.isSelected ? "black" : "rgb(88, 103, 250)"
    this.graphics
      .clear()
      .beginFill(color)
      .rect(0, 0, b.width, b.height)
  }

  set selected(selected) {
    this.isSelected = selected
    this.refresh()
  }
}

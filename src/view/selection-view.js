class SelectionView extends createjs.Shape {
  constructor() {
    super()
  }
  
  setSize(width, height) {
    this.graphics
      .clear()
      .beginStroke("rgb(88, 103, 250)")
      .rect(0, 0, width, height)
    this.setBounds(0, 0, width, height)
  }
}

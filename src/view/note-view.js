class NoteView extends createjs.Shape {
  constructor() {
    super()
  }
  
  setSize(width, height) {
    this.graphics
      .clear()
      .beginFill("rgb(88, 103, 250)")
      .rect(0, 0, width, height)
    super.setBounds(0, 0, width, height)
  }
}

import Theme from "../Theme"

export default class SelectionView extends createjs.Shape {
  constructor() {
    super()
  }
  
  setSize(width, height) {
    this.graphics
      .clear()
      .beginStroke(Theme.themeColor)
      .rect(0, 0, width, height)
    this.setBounds(0, 0, width, height)
  }
}

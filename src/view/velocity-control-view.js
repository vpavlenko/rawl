class VelocityControlView extends createjs.Container {
  constructor(noteCoordConverter) {
    super()
    this.background = new createjs.Shape
    this.addChild(this.background)

    this.beatLine = new BeatLineView(noteCoordConverter)
    this.beatLine.endBeat = 1000
    this.addChild(this.beatLine)

    this.setBounds(0, 0, 0, 0)
  }

  setBounds(x, y, width, height) {
    super.setBounds(x, y, width, height)

    this.background.graphics.clear()
      .beginFill("white")
      .rect(0, 0, width, height)

    this.beatLine.height = height
  }

  set notes(notes) {
    const views = this.children.slice()
    this.removeAllChildren()
    views.filter(c => !c.noteId).forEach(c => {
      this.addChild(c)
    })

    const viewHeight = this.getBounds().height
    notes.forEach(note => {
      let view = _.find(views, c => c.noteId == note.id)
      if (!view) {
        view = new createjs.Shape
        view.noteId = note.id
      }
      view.x = note.x
      const height = note.velocity / 127 * viewHeight
      view.graphics
        .clear()
        .beginFill("rgb(88, 103, 250)")
        .rect(0, viewHeight - height, 5, height)
      this.addChild(view)
    })
  }
}
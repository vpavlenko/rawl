class BeatLineView extends createjs.Shape {
  constructor(noteCoordConverter) {
    super()
    this.noteCoordConverter = noteCoordConverter
  }

  set height(height) {
    this._height = height
    this.redraw()
  }

  set endBeat(endBeat) {
    this._endBeat = endBeat
    this.redraw()
  }

  redraw() {
    const g = this.graphics
      .clear()
      .setStrokeStyle(1)

    for (var beats = 0; beats < this._endBeat; beats++) {
      const isBold = beats % 4 == 0
      const alpha = isBold ? 0.5 : 0.1
      const x = this.noteCoordConverter.getPixelsAtBeats(beats) + 0.5
      g.beginStroke(`rgba(0, 0, 0, ${alpha})`)
        .moveTo(x, 0)
        .lineTo(x, this._height)
    }
  }
}

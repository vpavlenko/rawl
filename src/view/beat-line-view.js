class BeatLineView extends createjs.Shape {
  constructor(height, noteCoordConverter, endBeat) {
    super()
    this.snapToPixel = true

    const width = noteCoordConverter.getPixelsAtBeats(endBeat)

    const g = this.graphics
      .clear()
      .setStrokeStyle(1)

    for (var beats = 0; beats < endBeat; beats++) {
      const isBold = beats % 4 == 0
      const alpha = isBold ? 0.5 : 0.1
      const x = noteCoordConverter.getPixelsAtBeats(beats) + 0.5
      g.beginStroke(`rgba(0, 0, 0, ${alpha})`)
        .moveTo(x, 0)
        .lineTo(x, height)
    }
  }
}

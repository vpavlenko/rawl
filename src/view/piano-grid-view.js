class PianoGridView extends createjs.Container {
  constructor(keyHeight, numberOfKeys, noteCoordConverter, endBeat) {
    super()

    const width = noteCoordConverter.getPixelsAtBeats(endBeat)
    const height = keyHeight * numberOfKeys

    {
      const hLines = new createjs.Shape
      const g = hLines.graphics
        .clear()
        .setStrokeStyle(1)
        .beginStroke("rgba(0, 0, 0, 0.2)")

      for (var key = 0; key < numberOfKeys; key++) {
        const y = key * keyHeight + 0.5
        g.moveTo(0, y)
          .lineTo(width, y)
      }
      this.addChild(hLines)
    }

    {
      const vLines = new createjs.Shape
      const g = vLines.graphics
        .clear()
        .setStrokeStyle(1)
        .beginStroke("rgba(0, 0, 0, 0.2)")

      for (var beats = 0; beats < endBeat; beats++) {
        const x = noteCoordConverter.getPixelsAtBeats(beats) + 0.5
        g.moveTo(x, 0)
          .lineTo(x, height)
      }
      this.addChild(vLines)
    }
  }

  set cursorPosition(x) {

  }
}

class PianoGridView extends createjs.Container {
  constructor(keyHeight, numberOfKeys, rulerHeight, noteCoordConverter, endBeat) {
    super()

    const width = noteCoordConverter.getPixelsAtBeats(endBeat)
    const height = keyHeight * numberOfKeys + rulerHeight

    {
      const ruler = new createjs.Shape
      const g = ruler.graphics
        .clear()
        .setStrokeStyle(2)
        .beginStroke("rgba(0, 0, 0, 0.3)")

      for (var measure = 0; measure < endBeat / 4; measure++) {
        const x = noteCoordConverter.getPixelsAtBeats(measure * 4) + 0.5
        g.moveTo(x, 0)
          .lineTo(x, rulerHeight)

        const text = new createjs.Text(measure, "14px Consolas", "gray")
        text.x = x
        this.addChild(text)
      }
      this.addChild(ruler)
    }

    {
      const hLines = new createjs.Shape
      const g = hLines.graphics
        .clear()
        .setStrokeStyle(1)
        .beginStroke("rgba(0, 0, 0, 0.2)")

      for (var key = 0; key < numberOfKeys; key++) {
        const y = key * keyHeight + 0.5 + rulerHeight
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
        g.setStrokeStyle(beats % 4 == 0 ? 2 : 1)
          .moveTo(x, rulerHeight)
          .lineTo(x, height)
      }
      this.addChild(vLines)
    }
  }

  set cursorPosition(x) {

  }
}

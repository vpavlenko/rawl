class PianoGridView extends createjs.Container {
  constructor(keyHeight, numberOfKeys, rulerHeight, noteCoordConverter, endBeat) {
    super()
    this.snapToPixel = true

    const width = noteCoordConverter.getPixelsAtBeats(endBeat)

    {
      const hLines = new createjs.Shape
      const g = hLines.graphics
        .clear()
        .setStrokeStyle(1)

      for (var key = 0; key < numberOfKeys; key++) {
        const isBold = key % 12 == 5
        const alpha = isBold ? 0.3 : 0.1
        const y = key * keyHeight + 0.5 + rulerHeight
        g.beginStroke(`rgba(0, 0, 0, ${alpha})`)
          .moveTo(0, y)
          .lineTo(width, y)
      }
      this.addChild(hLines)
    }

    const height = keyHeight * numberOfKeys + rulerHeight
    const vLines = new BeatLineView(height, noteCoordConverter, endBeat)
    this.addChild(vLines)

    {
      this.ruler = new createjs.Container
      const lines = new createjs.Shape
      this.ruler.addChild(lines)
      const g = lines.graphics
        .clear()
        .beginFill("white")
        .rect(0, 0, width, rulerHeight)
        .setStrokeStyle(1)
        .beginStroke("rgba(0, 0, 0, 0.5)")
        .moveTo(0, rulerHeight + 0.5)
        .lineTo(width, rulerHeight + 0.5)
        .setStrokeStyle(1)
        .beginStroke("rgba(0, 0, 0, 0.2)")

      for (var measure = 0; measure < endBeat / 4; measure++) {
        const x = noteCoordConverter.getPixelsAtBeats(measure * 4) + 0.5
        g.moveTo(x, 0)
          .lineTo(x, rulerHeight)

        const text = new createjs.Text(measure, "14px Consolas", "gray")
        text.x = x + 5
        this.ruler.addChild(text)
      }
      
      // add ruler above notes
      // this.addChild(this.ruler)
    }

    {
      this.cursorLine = new createjs.Shape
      const g = this.cursorLine.graphics
        .clear()
        .setStrokeStyle(1)
        .beginStroke("rgba(255, 0, 0, 0.5)")
        .moveTo(0, rulerHeight)
        .lineTo(0, height)
      this.addChild(this.cursorLine)
    }
  }

  set cursorPosition(x) {
    this.cursorLine.x = x
  }

  set rulerY(y) {
    this.ruler.y = y
  }
}

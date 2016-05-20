"use strict"
class PianoGridView extends createjs.Container {
  constructor(numberOfKeys, rulerHeight, coordConverter) {
    super()
    this.numberOfKeys = numberOfKeys
    this.rulerHeight = rulerHeight
    this.coordConverter = coordConverter

    this.hLines = new createjs.Shape
    this.hLines.y = rulerHeight
    this.addChild(this.hLines)

    this.beatLine = new BeatLineView(coordConverter)
    this.addChild(this.beatLine)

    this.cursorLine = new createjs.Shape
    this.cursorLine.y = rulerHeight
    this.addChild(this.cursorLine)

    this.ruler = new createjs.Container
    this.ruler.lines = new createjs.Shape
    this.ruler.addChild(this.ruler.lines)
    // add ruler above notes

    this.redraw()
  }

  set keyHeight(keyHeight) {
    this._keyHeight = keyHeight
    this.redraw()
  }

  set endBeat(endBeat) {
    this._endBeat = endBeat
    this.beatLine.endBeat = endBeat
    this.redraw()
  }

  drawHorizontalLines(width, keyHeight, numberOfKeys) {
    const g = this.hLines.graphics
      .clear()
      .setStrokeStyle(1)

    for (var key = 0; key < numberOfKeys; key++) {
      const index = key % 12 
      const isBold = index == 5
      const isBlack = index == 1 || index == 3 || index == 6 || index == 8 || index == 10
      const alpha = isBold ? 0.3 : 0.1
      const y = key * keyHeight + 0.5
      if (isBlack) {
        g.beginFill("rgba(0, 0, 0, 0.04)")
          .rect(0, y, width, keyHeight)
          .endFill()
      }
      g.beginStroke(`rgba(0, 0, 0, ${alpha})`)
        .moveTo(0, y)
        .lineTo(width, y)
        .endStroke()
    }
  }

  drawRuler(width, height, endBeat) {
    const g = this.ruler.lines.graphics
      .clear()
      .beginFill("white")
      .rect(0, 0, width, height)
      .endFill()
      .setStrokeStyle(1)
      .beginStroke("rgba(0, 0, 0, 0.5)")
      .moveTo(0, height + 0.5)
      .lineTo(width, height + 0.5)
      .endStroke()
      .setStrokeStyle(1)
      .beginStroke("rgba(0, 0, 0, 0.2)")

    this.ruler.removeAllChildren()
    this.ruler.addChild(this.ruler.lines)

    for (var measure = 0; measure < endBeat / 4; measure++) {
      const x = this.coordConverter.getPixelsAtBeats(measure * 4) + 0.5
      g.moveTo(x, 0)
        .lineTo(x, height)

      const text = new createjs.Text(measure, "14px Consolas", "gray")
      text.x = x + 5
      this.ruler.addChild(text)
    }

    g.endStroke()
  }

  drawCursor(height) {
    this.cursorLine.graphics
      .clear()
      .setStrokeStyle(1)
      .beginStroke("rgba(255, 0, 0, 0.5)")
      .moveTo(0, 0)
      .lineTo(0, height)
  }

  redraw() {
    const width = this.coordConverter.getPixelsAtBeats(this._endBeat)
    const height = this._keyHeight * this.numberOfKeys + this.rulerHeight

    this.drawHorizontalLines(width, this._keyHeight, this.numberOfKeys)
    this.drawRuler(width, this.rulerHeight, this._endBeat)
    this.drawCursor(this._keyHeight * this.numberOfKeys)
    this.beatLine.height = height
  }

  set cursorPosition(x) {
    this.cursorLine.x = x
  }

  set rulerY(y) {
    this.ruler.y = y
  }
}

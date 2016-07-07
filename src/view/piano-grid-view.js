"use strict"

function drawHorizontalLines(g, transform, endTick) {
  g.clear().setStrokeStyle(1)

  const width = transform.getX(endTick)
  const keyHeight = transform.getPixelsPerKey()

  for (var key = 0; key < transform.getMaxNoteNumber(); key++) {
    const index = key % 12 
    const isBold = index == 5
    const isBlack = index == 1 || index == 3 || index == 6 || index == 8 || index == 10
    const alpha = isBold ? 0.3 : 0.1
    const y = transform.getY(key) + 0.5
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

function drawRuler(g, transform, endTick, ticksPerBeat, textContainer, height) {
  const width = transform.getX(endTick)

  g.clear()
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

  textContainer.removeAllChildren()

  for (var measure = 0; measure < endTick / ticksPerBeat; measure++) {
    const x = transform.getX(measure * ticksPerBeat) + 0.5
    g.moveTo(x, 0)
      .lineTo(x, height)

    const text = new createjs.Text(measure, "14px Consolas", "gray")
    text.x = x + 5
    textContainer.addChild(text)
  }

  g.endStroke()
}

function drawBeatLines(g, transform, endTick, ticksPerBeat) {
  g.clear().setStrokeStyle(1)

  const height = transform.getY(0)

  for (var beats = 0; beats < endTick / ticksPerBeat; beats++) {
    const isBold = beats % 4 == 0
    const alpha = isBold ? 0.5 : 0.1
    const x = transform.getX(beats * ticksPerBeat) + 0.5
    g.beginStroke(`rgba(0, 0, 0, ${alpha})`)
      .moveTo(x, 0)
      .lineTo(x, height)
  }
}

function drawCursor(g, transform) {
  const height = transform.getY(0)

  g.clear()
    .setStrokeStyle(1)
    .beginStroke("rgba(255, 0, 0, 0.5)")
    .moveTo(0, 0)
    .lineTo(0, height)
}

class PianoGridView extends createjs.Container {
  constructor(rulerHeight) {
    super()
    this.rulerHeight = rulerHeight

    this.hLines = new createjs.Shape
    this.hLines.y = rulerHeight
    this.addChild(this.hLines)

    this.beatLine = new createjs.Shape
    this.addChild(this.beatLine)

    this.cursorLine = new createjs.Shape
    this.cursorLine.y = rulerHeight
    this.addChild(this.cursorLine)

    this.ruler = new createjs.Container
    this.ruler.lines = new createjs.Shape
    this.ruler.texts = new createjs.Container
    this.ruler.addChild(this.ruler.lines)
    this.ruler.addChild(this.ruler.texts)
    // add ruler above notes
  }

  set ticksPerBeat(ticksPerBeat) {
    this._ticksPerBeat = ticksPerBeat
    this.beatLine.ticksPerBeat = ticksPerBeat
  }

  set transform(transform) {
    this._transform = transform
    this.redraw()
  }

  set endTick(endTick) {
    this._endTick = endTick
    this.redraw()
  }

  redraw() {
    if (!this._transform || !this._endTick || !this._ticksPerBeat) {
      return
    }
    drawHorizontalLines(this.hLines.graphics, this._transform, this._endTick)
    drawBeatLines(this.beatLine.graphics, this._transform, this._endTick, this._ticksPerBeat)
    drawRuler(this.ruler.lines.graphics, this._transform, this._endTick, this._ticksPerBeat, this.ruler.texts, this.rulerHeight)
    drawCursor(this.cursorLine.graphics, this._transform)
  }

  set cursorPosition(x) {
    this.cursorLine.x = x
  }

  set rulerY(y) {
    this.ruler.y = y
  }

  onScroll(x, y) {
    this.rulerY = -y
  }
}

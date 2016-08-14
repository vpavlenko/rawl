import createjs from "createjs"
import Theme from "../Theme"

function forEachBeats(ticksPerBeat, endTick, callback) {
  for (let beats = 0; beats < endTick / ticksPerBeat; beats++) {
    callback(beats)
  }
}

function forEachBeatPositions(transform, ticksPerBeat, endTick, callback) {
  forEachBeats(ticksPerBeat, endTick, beats => {
    callback(beats, transform.getX(beats * ticksPerBeat))
  })
}

function drawHorizontalLines(g, transform, endTick) {
  g.clear().setStrokeStyle(1)

  const width = transform.getX(endTick)
  const keyHeight = transform.getPixelsPerKey()

  for (var key = 0; key <= transform.getMaxNoteNumber(); key++) {
    const index = key % 12 
    const isBlack = index == 1 || index == 3 || index == 6 || index == 8 || index == 10
    const isBold = index == 11
    const y = transform.getY(key)
    if (isBlack) {
      g.beginFill(Theme.secondaryBackgroundColor)
        .rect(0, y, width, keyHeight)
        .endFill()
    }
    g.beginStroke(Theme.getDividerColorAccented(isBold))
      .moveTo(0, y)
      .lineTo(width, y)
      .endStroke()
  }
}

function drawRuler(g, transform, endTick, ticksPerBeat, textContainer, height) {
  const width = transform.getX(endTick)

  g.clear()
    .beginFill(Theme.backgroundColor)
    .rect(0, 0, width, height)
    .endFill()
    .setStrokeStyle(1)
    .beginStroke(Theme.secondaryTextColor)
    .moveTo(0, height)
    .lineTo(width, height)
    .endStroke()
    .setStrokeStyle(1)
    .beginStroke(Theme.secondaryTextColor)

  textContainer.removeAllChildren()

  forEachBeatPositions(transform, ticksPerBeat, endTick, (beats, x) => {
    if (beats % 4 != 0) return
    const measure = beats / 4

    g.moveTo(x, 0)
      .lineTo(x, height)

    const text = new createjs.Text(measure, `14px ${Theme.canvasFont}`, Theme.secondaryTextColor)
    text.x = x + 5
    text.y = 2
    textContainer.addChild(text)
  })

  g.endStroke()
}

function drawBeatLines(g, transform, endTick, ticksPerBeat) {
  g.clear().setStrokeStyle(1)

  const height = transform.getMaxY()

  forEachBeatPositions(transform, ticksPerBeat, endTick, (beats, x) => {
    const isBold = beats % 4 == 0
    g.beginStroke(Theme.getDividerColorAccented(isBold))
      .moveTo(x, 0)
      .lineTo(x, height)
  })
}

function drawCursor(g, transform) {
  const height = transform.getMaxY()

  g.clear()
    .setStrokeStyle(1)
    .beginStroke(Theme.themeColor)
    .moveTo(0, 0)
    .lineTo(0, height)
}

export default class PianoGridView extends createjs.Container {
  constructor(rulerHeight) {
    super()
    this.rulerHeight = rulerHeight

    this.hLines = new createjs.Shape
    this.hLines.y = rulerHeight + 0.5
    this.addChild(this.hLines)

    this.beatLine = new createjs.Shape
    this.beatLine.x = 0.5
    this.beatLine.y = rulerHeight
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
    this.redraw()
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

  onScroll(x, y) {
    this.ruler.y = -y + 0.5
  }
}

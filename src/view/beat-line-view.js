class BeatLineView extends createjs.Shape {
  constructor() {
    super()
  }

  set ticksPerBeat(ticksPerBeat) {
    this._ticksPerBeat = ticksPerBeat
    this.redraw()
  }

  set transform(t) {
    this._transform = t
    this.redraw()
  }

  set endTick(endTick) {
    this._endTick = endTick
    this.redraw()
  }

  redraw() {
    if (!this._transform || !this._endBeat || !this._ticksPerBeat) {
      return
    }
    const g = this.graphics
      .clear()
      .setStrokeStyle(1)

    const height = this._transform.getY(0)

    for (var beats = 0; beats < this._endTick / this._ticksPerBeat; beats++) {
      const isBold = beats % 4 == 0
      const alpha = isBold ? 0.5 : 0.1
      const x = this._transform.getX(beats * this._ticksPerBeat) + 0.5
      g.beginStroke(`rgba(0, 0, 0, ${alpha})`)
        .moveTo(x, 0)
        .lineTo(x, height)
    }
  }
}

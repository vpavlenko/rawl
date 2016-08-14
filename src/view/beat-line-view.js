import Theme from "../Theme"

export default class BeatLineView extends createjs.Shape {
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

  setBounds(x, y, w, h) {
    super.setBounds(x, y, w, h)
    this.redraw()
  }

  redraw() {
    if (!this._transform || !this._endTick || !this._ticksPerBeat || !this.getBounds()) {
      return
    }
    const g = this.graphics
      .clear()
      .setStrokeStyle(1)

    const height = this.getBounds().height

    for (var beats = 0; beats < this._endTick / this._ticksPerBeat; beats++) {
      const isBold = beats % 4 == 0
      const x = this._transform.getX(beats * this._ticksPerBeat) + 0.5
      g.beginStroke(Theme.getDividerColorAccented(isBold))
        .moveTo(x, 0)
        .lineTo(x, height)
    }
  }
}

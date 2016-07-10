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
      const alpha = isBold ? 0.5 : 0.1
      const x = this._transform.getX(beats * this._ticksPerBeat) + 0.5
      g.beginStroke(`rgba(0, 0, 0, ${alpha})`)
        .moveTo(x, 0)
        .lineTo(x, height)
    }
  }
}

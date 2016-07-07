function drawWhiteKey(g, y, width, height, isBordered) {
  g.beginFill("white")
    .drawRect(0, y, width, height)
    .endFill()

  if (isBordered) {
    g.setStrokeStyle(1)
      .beginStroke("gray")
      .moveTo(0, y + 0.5)
      .lineTo(width, y + 0.5)
      .endStroke()
  }
}

function drawBlackKey(g, y, width, height) {
  const innerWidth = width * 0.64
  const middle = Math.round(height / 2) + 0.5 + y

  g.beginFill("white")
    .drawRect(0, y, width, height)
    .endFill()
    .beginFill("black")
    .drawRect(0, y, innerWidth, height)
    .endFill()
    .setStrokeStyle(1)
    .beginStroke("gray")
    .moveTo(innerWidth, middle)
    .lineTo(width, middle)
    .endStroke()
}

class PianoKeysView extends createjs.Shape {
  constructor(width) {
    super()
    this._width = width
  }

  set transform(transform) {
    this._transform = transform
    this.redraw()
  }

  redraw() {
    if (!this._transform) {
      return
    }
    const keyHeight = this._transform.getPixelsPerKey()
    const numberOfKeys = this._transform.getMaxNoteNumber()
    const width = this._width
    const g = this.graphics.clear()

    // 0: white, 1: black
    const colors = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0]
    for (var i = 0; i < numberOfKeys; i++) {
      const isWhite = colors[i % colors.length] == 0
      const y = keyHeight * i
      if (isWhite) {
        const bordered = (i % 12 == 5) || (i % 12 == 0)
        drawWhiteKey(g, y, width, keyHeight, bordered)
      } else {
        drawBlackKey(g, y, width, keyHeight)
      }
    }
    
    g.setStrokeStyle(1)
      .beginStroke("rgba(0, 0, 0, 0.2)")
      .moveTo(width + 0.5, 0)
      .lineTo(width + 0.5, keyHeight * numberOfKeys)
  }

  onScroll(x, y) {
    this.x = -x
  }
}

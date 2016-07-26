const KEY_BORDER_COLOR = "rgba(0, 0, 0, 0.2)"

function drawWhiteKey(g, y, width, height, isBordered) {
  g.beginFill("white")
    .drawRect(0, y, width, height)
    .endFill()

  if (isBordered) {
    g.setStrokeStyle(1)
      .beginStroke(KEY_BORDER_COLOR)
      .moveTo(0, y)
      .lineTo(width, y)
      .endStroke()
  }
}

function drawBlackKey(g, y, width, height) {
  const innerWidth = width * 0.64
  const middle = Math.round(height / 2) + y

  g.beginFill("white")
    .drawRect(0, y, width, height)
    .endFill()
    .beginFill("black")
    .drawRect(0, y, innerWidth, height)
    .endFill()
    .setStrokeStyle(1)
    .beginStroke(KEY_BORDER_COLOR)
    .moveTo(innerWidth, middle)
    .lineTo(width, middle)
    .endStroke()
}

class PianoKeysView extends createjs.Container {
  constructor(width) {
    super()
    this._width = width

    this._shape = new createjs.Shape
    this._shape.y = 0.5
    this.addChild(this._shape)

    this._textContainer = new createjs.Container
    this.addChild(this._textContainer)
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
    const g = this._shape.graphics.clear()

    // 0: white, 1: black
    const colors = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0]
    for (let i = 0; i <= numberOfKeys; i++) {
      const isWhite = colors[i % colors.length] == 0
      const y = this._transform.getY(i)
      if (isWhite) {
        const bordered = (i % 12 == 4) || (i % 12 == 11)
        drawWhiteKey(g, y, width, keyHeight, bordered)
      } else {
        drawBlackKey(g, y, width, keyHeight)
      }
    }

    const height = keyHeight * (numberOfKeys + 1)
    
    g.setStrokeStyle(1)
      .beginStroke("gray")
      .moveTo(width + 0.5, 0)
      .lineTo(width + 0.5, height)
      .moveTo(0, 0)
      .lineTo(width, 0)
      .moveTo(0, height)
      .lineTo(width, height)

    this._textContainer.removeAllChildren()
    for (let i = 0; i <= numberOfKeys; i += 12) {
      const text = new createjs.Text(
        noteNameWithOctString(i), "12px Consolas", "gray")
      text.textAlign = "right"
      text.x = width - 5
      text.y = this._transform.getY(i)
      this._textContainer.addChild(text)
    }
  }

  onScroll(x, y) {
    this.x = -x
  }
}

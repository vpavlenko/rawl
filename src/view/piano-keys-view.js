function getWhiteKeyShape(width, height, isBordered) {
  const shape = new createjs.Shape

  shape.graphics
    .beginFill("white")
    .drawRect(0, 0, width, height)

  if (isBordered) {
    shape.graphics
      .setStrokeStyle(1)
      .beginStroke("gray")
      .moveTo(0, 0.5)
      .lineTo(width, 0.5)
  }

  return shape
}

function getBlackKeyShape(width, height) {
  const shape = new createjs.Shape
  const innerWidth = width * 0.64
  const middle = Math.round(height / 2) + 0.5

  shape.graphics
    .beginFill("white")
    .drawRect(0, 0, width, height)
    .beginFill("black")
    .drawRect(0, 0, innerWidth, height)
    .setStrokeStyle(1)
    .beginStroke("gray")
    .moveTo(innerWidth, middle)
    .lineTo(width, middle)

  return shape
}

class PianoKeysView extends createjs.Container {
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

    // 0: white, 1: black
    const colors = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0]
    for (var i = 0; i < numberOfKeys; i++) {
      const isWhite = colors[i % colors.length] == 0
      var shape
      if (isWhite) {
        const bordered = (i % 12 == 5) || (i % 12 == 0)
        shape = getWhiteKeyShape(width, keyHeight, bordered)
      } else {
        shape = getBlackKeyShape(width, keyHeight)
      }
      shape.y = keyHeight * i
      this.addChild(shape)
    }

    const rightBorder = new createjs.Shape
    rightBorder.graphics
      .setStrokeStyle(1)
      .beginStroke("rgba(0, 0, 0, 0.2)")
      .moveTo(width + 0.5, 0)
      .lineTo(width + 0.5, keyHeight * numberOfKeys)
    this.addChild(rightBorder)
  }
}

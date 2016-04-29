function getWhiteKeyShape(width, height, isBordered) {
  const shape = new createjs.Shape

  shape.graphics
    .beginFill("white")
    .drawRect(0, 0, width, height)

  if (isBordered) {
    shape.graphics
      .setStrokeStyle(1)
      .beginStroke("gray")
      .moveTo(0, 0)
      .lineTo(width, 0)
  }

  return shape
}

function getBlackKeyShape(width, height) {
  const shape = new createjs.Shape
  const innerWidth = width * 0.64

  shape.graphics
    .beginFill("white")
    .drawRect(0, 0, width, height)
    .beginFill("black")
    .drawRect(0, 0, innerWidth, height)
    .setStrokeStyle(1)
    .beginStroke("gray")
    .moveTo(innerWidth, height / 2)
    .lineTo(width, height / 2)

  return shape
}

class PianoKeysView extends createjs.Container {
  constructor(width, keyHeight, numberOfKeys) {
    super()

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
      shape.y = keyHeight * i + 0.5
      this.addChild(shape)
    }
  }
}

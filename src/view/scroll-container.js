// default browser scroll bar width
const SCROLL_BAR_SIZE = 17
const BAR_COLOR = "rgb(241, 241, 241)"
const ARROW_COLOR = "rgb(163, 163, 163)"
const ARROW_HILIGHT = "rgb(80, 80, 80)"
const HANDLE_COLOR = "rgb(193, 193, 193)"

const ScrollBarOrientaion = {
  HORIZONTAL: 0,
  VERTICAL: 1
}

class ScrollBar extends createjs.Container {
  constructor(orientation) {
    super()

    this._size = {
      width: 0,
      height: 0
    }
    this._contentLength = 0
    this._value = 0
    this.orientation = orientation

    this.background = new createjs.Shape
    this.addChild(this.background)

    this.handle = new createjs.Shape
    this.addChild(this.handle)
    this.handle.on("mousedown", e => {
      this.startPos = {
        x: e.stageX,
        y: e.stageY,
        value: this.value
      }
    })
    this.handle.on("pressmove", e => {
      this.value = this.startPos.value + this.startPos.y - e.stageY 
      console.log(this.value, this.startPos.y - e.stageY)
    })
  }

  get value() {
    return this._value
  }

  set value(value) {
    this._value = Math.min(0, value)
    this.redraw()
  }

  set size(size) {
    this._size = size
    this.setBounds(0, 0, size.width, size.height)
    this.redraw()
  }

  get size() {
    return this._size
  }

  get contentLength() {
    return this._contentLength
  }

  set contentLength(length) {
    this._contentLength = length
    this.redraw()
  }

  redraw() {
    this.background.graphics
      .clear()
      .beginFill(BAR_COLOR)
      .rect(0, 0, this.size.width, this.size.height)

    this.drawArrows()
    this.drawHandle()
  }

  drawHandle() {
    const isVertical = this.orientation == ScrollBarOrientaion.VERTICAL
    const size = [this.size.width, this.size.height]

    const px = isVertical ? 0 : 1
    const py = isVertical ? 1 : 0

    const maxLength = size[py] - size[px] * 2
    const maxValue =  size[py] - this._contentLength

    const handleSize = [
      size[px] * 0.8,
      maxLength * size[py] / this._contentLength
    ]

    const handlePos = [
      (size[px] - handleSize[0]) / 2,
      size[px] + (maxLength - handleSize[1]) * (this.value / maxValue)
    ]

    this.handle.graphics
      .clear()
      .beginFill(HANDLE_COLOR)
      .rect(handlePos[px], handlePos[py], handleSize[px], handleSize[py])
  }

  drawArrows() {
    const isVertical = this.orientation == ScrollBarOrientaion.VERTICAL
    const size = [this.size.width, this.size.height]

    // short side index
    const px = isVertical ? 0 : 1

    // long side index
    const py = isVertical ? 1 : 0

    const arrowWidth = size[px] * 0.5
    const arrowHeight = size[px] * 0.25
    const arrowMarginTop = (size[px] - arrowHeight) / 2
    const center = size[px] / 2
    const arrowRight = center + arrowWidth / 2
    const arrowLeft = center - arrowWidth / 2

    const lines = [
      [
        [center, arrowMarginTop],
        [arrowRight, arrowMarginTop + arrowHeight],
        [arrowLeft, arrowMarginTop + arrowHeight]
      ],
      [
        [center, size[py] - arrowMarginTop],
        [arrowRight, size[py] - arrowMarginTop - arrowHeight],
        [arrowLeft, size[py] - arrowMarginTop - arrowHeight]
      ]
    ]

    const g = this.background.graphics
      .beginFill(ARROW_COLOR)

    for (const points of lines) {
      points.forEach((point, i) => {
        if (i == 0) {
          g.moveTo(point[px], point[py])
        } else {
          g.lineTo(point[px], point[py])
        }
      })
    }
  }
}

class ScrollContainer extends createjs.Container {
  constructor(canvas) {
    super()
    this.container = new createjs.Container()
    this.addChild(this.container)

    this.scrollBarV = new ScrollBar(ScrollBarOrientaion.VERTICAL)
    this.addChild(this.scrollBarV)

    this.scrollBarH = new ScrollBar(ScrollBarOrientaion.HORIZONTAL)
    this.addChild(this.scrollBarH)

    canvas.addEventListener("mousewheel", e => {
      const h = this.contentSize.height - this.getBounds().height
      const w = this.contentSize.width - this.getBounds().width
      this.scrollY = Math.min(0, Math.max(this.scrollY + e.wheelDeltaY, -h))
      this.scrollX = Math.min(0, Math.max(this.scrollX + e.wheelDeltaX, -w))
    })

    this.superAddChild = this.addChild

    this.addChild = child => {
      this.container.addChild(child)
    }
  }

  get scrollX() {
    return this.container.x
  }

  set scrollX(x) {
    this.container.x = x
    this.scrollBarH.value = x
  }

  get scrollY() {
    return this.container.y
  }

  set scrollY(y) {
    this.container.y = y
    this.scrollBarV.value = y
  }

  set contentSize(size) {
    this.container.setBounds(0, 0, size.width, size.height)
    this.scrollBarH.contentLength = size.width
    this.scrollBarV.contentLength = size.height
  }

  get contentSize() {
    return {
      width: this.container.getBounds().width,
      height: this.container.getBounds().height,
    }
  }

  setBounds(x, y, width, height) {
    super.setBounds(x, y, width, height)
    this.contentSize = {
      width: Math.max(width, this.contentSize.width), 
      height: Math.max(height, this.contentSize.height)
    }

    this.scrollBarV.x = width - SCROLL_BAR_SIZE
    this.scrollBarV.size = {
      width: SCROLL_BAR_SIZE,
      height: height - SCROLL_BAR_SIZE
    }

    this.scrollBarH.y = height - SCROLL_BAR_SIZE
    this.scrollBarH.size = {
      width: width - SCROLL_BAR_SIZE,
      height: SCROLL_BAR_SIZE
    }
  }
}

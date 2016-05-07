// default browser scroll bar width
const SCROLL_BAR_SIZE = 17
const BAR_COLOR = "rgb(241, 241, 241)"
const ARROW_COLOR = "rgb(80, 80, 80)"
const ARROW_DISABLED_COLOR = "rgb(163, 163, 163)"
const ARROW_HILIGHT = "#fff"
const ARROWBG_HOVER_COLOR = "#d2d2d2"
const ARROWBG_ACTIVE_COLOR = "#787878"
const HANDLE_COLOR = "rgb(193, 193, 193)"
const HANDLE_HOVER_COLOR = "#a8a8a8"
const HANDLE_ACTIVE_COLOR = "#787878"

const ScrollBarOrientaion = {
  HORIZONTAL: 0,
  VERTICAL: 1
}

const ButtonState = {
  NORMAL: 0,
  HOVER: 1,
  ACTIVE: 2,
  DISABLE: 3
}

class ShapeButton extends createjs.Shape {
  constructor() {
    super()
    this.setBounds(0, 0, 0, 0)
    this._state = ButtonState.NORMAL
    this._enable = true
    this.foregroundColors = ["red", "green", "yellow", "blue"]
    this.backgroundColors = ["blue", "red", "green", "yellow"]
    this.on("mouseover", e => {
      this.state = ButtonState.HOVER
    })
    this.on("mouseout", e => {
      this.state = ButtonState.NORMAL
    })
    this.on("mousedown", e => {
      this.state = ButtonState.ACTIVE
    })
    this.on("pressup", e => {
      this.state = e.target.hitTest(e.localX, e.localY) ? 
        ButtonState.HOVER : ButtonState.NORMAL
    })
  }

  set enable(enable) {
    this._enable = enable
    this.state = this._state
  }

  get isEnabled() {
    return this._enable
  }

  get state() {
    return this._state
  }

  set state(state) {
    this._state = this.isEnabled ? state : ButtonState.DISABLE
    this.redraw()
  }

  redraw() {
    this.graphics
      .clear()
      .beginFill(this.backgroundColors[this.state])
      .rect(0, 0, this.getBounds().width, this.getBounds().height)
    this.drawForeground(this.foregroundColors[this.state])
  }

  drawForeground(color) {
    // override
  }

  setForegroundColor(state, color) {
    this.foregroundColors[state] = color
    this.redraw()
  }

  setBackgroundColor(state, color) {
    this.backgroundColors[state] = color
    this.redraw()
  }
}

class ArrowButton extends ShapeButton {
  constructor(arrowRotation) {
    super()
    this.arrowRotation = arrowRotation
    this.arrowWidth = 10
    this.arrowHeight = 5
  }

  drawForeground(color) {
    function drawPoints(g, mat, points) {
      points.forEach((point, i) => {
        const p = mat.transformPoint(point[0], point[1])
        p.x = Math.floor(p.x)
        p.y = Math.floor(p.y)
        if (i == 0) {
          g.moveTo(p.x, p.y)
        } else {
          g.lineTo(p.x, p.y)
        }
      })
    }

    const b = this.getBounds()
    const mat = new createjs.Matrix2D()
      .translate(b.width / 2, b.height / 2)
      .rotate(this.arrowRotation)

    const g = this.graphics
      .beginFill(color)
    drawPoints(g, mat, [
      [0, -this.arrowHeight / 2],
      [this.arrowWidth / 2, this.arrowHeight / 2],
      [-this.arrowWidth / 2, this.arrowHeight / 2]
    ])
  }
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
    this.unitIncrement = 120
    this.orientation = orientation

    this.background = new createjs.Shape
    this.addChild(this.background)

    const rot = this.isVertical ? 0 : -90

    this.headArrow = new ArrowButton(rot)
    this.headArrow.setBackgroundColor(ButtonState.NORMAL, BAR_COLOR)
    this.headArrow.setBackgroundColor(ButtonState.HOVER, ARROWBG_HOVER_COLOR)
    this.headArrow.setBackgroundColor(ButtonState.ACTIVE, ARROWBG_ACTIVE_COLOR)
    this.headArrow.setForegroundColor(ButtonState.NORMAL, ARROW_COLOR)
    this.headArrow.setForegroundColor(ButtonState.HOVER, ARROW_COLOR)
    this.headArrow.setForegroundColor(ButtonState.ACTIVE, ARROW_HILIGHT)
    this.headArrow.on("click", e => {
      this._changeValue(e, this.value + this.unitIncrement)
    })
    this.addChild(this.headArrow)

    this.tailArrow = new ArrowButton(rot + 180)
    this.tailArrow.setBackgroundColor(ButtonState.NORMAL, BAR_COLOR)
    this.tailArrow.setBackgroundColor(ButtonState.HOVER, ARROWBG_HOVER_COLOR)
    this.tailArrow.setBackgroundColor(ButtonState.ACTIVE, ARROWBG_ACTIVE_COLOR)
    this.tailArrow.setForegroundColor(ButtonState.NORMAL, ARROW_COLOR)
    this.tailArrow.setForegroundColor(ButtonState.HOVER, ARROW_COLOR)
    this.tailArrow.setForegroundColor(ButtonState.ACTIVE, ARROW_HILIGHT)
    this.tailArrow.on("click", e => {
      this._changeValue(e, this.value - this.unitIncrement)
    })
    this.addChild(this.tailArrow)

    this.handle = new ShapeButton
    this.handle.setBackgroundColor(ButtonState.NORMAL, HANDLE_COLOR)
    this.handle.setBackgroundColor(ButtonState.HOVER, HANDLE_HOVER_COLOR)
    this.handle.setBackgroundColor(ButtonState.ACTIVE, HANDLE_ACTIVE_COLOR)
    this.handle.on("mousedown", e => {
      this.startPos = {
        x: e.stageX,
        y: e.stageY,
        value: this.value
      }
    })
    this.handle.on("pressmove", e => {
      const delta = this.isVertical ? this.startPos.y - e.stageY : this.startPos.x - e.stageX
      this._changeValue(e, this.startPos.value + this.positionToValue(delta))
    })
    this.addChild(this.handle)
  }

  _changeValue(e, value) {
    const changed = this._value != value
    this.value = value
    if (changed) this.dispatchEvent("change", e)
  }

  get value() {
    return this._value
  }

  set value(value) {
    this._value = Math.max(Math.min(0, value), this.maxValue)
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

  get barWidth() {
    return this.isVertical ? this.size.width : this.size.height
  }

  get barLength() {
    return !this.isVertical ? this.size.width : this.size.height
  }

  get isVertical() {
    return this.orientation == ScrollBarOrientaion.VERTICAL
  }

  get maxValue() {
    return this.barLength - this._contentLength
  }

  positionToValue(pos) {
    return pos * this._contentLength / (this.barLength - 2 * this.barWidth)
  }

  drawHandle() {
    const maxLength = this.barLength - this.barWidth * 2

    const handleSize = [
      this.barWidth * 0.8,
      maxLength * this.barLength / this._contentLength
    ]

    const handlePos = [
      (this.barWidth - handleSize[0]) / 2,
      this.barWidth + maxLength * (1 - this.barLength / this._contentLength) * (this.value / this.maxValue)
    ]

    const px = this.isVertical ? 0 : 1
    const py = this.isVertical ? 1 : 0
      
    this.handle.x = handlePos[px]
    this.handle.y = handlePos[py]
    this.handle.setBounds(0, 0, handleSize[px], handleSize[py])
    this.handle.redraw()
  }

  drawArrows() {
    const size = this.barWidth
    const px = this.isVertical ? 0 : 1
    const py = this.isVertical ? 1 : 0

    const tailPos = [0, this.barLength - size]
    this.tailArrow.x = tailPos[px]
    this.tailArrow.y = tailPos[py]

    this.headArrow.setBounds(0, 0, size, size)
    this.tailArrow.setBounds(0, 0, size, size)
    this.headArrow.arrowWidth = size / 2
    this.headArrow.arrowHeight = size / 4
    this.tailArrow.arrowWidth = size / 2
    this.tailArrow.arrowHeight = size / 4
    this.headArrow.redraw()
    this.tailArrow.redraw()
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

    this.scrollBarV.on("change", e => {
      this.container.y = e.target.value
    })

    this.scrollBarH.on("change", e => {
      this.container.x = e.target.value
    })

    canvas.addEventListener("mousewheel", e => {
      const h = this.contentSize.height - this.getBounds().height
      const w = this.contentSize.width - this.getBounds().width
      this.scrollY = Math.min(0, Math.max(this.scrollY + e.wheelDeltaY, -h - SCROLL_BAR_SIZE))
      this.scrollX = Math.min(0, Math.max(this.scrollX + e.wheelDeltaX, -w - SCROLL_BAR_SIZE))
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

// default browser scroll bar width
const SCROLL_BAR_SIZE = 17
const BAR_COLOR = "rgb(241, 241, 241)"
const ARROW_COLOR = "rgb(163, 163, 163)"
const ARROW_HILIGHT = "rgb(80, 80, 80)"
const HANDLE_COLOR = "rgb(193, 193, 193)"

class ScrollBar extends createjs.Shape {
  constructor() {
    super()
  }

  set size(size) {
    this._size = size
    this.setBounds(0, 0, size.width, size.height)
    this.redraw()
  }

  get size() {
    return this._size
  }

  redraw() {
    this.graphics
      .clear()
      .beginFill(BAR_COLOR)
      .rect(0, 0, this.size.width, this.size.height)
  }
}

class ScrollBarV extends ScrollBar {
  constructor() {
    super()
  }

  redraw() {
    super.redraw()
    const w = this.size.width
    const h = this.size.height
    const arrowWidth = w * 0.5
    const arrowHeight = arrowWidth * 0.5
    const arrowMarginTop = (w - arrowHeight) / 2
    const center = w / 2
    const arrowRight = center + arrowWidth / 2
    const arrowLeft = center - arrowWidth / 2
    this.graphics
      .beginFill(ARROW_COLOR)
      .moveTo(center, arrowMarginTop)
      .lineTo(arrowRight, arrowMarginTop + arrowHeight)
      .lineTo(arrowLeft, arrowMarginTop + arrowHeight)
      .moveTo(center, h - arrowMarginTop)
      .lineTo(arrowRight, h - arrowMarginTop - arrowHeight)
      .lineTo(arrowLeft, h - arrowMarginTop - arrowHeight)
  }
}

class ScrollBarH extends ScrollBar {
  constructor() {
    super()
  }

  redraw() {
    super.redraw()
    const w = this.size.width
    const h = this.size.height
    const arrowHeight = h * 0.5
    const arrowWidth = arrowHeight * 0.5
    const arrowMarginLeft = (h - arrowHeight) / 2
    const middle = h / 2
    const arrowTop = middle + arrowHeight / 2
    const arrowBottom = middle - arrowHeight / 2
    this.graphics
      .beginFill(ARROW_COLOR)
      .moveTo(arrowMarginLeft, middle)
      .lineTo(arrowMarginLeft + arrowWidth, arrowTop)
      .lineTo(arrowMarginLeft + arrowWidth, arrowBottom)
      .moveTo(w - arrowMarginLeft, middle)
      .lineTo(w - arrowMarginLeft - arrowWidth, arrowBottom)
      .lineTo(w - arrowMarginLeft - arrowWidth, arrowTop)
  }
}

class ScrollContainer extends createjs.Container {
  constructor(canvas) {
    super()
    this.container = new createjs.Container()
    this.addChild(this.container)

    this.scrollBarV = new ScrollBarV()
    this.addChild(this.scrollBarV)

    this.scrollBarH = new ScrollBarH()
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
  }

  get scrollY() {
    return this.container.y
  }

  set scrollY(y) {
    this.container.y = y
  }

  set contentSize(size) {
    this.container.setBounds(0, 0, size.width, size.height)
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
      height: height
    }

    this.scrollBarH.y = height - SCROLL_BAR_SIZE
    this.scrollBarH.size = {
      width: width,
      height: SCROLL_BAR_SIZE
    }
  }
}

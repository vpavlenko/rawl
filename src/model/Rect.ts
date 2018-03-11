interface IRect {
  x: number
  y: number
  width: number
  height: number
}

export default class Rect implements IRect {
  x: number
  y: number
  width: number
  height: number

  constructor(x: number|IRect = 0, y = 0, width = 0, height = 0) {
    if (x instanceof Object) {
      const r = x as IRect
      this.x = r.x
      this.y = r.y
      this.width = r.width
      this.height = r.height
      return
    }
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  contains(x, y) {
    return this.containsPoint({ x, y })
  }

  containsPoint(point) {
    return point.x >= this.x && point.x <= this.x + this.width &&
      point.y >= this.y && point.y <= this.y + this.height
  }

  intersects(rect) {
    if (!(rect instanceof Rect)) {
      rect = new Rect(rect)
    }
    return !(this.right < rect.x
      || rect.right < this.x
      || this.bottom < rect.y
      || rect.bottom < this.y)
  }

  containsRect(rect) {
    if (!(rect instanceof Rect)) {
      rect = new Rect(rect)
    }
    return this.containsPoint(rect.tl()) && this.containsPoint(rect.br())
  }

  get right() {
    return this.x + this.width
  }

  get bottom() {
    return this.y + this.height
  }

  tl() {
    return { x: this.x, y: this.y }
  }

  br() {
    return {
      x: this.x + this.width,
      y: this.y + this.height
    }
  }

  static fromPoints(pointA, pointB) {
    const r = new Rect()

    const x1 = Math.min(pointA.x, pointB.x)
    const x2 = Math.max(pointA.x, pointB.x)
    r.x = x1
    r.width = x2 - x1

    const y1 = Math.min(pointA.y, pointB.y)
    const y2 = Math.max(pointA.y, pointB.y)
    r.y = y1
    r.height = y2 - y1

    return r
  }

  scale(scaleX, scaleY) {
    const r = new Rect()

    r.x = this.x * scaleX
    r.y = this.y * scaleY
    r.width = this.width * scaleX
    r.height = this.height * scaleY

    return r
  }
}

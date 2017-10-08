export default class Rect {
  constructor(x, y, width, height) {
    if (x instanceof Object) {
      this.x = x.x
      this.y = x.y
      this.width = x.width
      this.height = x.height
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

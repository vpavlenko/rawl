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

  containsPoint(point) {
    return point.x >= this.x && point.x <= this.x + this.width &&
           point.y >= this.y && point.y <= this.y + this.height
  }
  
  static fromPoints(p1, p2) {
    var right = Math.max(p1.x, p2.x)
    var bottom = Math.max(p1.y, p2.y)
    var left = Math.min(p1.x, p2.x)
    var top = Math.min(p1.y, p2.y)
    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top
    }
  }
}

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
    return this.containsPoint({x, y})
  }

  containsPoint(point) {
    return point.x >= this.x && point.x <= this.x + this.width &&
           point.y >= this.y && point.y <= this.y + this.height
  }
}

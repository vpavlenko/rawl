export interface IPoint {
  x: number
  y: number
}

export default class Point {
  x: number
  y: number
  
  Point(x: number, y: number) {
    this.x = x
    this.y = y
  }
}
import Item from "components/Stage/Item"
import { IRect } from "common/geometry"

export default class TempoGraphItem implements Item {
  id: number
  bounds: IRect
  fillColor: any
  strokeColor: any
  
  constructor(id, x, y, width, height, fillColor, strokeColor) {
    this.id = id
    this.bounds = { x, y, width, height }
    this.fillColor = fillColor
    this.strokeColor = strokeColor
  }

  render(ctx) {
    ctx.fillStyle = this.fillColor
    ctx.strokeStyle = this.strokeColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.rect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height)
    ctx.fill()
    ctx.stroke()
  }
}

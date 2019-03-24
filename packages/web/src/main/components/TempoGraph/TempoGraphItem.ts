import Item from "components/Stage/Item"
import { IRect } from "common/geometry"
import { CanvasDrawStyle } from "main/style"

export default class TempoGraphItem implements Item {
  id: number
  bounds: IRect
  fillColor: CanvasDrawStyle
  strokeColor: CanvasDrawStyle

  constructor(
    id: number,
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor: CanvasDrawStyle,
    strokeColor: CanvasDrawStyle
  ) {
    this.id = id
    this.bounds = { x, y, width, height }
    this.fillColor = fillColor
    this.strokeColor = strokeColor
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.fillColor
    ctx.strokeStyle = this.strokeColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.rect(
      this.bounds.x,
      this.bounds.y,
      this.bounds.width,
      this.bounds.height
    )
    ctx.fill()
    ctx.stroke()
  }
}

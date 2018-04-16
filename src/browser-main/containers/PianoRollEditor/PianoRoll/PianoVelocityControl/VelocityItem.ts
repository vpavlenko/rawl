import Item from "components/Stage/Item"
import { IRect } from "common/geometry"

function drawEvent(ctx, fillColor, strokeColor, { x, y, width, height }, selected) {
  const color = selected ? strokeColor : fillColor

  x = Math.round(x)
  y = Math.round(y)
  width = Math.round(width)
  height = Math.round(height)

  ctx.beginPath()
  ctx.fillStyle = color
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 1
  ctx.rect(x, y, width, height)
  ctx.fill()
  ctx.stroke()
}

export default class VelocityItem implements Item {
  readonly id: number
  readonly bounds: IRect
  readonly selected: boolean
  readonly fillColor: any

  constructor(id: number, bounds: IRect, selected: boolean, fillColor: any) {
    this.id = id
    this.bounds = bounds
    this.selected = selected
    this.fillColor = fillColor
  }

  render(ctx) {
    drawEvent(ctx, this.fillColor, "black", this.bounds, this.selected)
  }
}

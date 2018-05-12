import Item from "components/Stage/Item.ts"
import { IRect, right as rectRight, bottom as rectBottom } from "common/geometry"

export default class LineGraphItem implements Item {
  id: any
  bounds: IRect
  startY: number
  endY: number
  strokeColor: any
  fillColor: any
  lineWidth: number

  constructor(id: any, x: number, startY: number, endY: number, width: number, height: number, strokeColor: any, fillColor: any, lineWidth: number) {
    this.id = id
    this.bounds = { x, y: 0, width, height }

    this.startY = startY
    this.endY = endY
    this.strokeColor = strokeColor
    this.fillColor = fillColor
    this.lineWidth = lineWidth
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.beginPath()
    ctx.strokeStyle = this.strokeColor
    ctx.fillStyle = this.fillColor
    ctx.lineWidth = this.lineWidth

    ctx.moveTo(this.bounds.x, this.startY)
    ctx.lineTo(rectRight(this.bounds), this.endY)

    ctx.stroke()

    const right = rectRight(this.bounds)
    const bottom = rectBottom(this.bounds)

    ctx.moveTo(this.bounds.x, this.startY)
    ctx.lineTo(right, this.endY)
    ctx.lineTo(right, bottom)
    ctx.lineTo(this.bounds.x, bottom)

    ctx.globalAlpha = 0.1
    ctx.fill()
    ctx.restore()
  }
}
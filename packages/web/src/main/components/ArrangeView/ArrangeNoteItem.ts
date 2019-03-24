import Item from "components/Stage/Item"
import { IRect, IPoint } from "common/geometry"

export default class ArrangeNoteItem implements Item {
  id: number
  bounds: IRect
  isDrum: boolean

  constructor(id: number, bounds: IRect, isDrum: boolean) {
    this.id = id
    this.bounds = bounds
    this.isDrum = isDrum
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.isDrum) {
      drawDrumNote(ctx, this.bounds)
    } else {
      drawNote(ctx, this.bounds)
    }
  }
}

function drawNote(ctx: CanvasRenderingContext2D, { x, y, width }: IRect) {
  ctx.beginPath()
  ctx.strokeStyle = "blue"
  ctx.lineWidth = 1
  ctx.moveTo(Math.round(x), Math.round(y))
  ctx.lineTo(Math.round(x + width), Math.round(y))
  ctx.stroke()
}

function drawDrumNote(ctx: CanvasRenderingContext2D, { x, y }: IPoint) {
  ctx.beginPath()
  ctx.strokeStyle = "blue"
  ctx.lineWidth = 2
  ctx.moveTo(Math.round(x), Math.round(y))
  ctx.lineTo(Math.round(x + 2), Math.round(y))
  ctx.stroke()
}

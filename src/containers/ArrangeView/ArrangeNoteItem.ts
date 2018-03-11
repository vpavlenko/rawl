import Item from "components/Stage/Item"
import { IRect } from "model/Rect"

export default class ArrangeNoteItem implements Item {
  id: number
  bounds: IRect
  isDrum: boolean

  constructor(id, bounds, isDrum) {
    this.id = id
    this.bounds = bounds
    this.isDrum = isDrum
  }

  render(ctx) {
    if (this.isDrum) {
      drawDrumNote(ctx, this.bounds)
    } else {
      drawNote(ctx, this.bounds)
    }
  }
}

function drawNote(ctx, rect) {
  const { x, y, width } = rect

  ctx.beginPath()
  ctx.strokeStyle = "blue"
  ctx.lineWidth = 1
  ctx.moveTo(Math.round(x), Math.round(y))
  ctx.lineTo(Math.round(x + width), Math.round(y))
  ctx.stroke()
}

function drawDrumNote(ctx, rect) {
  const { x, y } = rect

  ctx.beginPath()
  ctx.strokeStyle = "blue"
  ctx.lineWidth = 2
  ctx.moveTo(Math.round(x), Math.round(y))
  ctx.lineTo(Math.round(x + 2), Math.round(y))
  ctx.stroke()
}
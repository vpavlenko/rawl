import StageItem from "components/Stage/Item.ts"
import Rect from "model/Rect"

export default class LineGraphItem extends StageItem {
  constructor(id, x, startY, endY, width, height, strokeColor, fillColor, lineWidth) {
    super()

    this.id = id
    this.bounds = new Rect(x, 0, width, height)

    this.startY = startY
    this.endY = endY
    this.strokeColor = strokeColor
    this.fillColor = fillColor
    this.lineWidth = lineWidth
  }

  render(ctx) {
    ctx.save()
    ctx.beginPath()
    ctx.strokeStyle = this.strokeColor
    ctx.fillStyle = this.fillColor
    ctx.lineWidth = this.lineWidth

    ctx.moveTo(this.bounds.x, this.startY)
    ctx.lineTo(this.bounds.right, this.endY)

    ctx.stroke()

    ctx.moveTo(this.bounds.x, this.startY)
    ctx.lineTo(this.bounds.right, this.endY)
    ctx.lineTo(this.bounds.right, this.bounds.bottom)
    ctx.lineTo(this.bounds.x, this.bounds.bottom)

    ctx.globalAlpha = 0.1
    ctx.fill()
    ctx.restore()
  }
}
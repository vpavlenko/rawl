import StageItem from "components/Stage/Item.ts"

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

export default class VelocityItem extends StageItem {
  constructor(id, bounds, selected, fillColor) {
    super()
    this.id = id
    this.bounds = bounds
    this.selected = selected
    this.fillColor = fillColor
  }

  render(ctx) {
    drawEvent(ctx, this.fillColor, "black", this.bounds, this.selected)
  }
}

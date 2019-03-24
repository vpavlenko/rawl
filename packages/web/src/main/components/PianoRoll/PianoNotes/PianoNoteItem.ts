import Item from "components/Stage/Item"
import { IRect } from "common/geometry"
import { CanvasDrawStyle } from "main/style"
import { RGB, colorStr } from "common/color/rgb"

export default class PianoNoteItem implements Item {
  id: number
  noteBounds: IRect
  drumBounds: IRect
  velocity: number
  isSelected: boolean
  isDrum: boolean
  color: RGB
  borderColor: CanvasDrawStyle
  selectedColor: RGB

  constructor(
    id: number,
    x: number,
    y: number,
    width: number,
    height: number,
    velocity: number,
    isSelected: boolean,
    isDrum: boolean,
    color: RGB,
    borderColor: RGB,
    selectedColor: RGB
  ) {
    this.id = id
    this.noteBounds = { x, y, width, height }
    this.drumBounds = { x, y, width: height, height }
    this.velocity = velocity
    this.isSelected = isSelected
    this.isDrum = isDrum
    this.color = color
    this.borderColor = colorStr(borderColor)
    this.selectedColor = selectedColor
  }

  get bounds(): IRect {
    return this.isDrum ? this.drumBounds : this.noteBounds
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.isDrum) {
      this.drawDrumNote(ctx)
    } else {
      this.drawNote(ctx)
    }
  }

  drawNote(ctx: CanvasRenderingContext2D) {
    const alpha = this.velocity / 127
    const noteColor = this.isSelected ? this.selectedColor : this.color
    let { x, y, width, height } = this.bounds

    x = Math.round(x)
    y = Math.round(y)
    width = Math.round(width - 1) // 次のノートと被らないように小さくする
    height = Math.round(height)

    const grad = ctx.createLinearGradient(x, y, x, y + height)
    grad.addColorStop(0, colorStr(noteColor, alpha * 0.8))
    grad.addColorStop(1, colorStr(noteColor, alpha))

    ctx.fillStyle = grad
    ctx.strokeStyle = this.borderColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.rect(x, y, width, height)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }

  drawDrumNote(ctx: CanvasRenderingContext2D) {
    const alpha = this.velocity / 127
    const noteColor = this.isSelected
      ? colorStr(this.selectedColor)
      : colorStr(this.color, alpha)
    let { x, y, height } = this.bounds
    x = Math.round(x)
    y = Math.round(y)
    height = Math.round(height)
    const radius = Math.round(height / 2)

    ctx.beginPath()
    ctx.arc(x, y + radius, radius, 0, 2 * Math.PI)
    ctx.fillStyle = noteColor
    ctx.strokeStyle = this.borderColor
    ctx.lineWidth = 1
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }
}

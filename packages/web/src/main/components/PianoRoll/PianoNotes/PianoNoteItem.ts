import Item from "components/Stage/Item"
import { IRect } from "common/geometry"
import { CanvasDrawStyle } from "main/style"

export default class PianoNoteItem implements Item {
  id: number
  noteBounds: IRect
  drumBounds: IRect
  velocity: number
  isSelected: boolean
  isDrum: boolean
  color: CanvasDrawStyle
  borderColor: CanvasDrawStyle
  selectedColor: CanvasDrawStyle
  selectedBorderColor: CanvasDrawStyle

  constructor(
    id: number,
    x: number,
    y: number,
    width: number,
    height: number,
    velocity: number,
    isSelected: boolean,
    isDrum: boolean,
    color: CanvasDrawStyle,
    borderColor: CanvasDrawStyle,
    selectedColor: CanvasDrawStyle,
    selectedBorderColor: CanvasDrawStyle
  ) {
    this.id = id
    this.noteBounds = { x, y, width, height }
    this.drumBounds = { x, y, width: height, height }
    this.velocity = velocity
    this.isSelected = isSelected
    this.isDrum = isDrum
    this.color = color
    this.borderColor = borderColor
    this.selectedColor = selectedColor
    this.selectedBorderColor = selectedBorderColor
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

    ctx.globalAlpha = alpha
    ctx.fillStyle = noteColor
    ctx.strokeStyle = this.isSelected
      ? this.selectedBorderColor
      : this.borderColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.rect(x, y, width, height)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.globalAlpha = 1.0
  }

  drawDrumNote(ctx: CanvasRenderingContext2D) {
    const alpha = this.velocity / 127
    const noteColor = this.isSelected ? this.selectedColor : this.color
    let { x, y, height } = this.bounds
    x = Math.round(x)
    y = Math.round(y)
    height = Math.round(height)
    const radius = Math.round(height / 2)

    ctx.beginPath()
    ctx.globalAlpha = alpha
    ctx.arc(x, y + radius, radius, 0, 2 * Math.PI)
    ctx.fillStyle = noteColor
    ctx.strokeStyle = this.borderColor
    ctx.lineWidth = 1
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.globalAlpha = 1.0
  }
}

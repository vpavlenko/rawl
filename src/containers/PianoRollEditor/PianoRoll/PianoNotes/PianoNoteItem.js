import Item from "components/Stage/Item"
import Rect from "model/Rect"

const COLOR = { r: 60, g: 87, b: 221 }
const SELECTED_COLOR = { r: 45, g: 57, b: 115 }

function colorStr({ r, g, b }, alpha = 1) {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function drawNote(ctx, { x, y, width, height }, velocity, selected, color, selectedColor) {
  const alpha = velocity / 127
  const noteColor = selected ? colorStr(selectedColor) : colorStr(color, alpha)

  x = Math.round(x)
  y = Math.round(y)
  width = Math.round(width - 1) // 次のノートと被らないように小さくする
  height = Math.round(height)

  ctx.beginPath()
  ctx.fillStyle = noteColor
  ctx.strokeStyle = "rgba(0, 0, 0, 1)"
  ctx.lineWidth = 1
  ctx.rect(x, y, width, height)
  ctx.fill()
  ctx.stroke()

  // draw highlight
  ctx.beginPath()
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
  ctx.moveTo(x + 1, y + 1)
  ctx.lineTo(x + width, y + 1)
  ctx.closePath()
  ctx.stroke()
}

function drawDrumNote(ctx, { x, y, height }, velocity, selected, color, selectedColor) {
  const alpha = velocity / 127
  const noteColor = selected ? colorStr(selectedColor) : colorStr(color, alpha)

  x = Math.round(x)
  y = Math.round(y)
  height = Math.round(height)
  const radius = Math.round(height / 2)

  ctx.beginPath()
  ctx.arc(x, y + radius, radius, 0, 2 * Math.PI)
  ctx.fillStyle = noteColor
  ctx.strokeStyle = "rgba(0, 0, 0, 1)"
  ctx.lineWidth = 1
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
}

export default class PianoNoteItem extends Item {
  constructor(id, x, y, width, height, velocity, isSelected, isDrum) {
    super()
    this.id = id
    this.noteBounds = new Rect(x, y, width, height)
    this.drumBounds = new Rect(x, y, height, height)
    this.velocity = velocity
    this.isSelected = isSelected
    this.isDrum = isDrum
  }

  get bounds() {
    return this.isDrum ? this.drumBounds : this.noteBounds
  }

  render(ctx) {
    if (this.isDrum) {
      drawDrumNote(ctx, this.bounds, this.velocity, this.isSelected, COLOR, SELECTED_COLOR)
    } else {
      drawNote(ctx, this.bounds, this.velocity, this.isSelected, COLOR, SELECTED_COLOR)
    }
  }
}
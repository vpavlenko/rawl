import React, { StatelessComponent, CSSProperties } from "react"
import { pure } from "recompose"
import DrawCanvas from "components/DrawCanvas"
import Theme from "common/theme"

function drawHorizontalLines(
  ctx: CanvasRenderingContext2D,
  numberOfKeys: number,
  keyHeight: number,
  width: number,
  theme: Theme
) {
  ctx.lineWidth = 1

  for (let key = 0; key < numberOfKeys; key++) {
    const index = key % 12
    const isBlack =
      index === 1 || index === 3 || index === 6 || index === 8 || index === 10
    const isBold = index === 11
    const y = (numberOfKeys - key - 1) * keyHeight
    if (isBlack) {
      ctx.fillStyle = theme.secondaryBackgroundColor
      ctx.fillRect(0, y, width, keyHeight)
    }
    ctx.strokeStyle = isBold ? theme.secondaryTextColor : theme.dividerColor
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.closePath()
    ctx.stroke()
  }
}

export interface PianoLinesProps {
  numberOfKeys: number
  pixelsPerKey: number
  width: number
  theme: Theme
  style?: CSSProperties
}

const PianoLines: StatelessComponent<PianoLinesProps> = ({
  numberOfKeys,
  pixelsPerKey,
  width,
  theme,
  style
}) => {
  function draw(ctx: CanvasRenderingContext2D) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.translate(0, 0.5)
    drawHorizontalLines(ctx, numberOfKeys, pixelsPerKey, width, theme)
    ctx.restore()
  }

  return (
    <DrawCanvas
      draw={draw}
      className="PianoLines"
      width={width}
      height={pixelsPerKey * numberOfKeys}
      style={style}
    />
  )
}

export default pure(PianoLines)

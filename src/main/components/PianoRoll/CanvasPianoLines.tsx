import Color from "color"
import React, { CSSProperties, FC } from "react"
import { Theme } from "../../../common/theme/Theme"
import DrawCanvas from "../DrawCanvas"

function drawHorizontalLines(
  ctx: CanvasRenderingContext2D,
  numberOfKeys: number,
  keyHeight: number,
  width: number,
  blackLaneColor: string,
  dividerColor: string
) {
  ctx.lineWidth = 1

  for (let key = 0; key < numberOfKeys; key++) {
    const index = key % 12
    const isBlack =
      index === 1 || index === 3 || index === 6 || index === 8 || index === 10
    const isBold = index === 11 || index === 4
    const y = (numberOfKeys - key - 1) * keyHeight
    if (isBlack) {
      ctx.fillStyle = blackLaneColor
      ctx.fillRect(0, y, width, keyHeight)
    }
    if (isBold) {
      ctx.strokeStyle = dividerColor
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.closePath()
      ctx.stroke()
    }
  }
}

export interface PianoLinesProps {
  numberOfKeys: number
  pixelsPerKey: number
  width: number
  theme: Theme
  style?: CSSProperties
}

const PianoLines: FC<PianoLinesProps> = ({
  numberOfKeys,
  pixelsPerKey,
  width,
  theme,
  style,
}) => {
  function draw(ctx: CanvasRenderingContext2D) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.translate(0, 0.5)
    drawHorizontalLines(
      ctx,
      numberOfKeys,
      pixelsPerKey,
      width,
      theme.pianoBlackKeyLaneColor,
      Color(theme.dividerColor).alpha(0.7).string()
    )
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

export default React.memo(PianoLines)

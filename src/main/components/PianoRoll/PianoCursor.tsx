import React, { StatelessComponent, CSSProperties } from "react"
import DrawCanvas from "components/DrawCanvas"

function drawCursor(
  ctx: CanvasRenderingContext2D,
  position: number,
  height: number
) {
  ctx.save()
  // ctx.translate(0, 0.5)
  ctx.strokeStyle = "red"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(position, 0)
  ctx.lineTo(position, height)
  ctx.closePath()
  ctx.stroke()
  ctx.restore()
}

export interface PianoCursorProps {
  position: number
  width: number
  height: number
  style?: CSSProperties
}

const PianoCursor: StatelessComponent<PianoCursorProps> = ({
  position,
  width,
  height,
  style,
}) => {
  function draw(ctx: CanvasRenderingContext2D) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.translate(0.5, 0)
    drawCursor(ctx, Math.round(position), height)
    ctx.restore()
  }

  return (
    <DrawCanvas
      draw={draw}
      className="PianoCursor"
      width={width}
      height={height}
      style={style}
    />
  )
}

export default React.memo(PianoCursor)

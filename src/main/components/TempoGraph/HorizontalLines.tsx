import React from "react"
import { TempoCoordTransform } from "../../../common/transform"
import { CanvasDrawStyle } from "../../style"
import DrawCanvas from "../DrawCanvas"

export interface HorizontalLinesProps {
  width: number
  height: number
  transform: TempoCoordTransform
  borderColor: CanvasDrawStyle
}

export function HorizontalLines({
  width,
  height,
  transform,
  borderColor,
}: HorizontalLinesProps) {
  if (!width) {
    return null
  }

  function draw(ctx: CanvasRenderingContext2D) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    ctx.save()
    ctx.translate(0.5, 0.5)

    ctx.strokeStyle = borderColor
    ctx.lineWidth = 1

    // 30 -> 510 を 17 分割した線
    ctx.beginPath()
    for (let i = 30; i < transform.maxBPM; i += 30) {
      const y = Math.round(transform.getY(i))

      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
    }
    ctx.stroke()
    ctx.restore()
  }

  return (
    <DrawCanvas
      draw={draw}
      width={width}
      height={height}
      className="HorizontalLines"
      onContextMenu={(e) => e.preventDefault()}
    />
  )
}

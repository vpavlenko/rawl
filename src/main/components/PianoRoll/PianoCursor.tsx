import { Graphics } from "@inlet/react-pixi"
import Color from "color"
import { Graphics as PIXIGraphics } from "pixi.js"
import React, { FC } from "react"

export interface PianoCursorProps {
  height: number
}

const PianoCursor: FC<PianoCursorProps> = ({ height }) => {
  function draw(ctx: PIXIGraphics) {
    const color = Color("red").rgbNumber()
    ctx.clear().lineStyle(1, color).moveTo(0, 0).lineTo(0, height)
  }

  return <Graphics draw={draw} />
}

export default React.memo(PianoCursor)

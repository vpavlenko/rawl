import React, { FC } from "react"
import { Graphics as PIXIGraphics } from "pixi.js"
import { Graphics } from "@inlet/react-pixi"
import Color from "color"

export interface PianoCursorProps {
  height: number
}

const PianoCursor: FC<PianoCursorProps> = ({ height }) => {
  function draw(ctx: PIXIGraphics) {
    console.log("render PianoCursor")
    const color = Color("red").rgbNumber()
    ctx.clear().lineStyle(1, color).moveTo(0, 0).lineTo(0, height)
  }

  return <Graphics draw={draw} />
}

export default React.memo(PianoCursor)

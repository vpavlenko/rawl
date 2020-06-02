import React, { StatelessComponent } from "react"
import { Graphics as PIXIGraphics } from "pixi.js"
import { Graphics } from "@inlet/react-pixi"
import Color from "color"

export interface PianoCursorProps {
  position: number
  height: number
}

const PianoCursor: StatelessComponent<PianoCursorProps> = ({
  position,
  height,
}) => {
  function draw(ctx: PIXIGraphics) {
    console.log("render PianoCursor")
    const x = Math.round(position)
    const color = Color("red").rgbNumber()
    ctx.clear().lineStyle(1, color).moveTo(x, 0).lineTo(x, height)
  }

  return <Graphics draw={draw} />
}

export default React.memo(PianoCursor)

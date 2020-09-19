import React, { FC } from "react"
import { Graphics as PIXIGraphics, Rectangle } from "pixi.js"
import _ from "lodash"

import { IRect } from "common/geometry"
import { useTheme } from "main/hooks/useTheme"
import { Graphics } from "@inlet/react-pixi"
import Color from "color"

const LINE_WIDTH = 2

export interface PianoSelectionProps {
  bounds: IRect
  onRightClick: (e: PIXI.InteractionEvent) => void
}

const PianoSelection: FC<PianoSelectionProps> = ({ bounds, onRightClick }) => {
  const theme = useTheme()
  const color = Color(theme.themeColor).rgbNumber()

  function draw(ctx: PIXIGraphics): void {
    console.log("render PianoSelection")
    ctx.clear()
    const { width, height } = bounds
    ctx
      .lineStyle(LINE_WIDTH, color)
      .drawRect(
        LINE_WIDTH / 2,
        LINE_WIDTH / 2,
        width - LINE_WIDTH,
        height - LINE_WIDTH
      )
  }

  return (
    <Graphics
      x={bounds.x}
      y={bounds.y}
      draw={draw}
      interactive={true}
      hitArea={new Rectangle(0, 0, bounds.width, bounds.height)}
      rightclick={onRightClick}
    />
  )
}

function areEqual(props: PianoSelectionProps, nextProps: PianoSelectionProps) {
  return _.isEqual(props.bounds, nextProps.bounds)
}

export default React.memo(PianoSelection, areEqual)

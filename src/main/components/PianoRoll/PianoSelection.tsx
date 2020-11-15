import { Graphics } from "@inlet/react-pixi"
import Color from "color"
import isEqual from "lodash/isEqual"
import { Graphics as PIXIGraphics, Rectangle } from "pixi.js"
import React, { FC } from "react"
import { IRect } from "../../../common/geometry"
import { useTheme } from "../../hooks/useTheme"

const LINE_WIDTH = 2

export interface PianoSelectionProps {
  bounds: IRect
  onRightClick: (e: PIXI.InteractionEvent) => void
}

const PianoSelection: FC<PianoSelectionProps> = ({ bounds, onRightClick }) => {
  const theme = useTheme()
  const color = Color(theme.themeColor).rgbNumber()

  function draw(ctx: PIXIGraphics): void {
    ctx.clear()
    const { width, height } = bounds
    ctx.lineStyle(LINE_WIDTH, color, 1, 0).drawRect(-0.5, -0.5, width, height)
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
  return isEqual(props.bounds, nextProps.bounds)
}

export default React.memo(PianoSelection, areEqual)

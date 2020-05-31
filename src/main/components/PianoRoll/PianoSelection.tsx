import React, { StatelessComponent } from "react"
import { Graphics as PIXIGraphics, Point } from "pixi.js"
import _ from "lodash"

import { IRect } from "common/geometry"
import { useTheme } from "main/hooks/useTheme"
import { Graphics } from "@inlet/react-pixi"
import Color from "color"

const LINE_WIDTH = 2

export interface PianoSelectionProps {
  selectionBounds: IRect | null
}

const PianoSelection: StatelessComponent<PianoSelectionProps> = ({
  selectionBounds,
}) => {
  const theme = useTheme()
  const color = Color(theme.themeColor).rgbNumber()

  function draw(ctx: PIXIGraphics): void {
    console.log("render PianoSelection")
    ctx.clear()
    if (selectionBounds) {
      const { x, y, width, height } = selectionBounds
      ctx
        .lineStyle(LINE_WIDTH, color)
        .drawRect(
          x + LINE_WIDTH / 2,
          y + LINE_WIDTH / 2,
          width - LINE_WIDTH,
          height - LINE_WIDTH
        )
    }
  }

  return <Graphics draw={draw} />
}

function areEqual(props: PianoSelectionProps, nextProps: PianoSelectionProps) {
  return _.isEqual(props.selectionBounds, nextProps.selectionBounds)
}

export default React.memo(PianoSelection, areEqual)

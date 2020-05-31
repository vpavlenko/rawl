import React, { StatelessComponent } from "react"
import { Graphics as PIXIGraphics, Point } from "pixi.js"
import _ from "lodash"

import { IRect } from "common/geometry"
import { useTheme } from "main/hooks/useTheme"
import { Graphics } from "@inlet/react-pixi"
import Color from "color"

const LINE_WIDTH = 2

function drawSelection(
  ctx: PIXIGraphics,
  { x, y, width, height }: IRect,
  color: number
) {
  ctx
    .drawRect(
      x + LINE_WIDTH / 2,
      y + LINE_WIDTH / 2,
      width - LINE_WIDTH,
      height - LINE_WIDTH
    )
    .lineStyle(LINE_WIDTH, color)
}

export interface PianoSelectionProps {
  selectionBounds: IRect | null
}

const PianoSelection: StatelessComponent<PianoSelectionProps> = ({
  selectionBounds,
}) => {
  const theme = useTheme()
  const color = theme.themeColor

  function draw(ctx: PIXIGraphics): void {
    if (selectionBounds) {
      drawSelection(ctx, selectionBounds, Color(color).rgbNumber())
    }
  }

  return <Graphics draw={draw} />
}

function areEqual(props: PianoSelectionProps, nextProps: PianoSelectionProps) {
  return _.isEqual(props.selectionBounds, nextProps.selectionBounds)
}

export default React.memo(PianoSelection, areEqual)

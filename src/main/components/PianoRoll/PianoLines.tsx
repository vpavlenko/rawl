import React, { StatelessComponent, CSSProperties } from "react"
import { Graphics as PIXIGraphics } from "pixi.js"
import Theme from "common/theme"
import { useTheme } from "main/hooks/useTheme"
import { Graphics } from "@inlet/react-pixi"
import Color from "color"

function drawHorizontalLines(
  ctx: PIXIGraphics,
  numberOfKeys: number,
  keyHeight: number,
  width: number,
  theme: Theme
) {
  for (let key = 0; key < numberOfKeys; key++) {
    const index = key % 12
    const isBlack =
      index === 1 || index === 3 || index === 6 || index === 8 || index === 10
    const isBold = index === 11
    const y = (numberOfKeys - key - 1) * keyHeight
    if (isBlack) {
      ctx
        .beginFill(Color(theme.pianoBlackKeyLaneColor).rgbNumber())
        .drawRect(0, y, width, keyHeight)
        .endFill()
    }
    if (isBold) {
      ctx
        .lineStyle(1, Color(theme.dividerColor).rgbNumber())
        .moveTo(0, y)
        .lineTo(width, y)
    }
  }
}

export interface PianoLinesProps {
  numberOfKeys: number
  pixelsPerKey: number
  width: number
  style?: CSSProperties
}

const PianoLines: StatelessComponent<PianoLinesProps> = ({
  numberOfKeys,
  pixelsPerKey,
  width,
  style,
}) => {
  const theme = useTheme()

  function draw(ctx: PIXIGraphics) {
    drawHorizontalLines(ctx, numberOfKeys, pixelsPerKey, width, theme)
  }

  return (
    <Graphics draw={draw} width={width} height={pixelsPerKey * numberOfKeys} />
  )
}

export default React.memo(PianoLines)

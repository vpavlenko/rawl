import React, { FC, CSSProperties } from "react"
import { Graphics as PIXIGraphics } from "pixi.js"
import { useTheme } from "main/hooks/useTheme"
import { Graphics } from "@inlet/react-pixi"
import Color from "color"
import { isBlackKey } from "common/helpers/noteNumber"

export interface PianoLinesProps {
  numberOfKeys: number
  pixelsPerKey: number
  width: number
}

const PianoLines: FC<PianoLinesProps> = ({
  numberOfKeys,
  pixelsPerKey,
  width,
}) => {
  const theme = useTheme()

  function draw(ctx: PIXIGraphics) {
    console.log("render PianoLines")
    const keyHeight = pixelsPerKey
    ctx.clear()
    for (let key = 0; key < numberOfKeys; key++) {
      const index = key % 12
      const isBlack = isBlackKey(key)
      const isBold = index === 4 || index === 11
      const y = (numberOfKeys - key - 1) * keyHeight
      if (isBlack) {
        ctx
          .lineStyle()
          .beginFill(Color(theme.pianoBlackKeyLaneColor).rgbNumber())
          .drawRect(0, y, width, keyHeight)
      }
      if (isBold) {
        ctx
          .lineStyle(1, Color(theme.dividerColor).rgbNumber())
          .moveTo(0, y)
          .lineTo(width, y)
      }
    }
  }

  return <Graphics draw={draw} />
}

export default React.memo(PianoLines)

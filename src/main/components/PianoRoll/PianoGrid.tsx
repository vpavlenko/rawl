import React, { FC } from "react"
import { Graphics as PIXIGraphics } from "pixi.js"
import _ from "lodash"

import Theme from "common/theme"
import { BeatWithX } from "helpers/mapBeats"
import { useTheme } from "main/hooks/useTheme"
import { Graphics } from "@inlet/react-pixi"
import Color from "color"

export interface PianoGridProps {
  height: number
  beats: BeatWithX[]
}

const PianoGrid: FC<PianoGridProps> = ({ height, beats }) => {
  const theme = useTheme()

  function draw(ctx: PIXIGraphics) {
    // 密過ぎる時は省略する
    const shouldOmit = beats.length > 1 && beats[1].x - beats[0].x <= 5
    ctx.clear()

    beats.forEach(({ beat, x }) => {
      const isBold = beat === 0
      if (shouldOmit && !isBold) {
        return
      }
      const alpha = isBold && !shouldOmit ? 1 : 0.5
      ctx
        .lineStyle(1, Color(theme.dividerColor).rgbNumber(), alpha)
        .moveTo(x, 0)
        .lineTo(x, height)
    })
  }

  return <Graphics draw={draw} />
}

function areEqual(props: PianoGridProps, nextProps: PianoGridProps) {
  return (
    props.height === nextProps.height && _.isEqual(props.beats, nextProps.beats)
  )
}

export default React.memo(PianoGrid, areEqual)

import React, { SFC } from "react"
import {
  Graphics as PIXIGraphics,
  interaction,
  TextStyle,
  Point,
} from "pixi.js"
import _ from "lodash"

import { LoopSetting } from "common/player"

import Theme from "common/theme"
import { BeatWithX } from "helpers/mapBeats"
import { useTheme } from "main/hooks/useTheme"
import { Graphics, Text, Container } from "@inlet/react-pixi"
import Color from "color"

interface BeatProps {
  height: number
  beat: BeatWithX
  shouldOmit: boolean
  theme: Theme
}

const Beat: SFC<BeatProps> = ({
  beat: { beat, measure, x },
  shouldOmit,
  height,
  theme,
}) => {
  const isTop = beat === 0

  const draw = (ctx: PIXIGraphics) => {
    ctx.clear().lineStyle(1, Color(theme.secondaryTextColor).rgbNumber())

    if (isTop) {
      ctx.moveTo(x, height / 2)
      ctx.lineTo(x, height)
    } else if (!shouldOmit) {
      ctx.moveTo(x, height * 0.8)
      ctx.lineTo(x, height)
    }
  }

  // 小節番号
  // 省略時は2つに1つ描画
  const shouldDrawText = isTop && (!shouldOmit || measure % 2 === 0)

  const textStyle = new TextStyle({
    fontSize: 12,
    fontFamily: theme.canvasFont,
    fill: Color(theme.secondaryTextColor).rgbNumber(),
  })
  return (
    <>
      <Graphics draw={draw} />
      {shouldDrawText && (
        <Text
          position={new Point(x + 5, 2)}
          text={`${measure}`}
          style={textStyle}
        />
      )}
    </>
  )
}

interface LoopPointsProps {
  loop: LoopSetting
  height: number
  pixelsPerTick: number
  theme: Theme
}

// LoopPoints: SFC に書き換える
const LoopPoints: SFC<LoopPointsProps> = ({
  loop,
  height,
  pixelsPerTick,
  theme,
}) => {
  const lineWidth = 1
  const flagSize = 8

  const draw = (ctx: PIXIGraphics) => {
    const color = loop.enabled ? theme.themeColor : theme.secondaryTextColor
    ctx.clear().beginFill(Color(color).rgbNumber())

    const beginX = loop.begin * pixelsPerTick
    const endX = loop.end * pixelsPerTick

    if (loop.begin !== null) {
      const x = beginX
      ctx
        .moveTo(x, 0)
        .lineTo(x + lineWidth + flagSize, 0)
        .lineTo(x + lineWidth, flagSize)
        .lineTo(x + lineWidth, height)
        .lineTo(x, height)
        .lineTo(x, 0)
    }

    if (loop.end !== null) {
      const x = endX
      ctx
        .moveTo(x, 0)
        .lineTo(x - lineWidth - flagSize, 0)
        .lineTo(x - lineWidth, flagSize)
        .lineTo(x - lineWidth, height)
        .lineTo(x, height)
        .lineTo(x, 0)
    }

    ctx.endFill()

    if (loop.begin !== null && loop.end !== null) {
      ctx
        .beginFill(Color("rgba(0, 0, 0, 0.02)").rgbNumber())
        .drawRect(beginX, 0, endX - beginX, height)
        .endFill()
    }
  }

  return <Graphics draw={draw} />
}

export interface TickEvent<E> {
  tick: number
  nativeEvent: E
}

export interface PianoRulerProps {
  width: number
  pixelsPerTick: number
  scrollLeft: number
  beats: BeatWithX[]
  onMouseDown?: (e: TickEvent<MouseEvent>) => void
  onMouseMove?: (e: TickEvent<MouseEvent>) => void
  onMouseUp?: (e: TickEvent<MouseEvent>) => void
  loop?: LoopSetting
}

const PianoRuler: SFC<PianoRulerProps> = ({
  width,
  pixelsPerTick,
  scrollLeft,
  beats,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  loop,
}) => {
  const theme = useTheme()
  const height = theme.rulerHeight

  const extendEvent = (
    e: interaction.InteractionEvent
  ): TickEvent<MouseEvent> => {
    const local = e.data.getLocalPosition(e.target)
    return {
      nativeEvent: e.data.originalEvent as MouseEvent,
      tick: (local.x + scrollLeft) / pixelsPerTick,
    }
  }

  const drawBackground = (g: PIXIGraphics) => {
    g.beginFill(Color(theme.backgroundColor).rgbNumber())
      .drawRect(0, 0, width, height)
      .endFill()
  }

  // 密過ぎる時は省略する
  const shouldOmit = beats.length > 1 && beats[1].x - beats[0].x <= 5

  return (
    <Graphics
      draw={drawBackground}
      mousedown={(e) => onMouseDown && onMouseDown(extendEvent(e))}
      mousemove={(e) => onMouseMove && onMouseMove(extendEvent(e))}
      mouseup={(e) => onMouseUp && onMouseUp(extendEvent(e))}
    >
      <Container position={new Point(-scrollLeft, 0)}>
        {beats.map((beat) => (
          <Beat
            beat={beat}
            height={height}
            shouldOmit={shouldOmit}
            theme={theme}
          />
        ))}
        {loop && (
          <LoopPoints
            loop={loop}
            pixelsPerTick={pixelsPerTick}
            height={height}
            theme={theme}
          />
        )}
      </Container>
    </Graphics>
  )
}

PianoRuler.defaultProps = {
  loop: { begin: 0, end: 0, enabled: false },
}

function areEqual(props: PianoRulerProps, nextProps: PianoRulerProps) {
  return (
    props.width === nextProps.width &&
    props.pixelsPerTick === nextProps.pixelsPerTick &&
    props.scrollLeft === nextProps.scrollLeft &&
    _.isEqual(props.loop, nextProps.loop) &&
    _.isEqual(props.beats, nextProps.beats)
  )
}

export default React.memo(PianoRuler, areEqual)

import React, { FC } from "react"
import { Graphics as PIXIGraphics, TextStyle, Point } from "pixi.js"
import isEqual from "lodash/isEqual"

import { LoopSetting } from "common/player"

import { Theme } from "common/theme/Theme"
import { BeatWithX } from "helpers/mapBeats"
import { useTheme } from "main/hooks/useTheme"
import { Graphics, Text, Container } from "@inlet/react-pixi"
import Color from "color"

interface BeatProps {
  height: number
  beats: BeatWithX[]
  shouldOmit: boolean
  theme: Theme
}

const Beats: FC<BeatProps> = React.memo(
  ({ beats, shouldOmit, height, theme }) => {
    const draw = (ctx: PIXIGraphics) => {
      ctx.clear().lineStyle(1, Color(theme.secondaryTextColor).rgbNumber())

      for (const { x, beat } of beats) {
        const isTop = beat === 0

        if (isTop) {
          ctx.moveTo(x, height / 2)
          ctx.lineTo(x, height)
        } else if (!shouldOmit) {
          ctx.moveTo(x, height * 0.8)
          ctx.lineTo(x, height)
        }
      }
    }

    return <Graphics draw={draw} />
  },
  isEqual
)

interface LoopPointsProps {
  loop: LoopSetting
  height: number
  pixelsPerTick: number
  theme: Theme
}

// LoopPoints: FC に書き換える
const LoopPoints: FC<LoopPointsProps> = React.memo(
  ({ loop, height, pixelsPerTick, theme }) => {
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
  },
  isEqual
)

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

const PianoRuler: FC<PianoRulerProps> = ({
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

  const extendEvent = (e: PIXI.InteractionEvent): TickEvent<MouseEvent> => {
    const local = e.data.getLocalPosition(e.target)
    return {
      nativeEvent: e.data.originalEvent as MouseEvent,
      tick: (local.x + scrollLeft) / pixelsPerTick,
    }
  }

  const drawBackground = (g: PIXIGraphics) => {
    g.clear()
    g.lineStyle()
      .beginFill(Color(theme.backgroundColor).rgbNumber())
      .drawRect(0, 0, width, height)
      .endFill()
    g.lineStyle(1, Color(theme.dividerColor).rgbNumber())
      .moveTo(0, height)
      .lineTo(width, height)
  }

  // 密過ぎる時は省略する
  const shouldOmit = beats.length > 1 && beats[1].x - beats[0].x <= 5

  const textStyle = new TextStyle({
    fontSize: 12,
    fontFamily: theme.canvasFont,
    fill: Color(theme.secondaryTextColor).rgbNumber(),
  })

  // 小節番号
  // 省略時は2つに1つ描画
  const labels = beats
    .filter((b) => b.beat === 0 && (!shouldOmit || b.measure % 2 === 0))
    .map((b) => (
      <Text
        key={b.measure}
        position={new Point(b.x + 5, 2)}
        text={`${b.measure + 1}`}
        style={textStyle}
      />
    ))

  return (
    <Container>
      <Graphics
        draw={drawBackground}
        width={width}
        height={height}
        interactive={true}
        mousedown={(e) => onMouseDown && onMouseDown(extendEvent(e))}
        mousemove={(e) => onMouseMove && onMouseMove(extendEvent(e))}
        mouseup={(e) => onMouseUp && onMouseUp(extendEvent(e))}
      />
      <Container position={new Point(-scrollLeft, 0)}>
        <Beats
          beats={beats}
          height={height}
          shouldOmit={shouldOmit}
          theme={theme}
        />
        {labels}
        {loop?.enabled && (
          <LoopPoints
            loop={loop}
            pixelsPerTick={pixelsPerTick}
            height={height}
            theme={theme}
          />
        )}
      </Container>
    </Container>
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
    isEqual(props.loop, nextProps.loop) &&
    isEqual(props.beats, nextProps.beats)
  )
}

export default React.memo(PianoRuler, areEqual)

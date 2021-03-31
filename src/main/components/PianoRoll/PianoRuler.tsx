import { Container, Graphics, Text } from "@inlet/react-pixi"
import Color from "color"
import isEqual from "lodash/isEqual"
import { observer } from "mobx-react-lite"
import { Graphics as PIXIGraphics, Point, TextStyle } from "pixi.js"
import React, { FC, useCallback } from "react"
import { BeatWithX } from "../../../common/helpers/mapBeats"
import { LoopSetting } from "../../../common/player"
import { Theme } from "../../../common/theme/Theme"
import { setPlayerPosition } from "../../actions"
import { Layout } from "../../Constants"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"

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
}

const PianoRuler: FC<PianoRulerProps> = observer(
  ({ width, pixelsPerTick, scrollLeft, beats }) => {
    const theme = useTheme()
    const height = Layout.rulerHeight

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

    const rootStore = useStores()
    const loop = rootStore.services.player.loop

    const onMouseDown = useCallback(
      (ev: PIXI.InteractionEvent) => {
        const local = ev.data.getLocalPosition(ev.target)
        const tick = (local.x + scrollLeft) / pixelsPerTick
        if (ev.data.originalEvent.ctrlKey) {
          // setLoopBegin(tick)
        } else if (ev.data.originalEvent.altKey) {
          // setLoopEnd(tick)
        } else {
          setPlayerPosition(rootStore)(tick)
        }
      },
      [rootStore, scrollLeft, pixelsPerTick]
    )

    return (
      <Container>
        <Graphics
          draw={drawBackground}
          width={width}
          height={height}
          interactive={true}
          mousedown={onMouseDown}
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
)

function areEqual(props: PianoRulerProps, nextProps: PianoRulerProps) {
  return (
    props.width === nextProps.width &&
    props.pixelsPerTick === nextProps.pixelsPerTick &&
    props.scrollLeft === nextProps.scrollLeft &&
    isEqual(props.beats, nextProps.beats)
  )
}

export default React.memo(PianoRuler, areEqual)

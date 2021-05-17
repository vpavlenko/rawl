import { isEqual } from "lodash"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback } from "react"
import { BeatWithX } from "../../../common/helpers/mapBeats"
import { LoopSetting } from "../../../common/player"
import { Theme } from "../../../common/theme/Theme"
import { setPlayerPosition } from "../../actions"
import { Layout } from "../../Constants"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import DrawCanvas from "../DrawCanvas"

function drawRuler(
  ctx: CanvasRenderingContext2D,
  height: number,
  beats: BeatWithX[],
  theme: Theme
) {
  ctx.strokeStyle = theme.secondaryTextColor
  ctx.lineWidth = 1
  ctx.beginPath()

  // 密過ぎる時は省略する
  // Omit when it is too high
  const shouldOmit = beats.length > 1 && beats[1].x - beats[0].x <= 5

  beats.forEach(({ beat, measure, x }) => {
    const isTop = beat === 0

    if (isTop) {
      ctx.moveTo(x, height / 2)
      ctx.lineTo(x, height)
    } else if (!shouldOmit) {
      ctx.moveTo(x, height * 0.8)
      ctx.lineTo(x, height)
    }

    // 小節番号
    // War Number
    // 省略時は2つに1つ描画
    // Default 1 drawing one for two
    if (isTop && (!shouldOmit || measure % 2 === 0)) {
      ctx.textBaseline = "top"
      ctx.font = `12px ${theme.canvasFont}`
      ctx.fillStyle = theme.secondaryTextColor
      ctx.fillText(`${measure}`, x + 5, 2)
    }
  })

  ctx.closePath()
  ctx.stroke()
}

function drawLoopPoints(
  ctx: CanvasRenderingContext2D,
  loop: LoopSetting,
  height: number,
  pixelsPerTick: number,
  theme: Theme
) {
  const lineWidth = 1
  const flagSize = 8
  ctx.fillStyle = loop.enabled ? theme.themeColor : theme.secondaryTextColor
  ctx.beginPath()

  const beginX = loop.begin * pixelsPerTick
  const endX = loop.end * pixelsPerTick

  if (loop.begin !== null) {
    const x = beginX
    ctx.moveTo(x, 0)
    ctx.lineTo(x + lineWidth + flagSize, 0)
    ctx.lineTo(x + lineWidth, flagSize)
    ctx.lineTo(x + lineWidth, height)
    ctx.lineTo(x, height)
    ctx.lineTo(x, 0)
  }

  if (loop.end !== null) {
    const x = endX
    ctx.moveTo(x, 0)
    ctx.lineTo(x - lineWidth - flagSize, 0)
    ctx.lineTo(x - lineWidth, flagSize)
    ctx.lineTo(x - lineWidth, height)
    ctx.lineTo(x, height)
    ctx.lineTo(x, 0)
  }

  ctx.closePath()
  ctx.fill()

  if (loop.begin !== null && loop.end !== null) {
    ctx.rect(beginX, 0, endX - beginX, height)
    ctx.fillStyle = "rgba(0, 0, 0, 0.02)"
    ctx.fill()
  }
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
  style?: React.CSSProperties
}

const PianoRuler: FC<PianoRulerProps> = observer(
  ({ width, pixelsPerTick, scrollLeft, beats, style }) => {
    const rootStore = useStores()
    const theme = useTheme()
    const height = Layout.rulerHeight

    const { loop } = rootStore.services.player

    const onMouseDown: React.MouseEventHandler<HTMLCanvasElement> = useCallback(
      (e) => {
        const local = {
          x: e.nativeEvent.offsetX,
          y: e.nativeEvent.offsetY,
        }
        const tick = (local.x + scrollLeft) / pixelsPerTick
        if (e.nativeEvent.ctrlKey) {
          // setLoopBegin(tick)
        } else if (e.nativeEvent.altKey) {
          // setLoopEnd(tick)
        } else {
          setPlayerPosition(rootStore)(tick)
        }
      },
      [rootStore, scrollLeft, pixelsPerTick]
    )

    const draw = useCallback(
      (ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, width, height)
        ctx.save()
        ctx.translate(-scrollLeft + 0.5, 0)
        drawRuler(ctx, height, beats, theme)
        if (loop.enabled) {
          drawLoopPoints(ctx, loop, height, pixelsPerTick, theme)
        }
        ctx.restore()
      },
      [width, pixelsPerTick, scrollLeft, beats]
    )

    return (
      <DrawCanvas
        draw={draw}
        width={width}
        height={height}
        onMouseDown={onMouseDown}
        style={style}
      />
    )
  }
)

function equals(props: PianoRulerProps, nextProps: PianoRulerProps) {
  return (
    props.width === nextProps.width &&
    props.pixelsPerTick === nextProps.pixelsPerTick &&
    props.scrollLeft === nextProps.scrollLeft &&
    isEqual(props.beats, nextProps.beats)
  )
}

export default React.memo(PianoRuler, equals)

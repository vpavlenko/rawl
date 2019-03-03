import React, { StatelessComponent } from "react"
import { shouldUpdate } from "recompose"
import _ from "lodash"

import { LoopSetting } from "common/player"
import DrawCanvas from "components/DrawCanvas"

import "./PianoRuler.css"
import Theme from "common/theme"
import { BeatWithX } from "helpers/mapBeats"

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
    // 省略時は2つに1つ描画
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

interface TickEvent {
  tick: number
}

export interface PianoRulerProps {
  width: number
  height: number
  pixelsPerTick: number
  scrollLeft: number
  beats: BeatWithX[]
  theme: Theme
  onMouseDown?: (TickEvent) => void
  onMouseMove?: (TickEvent) => void
  onMouseUp?: (TickEvent) => void
  loop?: LoopSetting
}

const PianoRuler: StatelessComponent<PianoRulerProps> = ({
  width,
  height,
  pixelsPerTick,
  scrollLeft,
  beats,
  theme,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  loop
}) => {
  function draw(ctx: CanvasRenderingContext2D) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.translate(-scrollLeft + 0.5, 0)
    drawRuler(ctx, height, beats, theme)
    drawLoopPoints(ctx, loop, height, pixelsPerTick, theme)
    ctx.restore()
  }

  const passTick = func => e =>
    func &&
    func({
      tick: (e.nativeEvent.offsetX + scrollLeft) / pixelsPerTick
    })

  return (
    <DrawCanvas
      draw={draw}
      className="PianoRuler"
      width={width}
      height={height}
      onMouseDown={passTick(onMouseDown)}
      onMouseMove={passTick(onMouseMove)}
      onMouseUp={passTick(onMouseUp)}
    />
  )
}

PianoRuler.defaultProps = {
  loop: { begin: 0, end: 0, enabled: false }
}

function test(props: PianoRulerProps, nextProps: PianoRulerProps) {
  return (
    props.width !== nextProps.width ||
    props.height !== nextProps.height ||
    props.pixelsPerTick !== nextProps.pixelsPerTick ||
    props.scrollLeft !== nextProps.scrollLeft ||
    !_.isEqual(props.loop, nextProps.loop) ||
    !_.isEqual(props.beats, nextProps.beats) ||
    !_.isEqual(props.theme, nextProps.theme)
  )
}

export default shouldUpdate(test)(PianoRuler)

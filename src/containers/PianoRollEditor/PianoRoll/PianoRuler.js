import React from "react"
import PropTypes from "prop-types"
import { shouldUpdate } from "recompose"
import _ from "lodash"

import DrawCanvas from "components/DrawCanvas.tsx"

import "./PianoRuler.css"

function drawRuler(ctx, height, beats, theme) {
  ctx.strokeStyle = theme.secondaryTextColor
  ctx.lineWidth = 1
  ctx.beginPath()

  // 密過ぎる時は省略する
  const shouldOmit = beats.length > 1 && (beats[1].x - beats[0].x <= 5)

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
      ctx.fillText(measure, x + 5, 2)
    }
  })

  ctx.closePath()
  ctx.stroke()
}

function drawLoopPoints(ctx, loop, height, pixelsPerTick, theme) {
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

function PianoRuler({
  width,
  height,
  pixelsPerTick,
  scrollLeft,
  beats,
  theme,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  loop = { start: null, end: null, enabled: false },
}) {

  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.translate(-scrollLeft + 0.5, 0)
    drawRuler(ctx, height, beats, theme)
    drawLoopPoints(ctx, loop, height, pixelsPerTick, theme)
    ctx.restore()
  }

  const extend = func => e => func && func({
    ...e,
    tick: (e.nativeEvent.offsetX + scrollLeft) / pixelsPerTick
  })

  return <DrawCanvas
    draw={draw}
    className="PianoRuler"
    width={width}
    height={height}
    onMouseDown={extend(onMouseDown)}
    onMouseMove={extend(onMouseMove)}
    onMouseUp={extend(onMouseUp)}
  />
}

PianoRuler.propTypes = {
  scrollLeft: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  beats: PropTypes.array.isRequired,
  pixelsPerTick: PropTypes.number.isRequired,
  onMouseDown: PropTypes.func
}

function test(props, nextProps) {
  return props.width !== nextProps.width
    || props.height !== nextProps.height
    || props.pixelsPerTick !== nextProps.pixelsPerTick
    || props.scrollLeft !== nextProps.scrollLeft
    || !_.isEqual(props.loop, nextProps.loop)
    || !_.isEqual(props.beats, nextProps.beats)
    || !_.isEqual(props.theme, nextProps.theme)
}

export default shouldUpdate(test)(PianoRuler)

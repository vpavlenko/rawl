import React from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import { shouldUpdate } from "recompose"

import DrawCanvas from "components/DrawCanvas.tsx"

function drawBeatLines(ctx, beats, height, theme) {
  ctx.lineWidth = 1

  // 密過ぎる時は省略する
  const shouldOmit = beats.length > 1 && (beats[1].x - beats[0].x <= 5)

  beats.forEach(({ beat, x }) => {
    const isBold = beat === 0
    if (shouldOmit && !isBold) {
      return
    }
    ctx.beginPath()
    ctx.strokeStyle = isBold && !shouldOmit ? theme.secondaryTextColor : theme.dividerColor
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.closePath()
    ctx.stroke()
  })
}

function PianoGrid({
  width,
  height,
  scrollLeft,
  beats,
  theme
}) {
  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.translate(-scrollLeft + 0.5, 0)
    drawBeatLines(ctx, beats, height, theme)
    ctx.restore()
  }

  return <DrawCanvas
    draw={draw}
    className="PianoGrid"
    width={width}
    height={height}
  />
}

PianoGrid.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  scrollLeft: PropTypes.number.isRequired,
  theme: PropTypes.object.isRequired,
  beats: PropTypes.array.isRequired
}

function test(props, nextProps) {
  return !_.isEqual(props.theme, nextProps.theme)
    || props.width !== nextProps.width
    || props.height !== nextProps.height
    || props.endTick !== nextProps.endTick
    || props.scrollLeft !== nextProps.scrollLeft
    || props.ticksPerBeat !== nextProps.ticksPerBeat
    || props.transform !== nextProps.transform
    || !_.isEqual(props.transform, nextProps.transform)
    || !_.isEqual(props.beats, nextProps.beats)
}

export default shouldUpdate(test)(PianoGrid)

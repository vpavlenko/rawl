import React from "react"
import PropTypes from "prop-types"
import { shouldUpdate } from "recompose"
import _ from "lodash"

import { noteNameWithOctString } from "helpers/noteNumberString"
import DrawCanvas from "components/DrawCanvas.tsx"

function drawBorder(ctx, width, theme) {
  ctx.lineWidth = 1
  ctx.strokeStyle = theme.dividerColor
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(width, 0)
  ctx.closePath()
  ctx.stroke()
}

function drawBlackKey(ctx, width, height, theme) {
  const innerWidth = width * 0.64
  const middle = Math.round(height / 2)

  ctx.fillStyle = theme.textColor
  ctx.fillRect(0, 0, innerWidth, height)

  ctx.lineWidth = 1
  ctx.strokeStyle = theme.dividerColor
  ctx.beginPath()
  ctx.moveTo(innerWidth, middle)
  ctx.lineTo(width, middle)
  ctx.closePath()
  ctx.stroke()
}

function drawLabel(ctx, width, height, keyNum, theme) {
  const x = width - 5
  ctx.textAlign = "right"
  ctx.textBaseline = "middle"
  ctx.font = `12px ${theme.canvasFont}`
  ctx.fillStyle = theme.secondaryTextColor
  ctx.fillText(noteNameWithOctString(keyNum), x, height / 2)
}

function drawKeys(ctx, width, keyHeight, numberOfKeys, theme) {
  ctx.save()
  ctx.translate(0, 0.5)

  drawBorder(ctx, width, theme)

  // 0: white, 1: black
  const colors = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0]
  for (let i = 0; i < numberOfKeys; i++) {
    const isBlack = colors[i % colors.length] !== 0
    const bordered = (i % 12 === 4) || (i % 12 === 11)
    const y = (numberOfKeys - i - 1) * keyHeight
    ctx.save()
    ctx.translate(0, y)
    if (isBlack) {
      drawBlackKey(ctx, width, keyHeight, theme)
    } else if (bordered) {
      drawBorder(ctx, width, theme)
    }
    const isKeyC = i % 12 === 0
    if (isKeyC) {
      drawLabel(ctx, width, keyHeight, i, theme)
    }
    ctx.restore()
  }

  ctx.restore()
}

function PianoKeys({
  onClickKey,
  numberOfKeys,
  width,
  keyHeight,
  theme
}) {
  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    drawKeys(ctx, width, keyHeight, numberOfKeys, theme)
  }

  function pixelsToNoteNumber(y) {
    return numberOfKeys - y / keyHeight
  }

  function onMouseDown(e) {
    const noteNumber = Math.floor(pixelsToNoteNumber(e.nativeEvent.offsetY))
    onClickKey(noteNumber, e)
  }

  return <DrawCanvas
    draw={draw}
    className="PianoKeys"
    width={width}
    height={keyHeight * numberOfKeys}
    onMouseDown={onMouseDown}
  />
}

PianoKeys.propTypes = {
  theme: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
  keyHeight: PropTypes.number.isRequired,
  numberOfKeys: PropTypes.number.isRequired
}

function test(props, nextProps) {
  return !_.isEqual(props.theme, nextProps.theme)
    || props.keyHeight !== nextProps.keyHeight
    || props.numberOfKeys !== nextProps.numberOfKeys
}

export default shouldUpdate(test)(PianoKeys)
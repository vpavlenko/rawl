import React, { PropTypes } from "react"
import DrawCanvas from "./DrawCanvas"
import withTheme from "../hocs/withTheme"
import pureRender from "../hocs/pureRender"

function drawHorizontalLines(ctx, numberOfKeys, keyHeight, width, theme) {
  ctx.lineWidth = 1

  for (let key = 0; key < numberOfKeys; key++) {
    const index = key % 12
    const isBlack = index == 1 || index == 3 || index == 6 || index == 8 || index == 10
    const isBold = index == 11
    const y = (numberOfKeys - key - 1) * keyHeight
    if (isBlack) {
      ctx.fillStyle = theme.secondaryBackgroundColor
      ctx.fillRect(0, y, width, keyHeight)
    }
    ctx.strokeStyle = isBold ? theme.secondaryTextColor : theme.dividerColor
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.closePath()
    ctx.stroke()
  }
}

function PianoLines(props) {
  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.translate(0, 0.5)
    drawHorizontalLines(ctx, props.numberOfKeys, props.pixelsPerKey, props.width, props.theme)
    ctx.restore()
  }

  return <DrawCanvas
    draw={draw}
    className="PianoLines"
    width={props.width}
    height={props.pixelsPerKey * props.numberOfKeys}
    style={props.style}
  />
}

PianoLines.propTypes = {
  pixelsPerKey: PropTypes.number.isRequired,
  numberOfKeys: PropTypes.number.isRequired
}

export default withTheme(pureRender(PianoLines))

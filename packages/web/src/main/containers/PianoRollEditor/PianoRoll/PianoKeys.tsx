import React, { StatelessComponent } from "react"
import { shouldUpdate } from "recompose"
import _ from "lodash"

import { noteNameWithOctString } from "helpers/noteNumberString"
import DrawCanvas from "components/DrawCanvas"
import Theme from "common/theme"

function drawBorder(ctx: CanvasRenderingContext2D, width: number, dividerColor: string): void {
  ctx.lineWidth = 1
  ctx.strokeStyle = dividerColor
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(width, 0)
  ctx.closePath()
  ctx.stroke()
}

function drawBlackKey(ctx: CanvasRenderingContext2D, width: number, height: number, fillColor: string, dividerColor: string): void {
  const innerWidth = width * 0.64
  const middle = Math.round(height / 2)

  ctx.fillStyle = fillColor
  ctx.fillRect(0, 0, innerWidth, height)

  ctx.lineWidth = 1
  ctx.strokeStyle = dividerColor
  ctx.beginPath()
  ctx.moveTo(innerWidth, middle)
  ctx.lineTo(width, middle)
  ctx.closePath()
  ctx.stroke()
}

function drawLabel(ctx: CanvasRenderingContext2D, width: number, height: number, keyNum: number, font: string, color: string) {
  const x = width - 5
  ctx.textAlign = "right"
  ctx.textBaseline = "middle"
  ctx.font = `12px ${font}`
  ctx.fillStyle = color
  ctx.fillText(noteNameWithOctString(keyNum), x, height / 2)
}

function drawKeys(ctx: CanvasRenderingContext2D, width: number, keyHeight: number, numberOfKeys: number, theme: Theme) {
  ctx.save()
  ctx.translate(0, 0.5)
  
  ctx.fillStyle = theme.pianoKeyWhite
  ctx.fillRect(0, 0, width, keyHeight * numberOfKeys)

  drawBorder(ctx, width, theme.dividerColor)

  // 0: white, 1: black
  const colors = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0]
  for (let i = 0; i < numberOfKeys; i++) {
    const isBlack = colors[i % colors.length] !== 0
    const bordered = (i % 12 === 4) || (i % 12 === 11)
    const y = (numberOfKeys - i - 1) * keyHeight
    ctx.save()
    ctx.translate(0, y)
    if (isBlack) {
      drawBlackKey(ctx, width, keyHeight, theme.pianoKeyBlack, theme.dividerColor)
    } else if (bordered) {
      drawBorder(ctx, width, theme.dividerColor)
    }
    const isKeyC = i % 12 === 0
    if (isKeyC) {
      drawLabel(ctx, width, keyHeight, i, theme.canvasFont, theme.secondaryTextColor)
    }
    ctx.restore()
  }

  ctx.restore()
}

export interface PianoKeysProps {
  onClickKey: (noteNumber: number) => void
  numberOfKeys: number
  width: number
  keyHeight: number
  theme: Theme
}

const PianoKeys: StatelessComponent<PianoKeysProps> = ({
  onClickKey,
  numberOfKeys,
  width,
  keyHeight,
  theme
}) => {
  function draw(ctx: CanvasRenderingContext2D): void {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    drawKeys(ctx, width, keyHeight, numberOfKeys, theme)
  }

  function pixelsToNoteNumber(y: number): number {
    return numberOfKeys - y / keyHeight
  }

  function onMouseDown(e) {
    const noteNumber = Math.floor(pixelsToNoteNumber(e.nativeEvent.offsetY))
    onClickKey(noteNumber)
  }

  return <DrawCanvas
    draw={draw}
    className="PianoKeys"
    width={width}
    height={keyHeight * numberOfKeys}
    onMouseDown={onMouseDown}
  />
}

function test(props: PianoKeysProps, nextProps: PianoKeysProps) {
  return !_.isEqual(props.theme, nextProps.theme)
    || props.keyHeight !== nextProps.keyHeight
    || props.numberOfKeys !== nextProps.numberOfKeys
}

export default shouldUpdate(test)(PianoKeys)

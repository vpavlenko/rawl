import React, { FC, useState } from "react"
import { noteNameWithOctString } from "../../../common/helpers/noteNumberString"
import { Theme } from "../../../common/theme/Theme"
import { Layout } from "../../Constants"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import DrawCanvas from "../DrawCanvas"
import { observeDrag } from "./MouseHandler/observeDrag"

function drawBorder(
  ctx: CanvasRenderingContext2D,
  width: number,
  dividerColor: string
): void {
  ctx.lineWidth = 1
  ctx.strokeStyle = dividerColor
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(width, 0)
  ctx.closePath()
  ctx.stroke()
}

function makeBlackKeyFillStyle(
  ctx: CanvasRenderingContext2D,
  width: number
): CanvasFillStrokeStyles["fillStyle"] {
  const grd = ctx.createLinearGradient(0, 0, width, 0)
  grd.addColorStop(0.0, "rgba(33, 33, 33, 1.000)")
  grd.addColorStop(0.895, "rgba(96, 93, 93, 1.000)")
  grd.addColorStop(0.924, "rgba(48, 48, 48, 1.000)")
  grd.addColorStop(1.0, "rgba(0, 0, 0, 1.000)")
  return grd
}

function drawBlackKey(
  ctx: CanvasRenderingContext2D,
  keyWidth: number,
  width: number,
  height: number,
  fillStyle: CanvasFillStrokeStyles["fillStyle"],
  dividerColor: string
): void {
  const middle = Math.round(height / 2)

  ctx.fillStyle = fillStyle
  ctx.fillRect(0, 0.5, keyWidth, height)

  ctx.lineWidth = 1
  ctx.strokeStyle = dividerColor
  ctx.beginPath()
  ctx.moveTo(keyWidth, middle)
  ctx.lineTo(width, middle)
  ctx.closePath()
  ctx.stroke()
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  keyNum: number,
  font: string,
  color: string
) {
  const x = width - 5
  ctx.textAlign = "right"
  ctx.textBaseline = "middle"
  ctx.font = `12px ${font}`
  ctx.fillStyle = color
  ctx.fillText(noteNameWithOctString(keyNum), x, height / 2)
}

function drawKeys(
  ctx: CanvasRenderingContext2D,
  width: number,
  keyHeight: number,
  numberOfKeys: number,
  theme: Theme
) {
  ctx.save()
  ctx.translate(0, 0.5)

  ctx.fillStyle = theme.pianoKeyWhite
  ctx.fillRect(0, 0, width, keyHeight * numberOfKeys)

  const blackKeyWidth = width * 0.64
  const blackKeyFillStyle = makeBlackKeyFillStyle(ctx, blackKeyWidth)

  drawBorder(ctx, width, theme.dividerColor)

  // 0: white, 1: black
  const colors = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0]
  for (let i = 0; i < numberOfKeys; i++) {
    const isBlack = colors[i % colors.length] !== 0
    const bordered = i % 12 === 4 || i % 12 === 11
    const y = (numberOfKeys - i - 1) * keyHeight
    ctx.save()
    ctx.translate(0, y)
    if (isBlack) {
      drawBlackKey(
        ctx,
        blackKeyWidth,
        width,
        keyHeight,
        blackKeyFillStyle,
        theme.dividerColor
      )
    } else if (bordered) {
      drawBorder(ctx, width, theme.dividerColor)
    }
    const isKeyC = i % 12 === 0
    if (isKeyC) {
      drawLabel(
        ctx,
        width,
        keyHeight,
        i,
        theme.canvasFont,
        theme.secondaryTextColor
      )
    }
    ctx.restore()
  }

  ctx.restore()
}

export interface PianoKeysProps {
  numberOfKeys: number
  keyHeight: number
}

const PianoKeys: FC<PianoKeysProps> = ({ numberOfKeys, keyHeight }) => {
  const theme = useTheme()
  const rootStore = useStores()
  const width = Layout.keyWidth
  const [touchingKeys, setTouchingKeys] = useState<number[]>([])

  function draw(ctx: CanvasRenderingContext2D): void {
    drawKeys(ctx, width, keyHeight, numberOfKeys, theme)
  }

  function pixelsToNoteNumber(y: number): number {
    return numberOfKeys - y / keyHeight
  }

  function noteNumberToPixels(noteNumber: number): number {
    return Math.floor((numberOfKeys - noteNumber - 1) * keyHeight)
  }

  function onMouseDown(e: React.MouseEvent) {
    const startPosition = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    }
    const { player } = rootStore.services
    const channel = rootStore.song.selectedTrack?.channel ?? 0

    let prevNoteNumber = Math.floor(pixelsToNoteNumber(startPosition.y))
    player.sendNoteOn(channel, prevNoteNumber, 127)

    setTouchingKeys([prevNoteNumber])

    observeDrag({
      onMouseMove(e) {
        const pos = {
          x: e.offsetX,
          y: e.offsetY,
        }
        const noteNumber = Math.floor(pixelsToNoteNumber(pos.y))
        if (noteNumber !== prevNoteNumber) {
          player.sendNoteOff(channel, prevNoteNumber, 0)
          player.sendNoteOn(channel, noteNumber, 127)
          prevNoteNumber = noteNumber
          setTouchingKeys([noteNumber])
        }
      },
      onMouseUp(_) {
        player.sendNoteOff(channel, prevNoteNumber, 0)
        setTouchingKeys([])
      },
    })
  }

  return (
    <DrawCanvas
      draw={draw}
      className="PianoKeys"
      width={width}
      height={keyHeight * numberOfKeys}
      onMouseDown={onMouseDown}
    />
  )
}

function equals(props: PianoKeysProps, nextProps: PianoKeysProps) {
  return (
    props.keyHeight === nextProps.keyHeight &&
    props.numberOfKeys === nextProps.numberOfKeys
  )
}

export default React.memo(PianoKeys, equals)

import React, { FC, useCallback, useState } from "react"
import { noteNameWithOctString } from "../../../common/helpers/noteNumberString"
import {
  noteOffMidiEvent,
  noteOnMidiEvent,
} from "../../../common/midi/MidiEvent"
import { Theme } from "../../../common/theme/Theme"
import { Layout } from "../../Constants"
import { observeDrag } from "../../helpers/observeDrag"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import DrawCanvas from "../DrawCanvas"

function drawBorder(
  ctx: CanvasRenderingContext2D,
  width: number,
  dividerColor: string,
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
  width: number,
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
  dividerColor: string,
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
  color: string,
) {
  const x = width - 5
  ctx.textAlign = "right"
  ctx.textBaseline = "middle"
  ctx.font = `12px ${font}`
  ctx.fillStyle = "white"
  ctx.fillText(noteNameWithOctString(keyNum), x, height / 2)
}

function drawKeys(
  ctx: CanvasRenderingContext2D,
  width: number,
  keyHeight: number,
  numberOfKeys: number,
  theme: Theme,
  touchingKeys: number[],
) {
  // Pitch-to-color mapping array
  const pitchToColorMapping = [
    "#ff0000",
    "#820000",
    "#ff89be",
    "#fffd37",
    "#00ff59",
    "#00d5ff",
    "#808080",
    "#0c0cfc",
    "#fe6412",
    "#007000",
    "#925601",
    "#a000ff",
  ]

  const colors = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0] // Key color pattern (0: white, 1: black)
  const blackKeyWidth = width * 0.64
  const blackKeyFillStyle = makeBlackKeyFillStyle(ctx, blackKeyWidth) // Original black key gradient

  for (let i = 0; i < numberOfKeys; i++) {
    const isBlack = colors[i % colors.length] !== 0
    const y = (numberOfKeys - i - 1) * keyHeight

    ctx.save()
    ctx.translate(0, y)

    const keyColor = pitchToColorMapping[i % 12] // Select color based on pitch
    if (isBlack) {
      // Black key: use original gradient fill and optionally add pitch color overlay/border
      drawBlackKey(
        ctx,
        blackKeyWidth,
        width,
        keyHeight,
        blackKeyFillStyle,
        theme.dividerColor,
      )

      // Optional: Add a colored border or overlay to indicate pitch color
      ctx.fillStyle = keyColor
      ctx.fillRect(0, 0, blackKeyWidth, keyHeight) // Draw border around black key
    } else {
      // White key: fill with pitch color
      ctx.fillStyle = keyColor
      ctx.fillRect(0, 0, width, keyHeight)
    }

    const isKeyC = i % 12 === 0
    if (isKeyC) {
      drawLabel(
        ctx,
        width,
        keyHeight,
        i,
        theme.canvasFont,
        theme.secondaryTextColor,
      )
    }
    ctx.restore()
  }
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

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      drawKeys(ctx, width, keyHeight, numberOfKeys, theme, touchingKeys)
    },
    [keyHeight, numberOfKeys, theme, touchingKeys],
  )

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      function pixelsToNoteNumber(y: number): number {
        return numberOfKeys - y / keyHeight
      }

      const startPosition = {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      }
      const {
        player,
        pianoRollStore: { selectedTrack },
      } = rootStore
      const channel = selectedTrack?.channel ?? 0

      let prevNoteNumber = Math.floor(pixelsToNoteNumber(startPosition.y))
      player.sendEvent(noteOnMidiEvent(0, channel, prevNoteNumber, 127))

      setTouchingKeys([prevNoteNumber])

      observeDrag({
        onMouseMove(e) {
          const pos = {
            x: e.offsetX,
            y: e.offsetY,
          }
          const noteNumber = Math.floor(pixelsToNoteNumber(pos.y))
          if (noteNumber !== prevNoteNumber) {
            player.sendEvent(noteOffMidiEvent(0, channel, prevNoteNumber, 0))
            player.sendEvent(noteOnMidiEvent(0, channel, noteNumber, 127))
            prevNoteNumber = noteNumber
            setTouchingKeys([noteNumber])
          }
        },
        onMouseUp(_) {
          player.sendEvent(noteOffMidiEvent(0, channel, prevNoteNumber, 0))
          setTouchingKeys([])
        },
      })
    },
    [numberOfKeys, keyHeight],
  )

  return (
    <DrawCanvas
      draw={draw}
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

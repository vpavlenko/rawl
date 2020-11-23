import { Container, Graphics, Text } from "@inlet/react-pixi"
import Color from "color"
import range from "lodash/range"
import { Graphics as PIXIGraphics, Point, TextStyle } from "pixi.js"
import React, { FC, useState } from "react"
import { pointAdd, pointSub } from "../../../common/geometry"
import { isBlackKey } from "../../../common/helpers/noteNumber"
import { noteNameWithOctString } from "../../../common/helpers/noteNumberString"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import { Rectangle } from "../Graphics/Rectangle"
import { observeDrag } from "./MouseHandler/observeDrag"

interface BlackKeyProps {
  width: number
  height: number
  position: Point
  isSelected: boolean
}

const BlackKey: FC<BlackKeyProps> = ({
  width,
  height,
  position,
  isSelected,
}) => {
  const theme = useTheme()
  const color = isSelected
    ? Color(theme.themeColor).rgbNumber()
    : Color(theme.pianoKeyBlack).rgbNumber()
  const lightenColor = Color(theme.pianoKeyBlack).lighten(1).rgbNumber()
  const dividerColor = Color(theme.dividerColor).rgbNumber()

  const keyWidth = Math.floor(width * 0.64)
  const highlightWidth = Math.floor(keyWidth * 0.13)
  const highlightHeight = Math.floor(height * 0.9)

  const draw = (ctx: PIXIGraphics) => {
    ctx
      .clear()
      .lineStyle()
      .beginFill(color)
      .drawRect(-0.5, -0.5, keyWidth, Math.floor(height))

    ctx
      .lineStyle()
      .beginFill(lightenColor)
      .drawRect(
        keyWidth - highlightWidth - 0.5,
        Math.floor((height - highlightHeight) / 2) - 0.5,
        highlightWidth,
        highlightHeight
      )

    const middle = Math.round(height / 2)
    ctx
      .lineStyle(1, dividerColor, 0.3, 0.5)
      .moveTo(keyWidth, middle)
      .lineTo(width, middle)
  }
  return <Graphics draw={draw} position={position} />
}

interface LabelProps {
  width: number
  y: number
  keyNum: number
  font: string
  color: number
}

const KeyLabel: FC<LabelProps> = ({ width, keyNum, font, color, y }) => {
  const x = width - 20
  const style = new TextStyle({
    fontFamily: font,
    fontSize: 12,
    fill: color,
    align: "right",
  })
  return (
    <Text
      position={new Point(x, y - 3)}
      style={style}
      text={noteNameWithOctString(keyNum)}
    />
  )
}

const isBordered = (key: number) => key % 12 === 4 || key % 12 === 11

export interface PianoKeysProps {
  numberOfKeys: number
  keyHeight: number
}

const PianoKeys: FC<PianoKeysProps> = ({ numberOfKeys, keyHeight }) => {
  const theme = useTheme()
  const width = theme.keyWidth
  const [touchingKeys, setTouchingKeys] = useState<number[]>([])

  function draw(ctx: PIXIGraphics): void {
    ctx
      .clear()
      .beginFill(Color(theme.pianoKeyWhite).rgbNumber())
      .drawRect(0, 0, width, keyHeight * numberOfKeys)

    ctx
      .lineStyle(1, Color(theme.dividerColor).rgbNumber())
      .moveTo(0, 0)
      .lineTo(width, 0)
  }

  function pixelsToNoteNumber(y: number): number {
    return numberOfKeys - y / keyHeight
  }

  function noteNumberToPixels(noteNumber: number): number {
    return Math.floor((numberOfKeys - noteNumber - 1) * keyHeight)
  }

  function onMouseDown(e: PIXI.InteractionEvent) {
    const local = e.data.getLocalPosition(e.target)
    const ev = e.data.originalEvent as MouseEvent
    const startPosition = { x: ev.clientX, y: ev.clientY }
    const { player } = rootStore.services
    const channel = rootStore.song.selectedTrack?.channel ?? 0

    let prevNoteNumber = Math.floor(pixelsToNoteNumber(local.y))
    player.sendNoteOn(channel, prevNoteNumber, 127)

    setTouchingKeys([prevNoteNumber])

    observeDrag({
      onMouseMove(e) {
        const pos = { x: e.clientX, y: e.clientY }
        const delta = pointSub(pos, startPosition)
        const local2 = pointAdd(local, delta)
        const noteNumber = Math.floor(pixelsToNoteNumber(local2.y))
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

  // 1オクターブごとにラベルを配置
  const labels = range(0, numberOfKeys, 12).map((i) => (
    <KeyLabel
      width={width}
      keyNum={i}
      key={i}
      y={noteNumberToPixels(i)}
      font={theme.canvasFont}
      color={Color(theme.secondaryTextColor).rgbNumber()}
    />
  ))

  const blackKeys = range(0, numberOfKeys)
    .filter(isBlackKey)
    .map((i) => (
      <BlackKey
        key={i}
        position={new Point(0, noteNumberToPixels(i))}
        height={keyHeight}
        width={width}
        isSelected={touchingKeys.includes(i)}
      />
    ))

  const whiteKeyHightlights = touchingKeys
    .filter((i) => !isBlackKey(i))
    .map((i) => (
      <Rectangle
        key={i}
        x={0}
        y={noteNumberToPixels(i)}
        width={width}
        height={keyHeight}
        fill={Color(theme.themeColor).rgbNumber()}
      />
    ))

  const dividers = range(0, numberOfKeys)
    .filter(isBordered)
    .map((i) => {
      const y = noteNumberToPixels(i)
      return (
        <Graphics
          key={i}
          draw={(g) =>
            g
              .clear()
              .lineStyle(1, Color(theme.dividerColor).rgbNumber(), 0.6, 0.5)
              .moveTo(0, 0)
              .lineTo(width, 0)
          }
          position={new Point(0, y)}
        />
      )
    })

  const rootStore = useStores()

  return (
    <Container
      width={width}
      height={keyHeight * numberOfKeys}
      interactive={true}
      mousedown={onMouseDown}
    >
      <Graphics draw={draw} />
      {whiteKeyHightlights}
      {blackKeys}
      {labels}
      {dividers}
    </Container>
  )
}

function areEqual(props: PianoKeysProps, nextProps: PianoKeysProps) {
  return (
    props.keyHeight === nextProps.keyHeight &&
    props.numberOfKeys === nextProps.numberOfKeys
  )
}

export default React.memo(PianoKeys, areEqual)

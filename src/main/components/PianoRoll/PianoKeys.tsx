import React, { SFC } from "react"
import {
  Graphics as PIXIGraphics,
  interaction,
  Point,
  TextStyle,
} from "pixi.js"
import _ from "lodash"

import { noteNameWithOctString } from "helpers/noteNumberString"
import { useTheme } from "main/hooks/useTheme"
import { Graphics, Text, Container } from "@inlet/react-pixi"
import Color from "color"
import { isBlackKey } from "common/helpers/noteNumber"

interface BlackKeyProps {
  width: number
  height: number
  position: Point
}

const BlackKey: SFC<BlackKeyProps> = ({ width, height, position }) => {
  const theme = useTheme()
  const color = Color(theme.pianoKeyBlack).rgbNumber()
  const dividerColor = Color(theme.dividerColor).rgbNumber()

  const keyWidth = width * 0.64
  const draw = (ctx: PIXIGraphics) => {
    ctx.clear().lineStyle().beginFill(color).drawRect(0, 0.5, keyWidth, height)

    const middle = Math.round(height / 2)
    ctx
      .lineStyle(1, dividerColor, 0.3)
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

const KeyLabel: SFC<LabelProps> = ({ width, keyNum, font, color, y }) => {
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
  onClickKey: (noteNumber: number) => void
  numberOfKeys: number
  keyHeight: number
}

const PianoKeys: SFC<PianoKeysProps> = ({
  onClickKey,
  numberOfKeys,
  keyHeight,
}) => {
  const theme = useTheme()
  const width = theme.keyWidth

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

  function onMouseDown(e: interaction.InteractionEvent) {
    const ev = e.data.originalEvent as MouseEvent
    const noteNumber = Math.floor(pixelsToNoteNumber(ev.offsetY))
    onClickKey(noteNumber)
  }

  // 1オクターブごとにラベルを配置
  const labels = _.range(0, numberOfKeys, 12).map((i) => (
    <KeyLabel
      width={width}
      keyNum={i}
      key={i}
      y={(numberOfKeys - i - 1) * keyHeight}
      font={theme.canvasFont}
      color={Color(theme.secondaryTextColor).rgbNumber()}
    />
  ))

  const blackKeys = _.range(0, numberOfKeys)
    .filter(isBlackKey)
    .map((i) => (
      <BlackKey
        key={i}
        position={new Point(0, (numberOfKeys - i - 1) * keyHeight)}
        height={keyHeight}
        width={width}
      />
    ))

  const dividers = _.range(0, numberOfKeys)
    .filter(isBordered)
    .map((i) => {
      const y = (numberOfKeys - i - 1) * keyHeight
      return (
        <Graphics
          key={i}
          draw={(g) =>
            g
              .lineStyle(1, Color(theme.dividerColor).rgbNumber(), 0.6)
              .moveTo(0, 0)
              .lineTo(width, 0)
          }
          position={new Point(0, y)}
        />
      )
    })

  return (
    <Container
      width={width}
      height={keyHeight * numberOfKeys}
      mousedown={onMouseDown}
    >
      <Graphics draw={draw} />
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

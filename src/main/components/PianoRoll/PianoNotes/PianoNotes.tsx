import { Container } from "@inlet/react-pixi"
import Color from "color"
import { KeyedValue } from "main/hooks/recycleKeys"
import { useTheme } from "main/hooks/useTheme"
import React, { FC } from "react"
import { PianoNote, PianoNoteItem } from "./PianoNote"

export interface PianoNotesProps {
  notes: KeyedValue<PianoNoteItem>[]
}

/**
  ノートイベントを描画するコンポーネント
*/
const PianoNotes: FC<PianoNotesProps> = ({ notes }) => {
  const theme = useTheme()
  const baseColor = Color(theme.themeColor)
  const color = baseColor.rgbNumber()
  const borderColor = baseColor.lighten(0.3).rgbNumber()
  const selectedColor = baseColor.lighten(0.7).rgbNumber()
  const selectedBorderColor = baseColor.lighten(0.8).rgbNumber()

  const items = notes.map((item) => (
    <PianoNote
      key={item.key}
      item={item.value}
      color={color}
      borderColor={borderColor}
      selectedColor={selectedColor}
      selectedBorderColor={selectedBorderColor}
    />
  ))

  return <Container>{items}</Container>
}

function areEqual(props: PianoNotesProps, nextProps: PianoNotesProps) {
  return props.notes === nextProps.notes
}

export default React.memo(PianoNotes, areEqual)

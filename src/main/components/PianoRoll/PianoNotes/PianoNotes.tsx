import Color from "color"
import { Container } from "@inlet/react-pixi"

import _ from "lodash"
import React, { FC } from "react"
import { PianoNote, PianoNoteItem } from "./PianoNote"
import { useTheme } from "main/hooks/useTheme"
import { KeyedValue } from "main/hooks/recycleKeys"

export interface PianoNotesProps {
  notes: KeyedValue<PianoNoteItem>[]
  cursor: string
  onDoubleClickNote: (e: PIXI.InteractionEvent) => void
  isDrumMode: boolean
}

/**
  ノートイベントを描画するコンポーネント
*/
const PianoNotes: FC<PianoNotesProps> = ({
  notes,
  onDoubleClickNote,
  isDrumMode,
}) => {
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
      onDoubleClick={onDoubleClickNote}
      isDrum={isDrumMode}
    />
  ))

  return <Container>{items}</Container>
}

function areEqual(props: PianoNotesProps, nextProps: PianoNotesProps) {
  return (
    props.notes === nextProps.notes &&
    props.cursor === nextProps.cursor &&
    props.isDrumMode === nextProps.isDrumMode &&
    props.onDoubleClickNote === nextProps.onDoubleClickNote
  )
}

export default React.memo(PianoNotes, areEqual)

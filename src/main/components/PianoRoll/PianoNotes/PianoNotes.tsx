import Color from "color"
import { NoteEvent } from "common/track"
import { NoteCoordTransform } from "common/transform"
import { Container } from "@inlet/react-pixi"

import _ from "lodash"
import React, { StatelessComponent } from "react"
import { PianoNote, PianoNoteMouseEvent, PianoNoteItem } from "./PianoNote"
import { useTheme } from "main/hooks/useTheme"

export interface PianoNotesProps {
  notes: PianoNoteItem[]
  cursor: string
  onDragNote: (e: PianoNoteMouseEvent) => void
  onHoverNote: (e: PianoNoteMouseEvent) => void
  isDrumMode: boolean
}

export interface PianoNotesNoteMouseEvent extends PianoNoteMouseEvent {
  note: NoteEvent
  tick: number
  noteNumber: number
  transform: NoteCoordTransform
}

/**
  ノートイベントを描画するコンポーネント
*/
const PianoNotes: StatelessComponent<PianoNotesProps> = ({
  notes,
  cursor,
  onDragNote,
  onHoverNote,
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
      key={item.id}
      item={item}
      color={color}
      borderColor={borderColor}
      selectedColor={selectedColor}
      selectedBorderColor={selectedBorderColor}
      onMouseDrag={onDragNote}
      onMouseHover={onHoverNote}
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
    props.onDragNote === nextProps.onDragNote &&
    props.onHoverNote === nextProps.onHoverNote
  )
}

export default React.memo(PianoNotes, areEqual)

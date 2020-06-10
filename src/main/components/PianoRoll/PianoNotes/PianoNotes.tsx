import Color from "color"
import { isNoteEvent, TrackEvent, NoteEvent } from "common/track"
import { NoteCoordTransform } from "common/transform"
import { Container } from "@inlet/react-pixi"

import _ from "lodash"
import React, { StatelessComponent, useCallback } from "react"
import { PianoNote, PianoNoteMouseEvent, PianoNoteItem } from "./PianoNote"
import { IPoint } from "common/geometry"
import { useTheme } from "main/hooks/useTheme"

export interface PianoNotesProps {
  events: NoteEvent[]
  transform: NoteCoordTransform
  cursor: string
  selectedEventIds: number[]
  onDragNote: (e: PianoNotesNoteMouseEvent) => void
  onHoverNote: (e: PianoNotesNoteMouseEvent) => void
  isDrumMode: boolean
}

export interface PianoNotesMouseEvent {
  nativeEvent: MouseEvent
  tick: number
  noteNumber: number
  local: IPoint
  transform: NoteCoordTransform
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
  events,
  transform,
  cursor,
  selectedEventIds,
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

  const items = events.map((e) => {
    const rect = transform.getRect(e)
    const isSelected = selectedEventIds.includes(e.id)

    const extendNoteEvent = (
      ev: PianoNoteMouseEvent
    ): PianoNotesNoteMouseEvent => ({
      ...ev,
      note: e,
      tick: transform.getTicks(ev.offset.x),
      noteNumber: Math.ceil(transform.getNoteNumber(ev.offset.y)),
      transform,
    })

    const _onDragNote = (e: PianoNoteMouseEvent) =>
      onDragNote(extendNoteEvent(e))

    const _onHoverNote = (e: PianoNoteMouseEvent) =>
      onHoverNote(extendNoteEvent(e))

    return (
      <PianoNote
        key={e.id}
        item={{
          ...rect,
          id: e.id,
          velocity: e.velocity,
          isSelected,
        }}
        color={color}
        borderColor={borderColor}
        selectedColor={selectedColor}
        selectedBorderColor={selectedBorderColor}
        onMouseDrag={_onDragNote}
        onMouseHover={_onHoverNote}
        isDrum={isDrumMode}
      />
    )
  })

  return <Container>{items}</Container>
}

function areEqual(props: PianoNotesProps, nextProps: PianoNotesProps) {
  return (
    _.isEqual(props.events, nextProps.events) &&
    _.isEqual(props.transform, nextProps.transform) &&
    props.cursor === nextProps.cursor &&
    _.isEqual(props.selectedEventIds, nextProps.selectedEventIds)
  )
}

export default React.memo(PianoNotes, areEqual)

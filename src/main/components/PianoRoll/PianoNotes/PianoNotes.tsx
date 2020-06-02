import Color from "color"
import { isNoteEvent, TrackEvent } from "common/track"
import { NoteCoordTransform } from "common/transform"
import { Stage, Container } from "@inlet/react-pixi"

import _ from "lodash"
import React, { StatelessComponent, useCallback } from "react"
import { PianoNote, PianoNoteMouseEvent, PianoNoteItem } from "./PianoNote"
import { IPoint } from "common/geometry"
import { Rectangle } from "pixi.js"
import { useTheme } from "main/hooks/useTheme"

export interface PianoNotesProps {
  events: TrackEvent[]
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
}

export interface PianoNotesNoteMouseEvent extends PianoNoteMouseEvent {
  note: TrackEvent
  tick: number
  noteNumber: number
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

  const items: PianoNoteItem[] = events.filter(isNoteEvent).map(
    (e): PianoNoteItem => {
      const rect = transform.getRect(e)
      const isSelected = selectedEventIds.includes(e.id)
      return {
        ...rect,
        id: e.id,
        velocity: e.velocity,
        isSelected,
      }
    }
  )

  const extendNoteEvent = (
    e: PianoNoteMouseEvent,
    eventID: number
  ): PianoNotesNoteMouseEvent => ({
    ...e,
    note: events.find((e) => e.id === eventID)!,
    tick: transform.getTicks(e.offset.x),
    noteNumber: Math.ceil(transform.getNoteNumber(e.offset.y)),
  })

  const _onDragNote = useCallback(
    (e: PianoNoteMouseEvent) => onDragNote(extendNoteEvent(e, e.dragItem.id)),
    []
  )
  const _onHoverNote = useCallback(
    (e: PianoNoteMouseEvent) => onHoverNote(extendNoteEvent(e, e.dragItem.id)),
    []
  )

  return (
    <Container>
      {items.map((item) => (
        <PianoNote
          key={item.id}
          item={item}
          color={color}
          borderColor={borderColor}
          selectedColor={selectedColor}
          selectedBorderColor={selectedBorderColor}
          onMouseDrag={_onDragNote}
          onMouseHover={_onHoverNote}
          isDrum={isDrumMode}
        />
      ))}
    </Container>
  )
}

function areEqual(props: PianoNotesProps, nextProps: PianoNotesProps) {
  return (
    _.isEqual(props.events, nextProps.events) &&
    props.transform === nextProps.transform &&
    props.cursor === nextProps.cursor &&
    _.isEqual(props.selectedEventIds, nextProps.selectedEventIds)
  )
}

export default React.memo(PianoNotes, areEqual)

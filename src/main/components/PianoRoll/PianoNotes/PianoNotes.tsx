import Color from "color"
import { isNoteEvent, TrackEvent } from "common/track"
import { NoteCoordTransform } from "common/transform"
import { Stage, Container } from "@inlet/react-pixi"

import _ from "lodash"
import React, { StatelessComponent } from "react"
import { PianoNote, PianoNoteMouseEvent, PianoNoteItem } from "./PianoNote"
import { IPoint } from "common/geometry"
import { Rectangle } from "pixi.js"
import { useTheme } from "main/hooks/useTheme"

export interface PianoNotesProps {
  events: TrackEvent[]
  transform: NoteCoordTransform
  cursor: string
  selectedEventIds: number[]
  onMouseDown: (e: PianoNotesMouseEvent) => void
  onMouseMove: (e: PianoNotesMouseEvent) => void
  onMouseUp: (e: PianoNotesMouseEvent) => void
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
  onMouseDown,
  onMouseMove,
  onMouseUp,
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

  // MouseHandler で利用する追加情報をイベントに付加する
  const extendEvent = (
    e: PIXI.interaction.InteractionEvent
  ): PianoNotesMouseEvent => {
    const local = e.data.getLocalPosition(e.target)
    return {
      nativeEvent: e.data.originalEvent as MouseEvent,
      local,
      tick: transform.getTicks(local.x),
      noteNumber: Math.ceil(transform.getNoteNumber(local.y)),
    }
  }

  const extendNoteEvent = (
    e: PianoNoteMouseEvent,
    eventID: number
  ): PianoNotesNoteMouseEvent => ({
    ...e,
    note: events.find((e) => e.id === eventID)!,
    tick: transform.getTicks(e.offset.x),
    noteNumber: Math.ceil(transform.getNoteNumber(e.offset.y)),
  })

  const handleMouseDown = (e: PIXI.interaction.InteractionEvent) =>
    onMouseDown(extendEvent(e))

  return (
    <Container
      mousedown={handleMouseDown}
      interactive={true}
      hitArea={new Rectangle(0, 0, 100000, 100000)} // catch all hits
    >
      {items.map((item) => (
        <PianoNote
          key={item.id}
          item={item}
          color={color}
          borderColor={borderColor}
          selectedColor={selectedColor}
          selectedBorderColor={selectedBorderColor}
          onMouseDrag={(e) => onDragNote(extendNoteEvent(e, item.id))}
          onMouseHover={(e) => onHoverNote(extendNoteEvent(e, item.id))}
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

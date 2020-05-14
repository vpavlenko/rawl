import Color from "color"
import Theme from "common/theme"
import { isNoteEvent, TrackEvent } from "common/track"
import { NoteCoordTransform } from "common/transform"
import { Stage, PixiComponent } from "@inlet/react-pixi"

import _ from "lodash"
import React, { StatelessComponent } from "react"
import { StageMouseEvent } from "../../Stage/Stage"
import { Graphics as PIXIGraphics } from "pixi.js"
import {
  PianoNoteProps,
  PianoNote,
  PianoNoteMouseEvent,
  PianoNoteItem,
} from "./PianoNote"
import { IPoint, IRect } from "src/common/geometry"

export interface PianoNotesProps {
  events: TrackEvent[]
  transform: NoteCoordTransform
  width: number
  scrollLeft: number
  cursor: string
  selectedEventIds: number[]
  onMouseDown: (e: PianoNotesMouseEvent) => void
  onMouseMove: (e: PianoNotesMouseEvent) => void
  onMouseUp: (e: PianoNotesMouseEvent) => void
  onDragNote: (e: PianoNotesNoteMouseEvent) => void
  onHoverNote: (e: PianoNotesNoteMouseEvent) => void
  isDrumMode: boolean
  theme: Theme
}

export interface PianoNotesMouseEvent {
  nativeEvent: React.MouseEvent
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
  width,
  scrollLeft,
  cursor,
  selectedEventIds,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onDragNote,
  onHoverNote,
  isDrumMode,
  theme,
}) => {
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
  const height = transform.pixelsPerKey * transform.numberOfKeys

  // MouseHandler で利用する追加情報をイベントに付加する
  const extendEvent = (e: React.MouseEvent): PianoNotesMouseEvent => ({
    nativeEvent: e,
    local: { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY },
    tick: transform.getTicks(e.nativeEvent.offsetX),
    noteNumber: Math.ceil(transform.getNoteNumber(e.nativeEvent.offsetY)),
  })

  const extendNoteEvent = (
    e: PianoNoteMouseEvent,
    eventID: number
  ): PianoNotesNoteMouseEvent => ({
    ...e,
    note: events.find((e) => e.id === eventID)!,
    tick: transform.getTicks(e.offset.x),
    noteNumber: Math.ceil(transform.getNoteNumber(e.offset.y)),
  })

  const handleMouseDown = (e: React.MouseEvent) => onMouseDown(extendEvent(e))

  return (
    <Stage
      className="PianoNotes"
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
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
    </Stage>
  )
}

function areEqual(props: PianoNotesProps, nextProps: PianoNotesProps) {
  return (
    _.isEqual(props.events, nextProps.events) &&
    props.transform === nextProps.transform &&
    props.scrollLeft === nextProps.scrollLeft &&
    props.width === nextProps.width &&
    props.cursor === nextProps.cursor &&
    _.isEqual(props.selectedEventIds, nextProps.selectedEventIds) &&
    _.isEqual(props.theme, nextProps.theme)
  )
}

export default React.memo(PianoNotes, areEqual)

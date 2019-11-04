import Color from "color"
import Theme from "common/theme"
import { isNoteEvent, TrackEvent } from "common/track"
import { NoteCoordTransform } from "common/transform"
import Stage, { StageMouseEvent } from "components/Stage/Stage"
import _ from "lodash"
import React, { StatelessComponent } from "react"
import { shouldUpdate } from "recompose"
import PianoNoteItem from "./PianoNoteItem"

export interface PianoNotesProps {
  events: TrackEvent[]
  transform: NoteCoordTransform
  width: number
  scrollLeft: number
  cursor: string
  selectedEventIds: number[]
  onMouseDown: (e: PianoNotesMouseEvent<MouseEvent>) => void
  onMouseMove: (e: PianoNotesMouseEvent<MouseEvent>) => void
  onMouseUp: (e: PianoNotesMouseEvent<MouseEvent>) => void
  isDrumMode: boolean
  theme: Theme
}

export interface PianoNotesMouseEvent<E> extends StageMouseEvent<E> {
  tick: number
  noteNumber: number
  item: PianoNoteItem
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
  isDrumMode,
  theme
}) => {
  const baseColor = Color(theme.themeColor)
  const color = baseColor.string()
  const borderColor = baseColor.lighten(0.3).string()
  const selectedColor = baseColor.lighten(0.7).string()
  const selectedBorderColor = baseColor.lighten(0.8).string()

  const items = events.filter(isNoteEvent).map(e => {
    const rect = transform.getRect(e)
    const selected = selectedEventIds.includes(e.id)
    return new PianoNoteItem(
      e.id,
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      e.velocity,
      selected,
      isDrumMode,
      color,
      borderColor,
      selectedColor,
      selectedBorderColor
    )
  })
  const height = transform.pixelsPerKey * transform.numberOfKeys

  // MouseHandler で利用する追加情報をイベントに付加する
  const extendEvent = <S, T extends StageMouseEvent<S>>(
    e: T
  ): PianoNotesMouseEvent<S> => ({
    ...e,
    item: e.items[0] as PianoNoteItem,
    tick: transform.getTicks(e.local.x),
    noteNumber: Math.ceil(transform.getNoteNumber(e.local.y))
  })

  return (
    <Stage
      items={items}
      className="PianoNotes"
      width={width}
      height={height}
      scrollLeft={scrollLeft}
      onContextMenu={e => e.nativeEvent.preventDefault()}
      onMouseDown={e => onMouseDown(extendEvent(e))}
      onMouseMove={e => onMouseMove(extendEvent(e))}
      onMouseUp={e => onMouseUp(extendEvent(e))}
      style={{ cursor }}
    />
  )
}

function test(props: PianoNotesProps, nextProps: PianoNotesProps) {
  return (
    !_.isEqual(props.events, nextProps.events) ||
    props.transform !== nextProps.transform ||
    props.scrollLeft !== nextProps.scrollLeft ||
    props.width !== nextProps.width ||
    props.cursor !== nextProps.cursor ||
    !_.isEqual(props.selectedEventIds, nextProps.selectedEventIds) ||
    !_.isEqual(props.theme, nextProps.theme)
  )
}

export default shouldUpdate(test)(PianoNotes)

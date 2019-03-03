import React, { StatelessComponent } from "react"
import _ from "lodash"
import { shouldUpdate } from "recompose"
import Color from "color"

import { NoteCoordTransform } from "common/transform"
import Theme from "common/theme"

import Stage from "components/Stage/Stage"

import PianoNoteItem from "./PianoNoteItem"

export interface PianoNotesProps {
  events: any[]
  transform: NoteCoordTransform
  width: number
  scrollLeft: number
  cursor: string
  selectedEventIds: number[]
  onMouseDown: any
  onMouseMove: any
  onMouseUp: any
  isDrumMode: boolean
  theme: Theme
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
  const color = Color(theme.themeColor)
    .rgb()
    .object()
  const borderColor = Color(theme.textColor)
    .rgb()
    .object()
  const selectedColor = Color(theme.textColor)
    .rgb()
    .object()

  const items = events
    .filter(e => e.subtype === "note")
    .map(e => {
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
        selectedColor
      )
    })
  const height = transform.pixelsPerKey * transform.numberOfKeys

  // MouseHandler で利用する追加情報をイベントに付加する
  const extendEvent = e =>
    Object.assign(e, {
      item: e.items[0],
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
      onContextMenu={e => e.preventDefault()}
      onMouseDown={e => onMouseDown(extendEvent(e))}
      onMouseMove={e => onMouseMove(extendEvent(e))}
      onMouseUp={e => onMouseUp(extendEvent(e))}
      style={{ cursor }}
    />
  )
}

function test(props: PianoNotesProps, nextProps: PianoNotesProps) {
  const eq = (propName, compare = (a, b) => a === b) => {
    return compare(props[propName], nextProps[propName])
  }

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

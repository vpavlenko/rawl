import Color from "color"
import Theme from "common/theme"
import { isNoteEvent, TrackEvent } from "common/track"
import { NoteCoordTransform } from "common/transform"
import { Stage, PixiComponent } from "@inlet/react-pixi"

import _ from "lodash"
import React, { StatelessComponent } from "react"
import PianoNoteItem from "./PianoNoteItem"
import { StageMouseEvent } from "../../Stage/Stage"
import { Graphics as PIXIGraphics } from "pixi.js"
import { PianoNoteProps, PianoNote } from "./PianoNote"

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

export interface PianoNotesMouseEvent<E>
  extends StageMouseEvent<E, PianoNoteItem> {
  tick: number
  noteNumber: number
}

interface RectangleProps {
  fill?: number
  x: number
  y: number
  width: number
  height: number
}

const Rectangle = PixiComponent<RectangleProps, PIXIGraphics>("Rectangle", {
  create: (props) => {
    return new PIXIGraphics()
  },
  didMount: (instance, parent) => {
    // apply custom logic on mount
  },
  willUnmount: (instance, parent) => {
    // clean up before removal
  },
  applyProps: (instance, oldProps, newProps) => {
    const { fill, x, y, width, height } = newProps
    instance.clear()
    instance.beginFill(fill)
    instance.drawRect(x, y, width, height)
    instance.endFill()
  },
})

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
  theme,
}) => {
  const baseColor = Color(theme.themeColor)
  const color = baseColor.rgbNumber()
  const borderColor = baseColor.lighten(0.3).rgbNumber()
  const selectedColor = baseColor.lighten(0.7).rgbNumber()
  const selectedBorderColor = baseColor.lighten(0.8).rgbNumber()

  const items: PianoNoteProps[] = events.filter(isNoteEvent).map(
    (e): PianoNoteProps => {
      const rect = transform.getRect(e)
      const isSelected = selectedEventIds.includes(e.id)
      return {
        ...rect,
        id: e.id,
        velocity: e.velocity,
        isSelected,
        color,
        borderColor,
        selectedColor,
        selectedBorderColor,
      }
    }
  )
  const height = transform.pixelsPerKey * transform.numberOfKeys

  // MouseHandler で利用する追加情報をイベントに付加する
  // const extendEvent = (
  //   e: MouseEvent
  // ): PianoNotesMouseEvent<MouseEvent> => ({
  //   ...e,
  //   tick: transform.getTicks(e.local.x),
  //   noteNumber: Math.ceil(transform.getNoteNumber(e.local.y)),
  // })

  return (
    <Stage className="PianoNotes" width={width} height={height}>
      {items.map((item) => (
        <PianoNote
          key={item.id}
          {...item}
          pointerdown={(e) => {
            console.log(
              "down",
              item.id,
              e.data.getLocalPosition(e.currentTarget.parent)
            )
          }}
          pointerdrag={(e) => {
            console.log(
              "move",
              item.id,
              e.data.getLocalPosition(e.currentTarget.parent)
            )
          }}
          pointerhover={(e) =>
            console.log("hover", e.data.getLocalPosition(e.target))
          }
          pointerup={(e) => {
            console.log(
              "up",
              item.id,
              e.data.getLocalPosition(e.currentTarget.parent)
            )
          }}
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

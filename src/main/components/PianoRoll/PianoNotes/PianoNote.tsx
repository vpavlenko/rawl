import React, { useCallback, useRef, SFC } from "react"
import { Graphics as PIXIGraphics } from "pixi.js"
import { IRect, IPoint } from "src/common/geometry"
import { useState } from "react"
import { Graphics } from "@inlet/react-pixi"
import _ from "lodash"

export type PianoNoteItem = IRect & {
  id: number
  velocity: number
  isSelected: boolean
}

export interface PianoNoteProps {
  item: PianoNoteItem
  isDrum: boolean
  color: number
  borderColor: number
  selectedColor: number
  selectedBorderColor: number
  onMouseDrag?: (e: PianoNoteMouseEvent) => void
  onMouseHover?: (e: PianoNoteMouseEvent) => void
}

export type MousePositionType = "left" | "center" | "right"

export interface PianoNoteMouseEvent {
  nativeEvent: PIXI.interaction.InteractionEvent
  // ドラッグ開始時の item
  dragItem: PianoNoteItem
  position: MousePositionType
  offset: IPoint
  dragStart: IPoint
}

const _PianoNote: SFC<PianoNoteProps> = (props) => {
  const { item } = props
  const render = (g: PIXIGraphics) => {
    const alpha = item.velocity / 127
    const noteColor = item.isSelected ? props.selectedColor : props.color
    let { width, height } = item

    width = Math.round(width - 1) // 次のノートと被らないように小さくする
    height = Math.round(height)
    const lineColor = item.isSelected
      ? props.selectedBorderColor
      : props.borderColor

    g.clear()
      .lineStyle(1, lineColor, alpha)
      .beginFill(noteColor, alpha)
      .drawRect(0, 0, width, height)
      .endFill()
  }

  const renderDrumNote = (g: PIXIGraphics) => {
    const alpha = item.velocity / 127
    const noteColor = item.isSelected ? props.selectedColor : props.color
    const radius = Math.round(item.height / 2)

    g.clear()
      .lineStyle(1, props.borderColor, 1)
      .beginFill(noteColor, alpha)
      .drawCircle(0, radius / 2, radius)
  }

  const [hovering, setHover] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragPosition, setDragPosition] = useState<MousePositionType>("center")
  const [dragItem, setDragItem] = useState<PianoNoteItem>(item)

  const beginHover = useCallback(() => setHover(true), [setHover])
  const endHover = useCallback(() => setHover(false), [setHover])
  const beginDragging = (e: PIXI.interaction.InteractionEvent) => {
    e.stopPropagation()
    e.data.originalEvent.stopImmediatePropagation()

    if (dragging) {
      return
    }

    const offset = e.data.getLocalPosition(e.target.parent)
    const local = {
      x: offset.x - item.x,
      y: offset.y - item.y,
    }
    setDragPosition(getPositionType(local.x, item.width))
    setDragStart(offset)
    setDragging(true)
    setDragItem({ ...item })
  }
  const endDragging = useCallback(() => setDragging(false), [setDragging])

  const ref = useRef<PIXIGraphics>(null)

  const extendEvent = (
    e: PIXI.interaction.InteractionEvent
  ): PianoNoteMouseEvent => {
    const offset = e.data.getLocalPosition(ref.current!.parent)
    return {
      nativeEvent: e,
      dragItem,
      dragStart,
      offset,
      position: dragPosition,
    }
  }

  const mousemove = useCallback(
    (e: PIXI.interaction.InteractionEvent) => {
      if (dragging) {
        props.onMouseDrag?.(extendEvent(e))
        e.stopPropagation()
        e.data.originalEvent.stopImmediatePropagation()
      } else if (hovering) {
        props.onMouseHover?.(extendEvent(e))
      }
    },
    [dragging, hovering]
  )

  console.log(`render ${item.id}`)

  return (
    <Graphics
      ref={ref}
      draw={props.isDrum ? renderDrumNote : render}
      x={Math.round(item.x)}
      y={Math.round(item.y)}
      interactive={true}
      mouseover={beginHover}
      mouseout={endHover}
      mousedown={beginDragging}
      mousemove={mousemove}
      mouseup={endDragging}
      mouseupoutside={endDragging}
    />
  )
}

function getPositionType(localX: number, width: number): MousePositionType {
  const edgeSize = Math.min(width / 3, 8)
  if (localX <= edgeSize) {
    return "left"
  }
  if (width - localX <= edgeSize) {
    return "right"
  }
  return "center"
}

export const PianoNote = React.memo(_PianoNote, _.isEqual)

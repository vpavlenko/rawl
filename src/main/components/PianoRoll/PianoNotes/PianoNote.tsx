import React, { useCallback, useRef, FC } from "react"
import { Graphics as PIXIGraphics, Rectangle } from "pixi.js"
import { IRect, IPoint } from "src/common/geometry"
import { useState } from "react"
import { Graphics } from "@inlet/react-pixi"
import _ from "lodash"
import { NoteEvent } from "src/common/track"
import { NoteCoordTransform } from "src/common/transform"

export interface PianoNoteMouseData {
  note: NoteEvent
  transform: NoteCoordTransform
}

export type PianoNoteItem = IRect & {
  id: number
  velocity: number
  isSelected: boolean

  // マウスイベントに必要な情報
  mouseData: PianoNoteMouseData
}

export interface PianoNoteProps {
  item: PianoNoteItem
  isDrum: boolean
  color: number
  borderColor: number
  selectedColor: number
  selectedBorderColor: number
  onMouseDrag: (e: PianoNoteMouseEvent) => void
  onMouseHover: (e: PianoNoteMouseEvent) => void
}

export type MousePositionType = "left" | "center" | "right"

const useGestures = (
  item: PianoNoteItem,
  onMouseDrag: (e: PianoNoteMouseEvent) => void,
  onMouseHover: (e: PianoNoteMouseEvent) => void
) => {
  const [entered, setEntered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragPosition, setDragPosition] = useState<MousePositionType>("center")
  const [dragItem, setDragItem] = useState<PianoNoteItem>(item)
  const [cursor, setCursor] = useState("default")

  const beginDragging = (e: PIXI.InteractionEvent) => {
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
    const position = getPositionType(local.x, item.width)
    setDragPosition(position)
    setDragStart(offset)
    setDragging(true)
    setDragItem({ ...item })
  }
  const endDragging = useCallback(() => setDragging(false), [setDragging])

  const ref = useRef<PIXIGraphics>(null)

  const extendEvent = (e: PIXI.InteractionEvent): PianoNoteMouseEvent => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
    (e: PIXI.InteractionEvent) => {
      if (!entered && !dragging) {
        return
      }

      // update cursor
      if (e.target !== null) {
        const offset = e.data.getLocalPosition(e.target.parent)
        const local = {
          x: offset.x - item.x,
          y: offset.y - item.y,
        }
        const position = getPositionType(local.x, item.width)
        const newCursor = mousePositionToCursor(position)
        if (newCursor !== cursor) {
          setCursor(newCursor)
        }
      }

      const ev = extendEvent(e)
      if (dragging) {
        onMouseDrag(ev)
        e.stopPropagation()
        e.data.originalEvent.stopImmediatePropagation()
      } else {
        onMouseHover(ev)
      }
    },
    [
      dragging,
      entered,
      cursor,
      setCursor,
      onMouseDrag,
      onMouseHover,
      extendEvent,
    ]
  )

  const mouseover = useCallback(() => {
    setEntered(true)
    console.log("enter")
  }, [setEntered])
  const mouseout = useCallback(() => {
    setEntered(false)
    console.log("exit")
  }, [setEntered])

  return {
    ref,
    mouseover,
    mouseout,
    mousedown: beginDragging,
    mousemove: mousemove,
    mouseup: endDragging,
    mouseupoutside: endDragging,
    cursor,
  }
}

const mousePositionToCursor = (position: MousePositionType) => {
  switch (position) {
    case "center":
      return "move"
    case "left":
      return "w-resize"
    case "right":
      return "e-resize"
  }
}

export interface PianoNoteMouseEvent {
  nativeEvent: PIXI.InteractionEvent
  // ドラッグ開始時の item
  dragItem: PianoNoteItem
  position: MousePositionType
  offset: IPoint
  dragStart: IPoint
}

const _PianoNote: FC<PianoNoteProps> = (props) => {
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

  const handleMouse = useGestures(item, props.onMouseDrag, props.onMouseHover)

  return (
    <Graphics
      draw={props.isDrum ? renderDrumNote : render}
      x={Math.round(item.x)}
      y={Math.round(item.y)}
      interactive={true}
      hitArea={new Rectangle(0, 0, item.width, item.height)}
      {...handleMouse}
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

const diff = (before: any, after: any) =>
  _.omitBy(before, (v, k) => after[k] === v)

const areEqual = (props: PianoNoteProps, nextProps: PianoNoteProps) =>
  _.isEqual(props.item, nextProps.item) &&
  props.isDrum === nextProps.isDrum &&
  props.color === nextProps.color &&
  props.borderColor === nextProps.borderColor &&
  props.selectedColor === nextProps.selectedColor &&
  props.selectedBorderColor === nextProps.selectedBorderColor &&
  props.onMouseDrag === nextProps.onMouseDrag &&
  props.onMouseHover === nextProps.onMouseHover

export const PianoNote = React.memo(_PianoNote, areEqual)

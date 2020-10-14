import React, { useCallback, FC } from "react"
import { Graphics as PIXIGraphics, Rectangle } from "pixi.js"
import { IRect, IPoint, pointSub, pointAdd } from "../../../../common/geometry"
import { useState } from "react"
import { Graphics } from "@inlet/react-pixi"
import isEqual from "lodash/isEqual"
import { NoteEvent } from "src/common/track"
import { NoteCoordTransform } from "src/common/transform"
import { observeDrag } from "../MouseHandler/observeDrag"

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
  onMouseDrag: (e: PianoNoteMouseEvent) => void
  onDoubleClick: (e: PIXI.InteractionEvent) => void
}

export type MousePositionType = "left" | "center" | "right"

const DOUBLE_CLICK_INTERVAL = 500

const useGestures = (
  item: PianoNoteItem,
  onMouseDrag: (e: PianoNoteMouseEvent) => void,
  onDoubleClick: (e: PIXI.InteractionEvent) => void
) => {
  const [entered, setEntered] = useState(false)
  const [dragging, setDragging] = useState<boolean>(false)
  const [lastMouseDownTime, setLastMouseDownTime] = useState(0)
  const [cursor, setCursor] = useState("default")

  const mousedown = (e: PIXI.InteractionEvent) => {
    e.stopPropagation()
    e.data.originalEvent.stopImmediatePropagation()

    if (dragging) {
      return
    }

    if (
      e.data.originalEvent.timeStamp - lastMouseDownTime <
      DOUBLE_CLICK_INTERVAL
    ) {
      onDoubleClick(e)
      return
    }

    const offset = e.data.getLocalPosition(e.target.parent)
    const local = {
      x: offset.x - item.x,
      y: offset.y - item.y,
    }
    const position = getPositionType(local.x, item.width)
    setDragging(true)
    setLastMouseDownTime(e.data.originalEvent.timeStamp)

    if (!(e.data.originalEvent instanceof MouseEvent)) {
      return
    }
    const startClientPos = {
      x: e.data.originalEvent.clientX,
      y: e.data.originalEvent.clientY,
    }

    observeDrag({
      onMouseMove: (e) => {
        const clientPos = { x: e.clientX, y: e.clientY }
        const delta = pointSub(clientPos, startClientPos)
        const newOffset = pointAdd(delta, offset)
        const ev = {
          nativeEvent: e,
          dragItem: item,
          delta,
          offset: newOffset,
          position: position,
        }
        onMouseDrag(ev)
        e.stopPropagation()
      },
      onMouseUp: () => {
        setDragging(false)
      },
    })
  }

  const mousemove = useCallback(
    (e: PIXI.InteractionEvent) => {
      if (!entered && dragging === null) {
        return
      }

      // prevent click and double-click
      setLastMouseDownTime(0)

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
    },
    [dragging, entered, cursor, setCursor, onMouseDrag]
  )

  const mouseover = useCallback(() => setEntered(true), [setEntered])
  const mouseout = useCallback(() => setEntered(false), [setEntered])

  return {
    mouseover,
    mouseout,
    mousedown,
    mousemove,
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
  nativeEvent: MouseEvent
  // ドラッグ開始時の item
  dragItem: PianoNoteItem
  position: MousePositionType
  offset: IPoint
  delta: IPoint
}

export interface PianoNoteClickEvent {
  nativeEvent: PIXI.InteractionEvent
  item: PianoNoteItem
}

// fake class that is only used to refer additional property information for Graphics
class PianoGraphics extends PIXIGraphics {
  item: PianoNoteItem
}

export const isPianoNote = (x: PIXI.DisplayObject): x is PianoGraphics =>
  x.name === "PianoNote"

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

  const handleMouse = useGestures(item, props.onMouseDrag, props.onDoubleClick)

  const data = {
    item,
  }

  return (
    <Graphics
      name="PianoNote"
      draw={props.isDrum ? renderDrumNote : render}
      x={Math.round(item.x)}
      y={Math.round(item.y)}
      interactive={true}
      hitArea={new Rectangle(0, 0, item.width, item.height)}
      {...handleMouse}
      {...data}
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

const areEqual = (props: PianoNoteProps, nextProps: PianoNoteProps) =>
  isEqual(props.item, nextProps.item) &&
  props.isDrum === nextProps.isDrum &&
  props.color === nextProps.color &&
  props.borderColor === nextProps.borderColor &&
  props.selectedColor === nextProps.selectedColor &&
  props.selectedBorderColor === nextProps.selectedBorderColor &&
  props.onMouseDrag === nextProps.onMouseDrag &&
  props.onDoubleClick === nextProps.onDoubleClick

export const PianoNote = React.memo(_PianoNote, areEqual)

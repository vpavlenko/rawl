import React, { useCallback, SFC } from "react"
import { shouldUpdate } from "recompose"
import _ from "lodash"

import Stage, { StageMouseEvent } from "components/Stage/Stage"

import VelocityItem from "./VelocityItem"
import { NoteCoordTransform } from "common/transform"
import Item from "../../Stage/Item"
import { TrackEvent, isNoteEvent } from "common/track"

export interface PianoVelocityControlProps {
  width: number
  height: number
  events: TrackEvent[]
  transform: NoteCoordTransform
  scrollLeft: number
  color: any
  changeVelocity: (notes: Item[], velocity: number) => void
}

const PianoVelocityControl: SFC<PianoVelocityControlProps> = ({
  width,
  height,
  events,
  transform,
  scrollLeft,
  color,
  changeVelocity
}: PianoVelocityControlProps) => {
  const calcValue = (e: MouseEvent) =>
    Math.round(Math.max(0, Math.min(1, 1 - e.offsetY / height)) * 127)

  const onMouseDown = useCallback((e: StageMouseEvent<MouseEvent>) => {
    const items = e.items
    if (items.length === 0) {
      return
    }

    changeVelocity(items, calcValue(e.nativeEvent))

    const onMouseMove = (e: MouseEvent) => {
      changeVelocity(items, calcValue(e))
    }

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }, [])

  const items = events.filter(isNoteEvent).map(note => {
    const { x } = transform.getRect(note)
    const itemWidth = 5
    const itemHeight = (note.velocity / 127) * height
    const bounds = {
      x,
      y: height - itemHeight,
      width: itemWidth,
      height: itemHeight
    }
    return new VelocityItem(note.id, bounds, false, color)
  })

  return (
    <Stage
      className="PianoControl VelocityControl"
      items={items}
      width={width}
      height={height}
      scrollLeft={scrollLeft}
      onMouseDown={onMouseDown}
    />
  )
}

function test(
  props: PianoVelocityControlProps,
  nextProps: PianoVelocityControlProps
) {
  return (
    props.scrollLeft !== nextProps.scrollLeft ||
    props.width !== nextProps.width ||
    props.height !== nextProps.height ||
    props.events !== nextProps.events ||
    props.transform !== nextProps.transform
  )
}

export default shouldUpdate(test)(PianoVelocityControl)

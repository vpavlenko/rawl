import React, { useCallback, SFC } from "react"
import _ from "lodash"

import Stage, { StageMouseEvent } from "components/Stage/Stage"

import VelocityItem from "./VelocityItem"
import { NoteCoordTransform } from "common/transform"
import Item from "../../Stage/Item"
import { TrackEvent, isNoteEvent } from "common/track"
import { CanvasDrawStyle } from "main/style"
import { GraphAxis } from "../Graph/GraphAxis"
import styled from "styled-components"

export interface PianoVelocityControlProps {
  width: number
  height: number
  events: TrackEvent[]
  transform: NoteCoordTransform
  scrollLeft: number
  color: CanvasDrawStyle
  changeVelocity: (notes: VelocityItem[], velocity: number) => void
}

const Parent = styled.div`
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
`

const PianoVelocityControl: SFC<PianoVelocityControlProps> = ({
  width,
  height,
  events,
  transform,
  scrollLeft,
  color,
  changeVelocity,
}: PianoVelocityControlProps) => {
  const onMouseDown = useCallback(
    (e: StageMouseEvent<MouseEvent, VelocityItem>) => {
      const calcValue = (e: MouseEvent) =>
        Math.round(Math.max(0, Math.min(1, 1 - e.offsetY / height)) * 127)

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
    },
    [height]
  )

  const items = events.filter(isNoteEvent).map((note) => {
    const { x } = transform.getRect(note)
    const itemWidth = 5
    const itemHeight = (note.velocity / 127) * height
    const bounds = {
      x,
      y: height - itemHeight,
      width: itemWidth,
      height: itemHeight,
    }
    return new VelocityItem(note.id, bounds, false, color)
  })

  const axis = [0, 128]

  return (
    <Parent>
      <GraphAxis axis={axis} onClick={() => {}} />
      <Stage
        className="PianoControl VelocityControl"
        items={items}
        width={width}
        height={height}
        scrollLeft={scrollLeft}
        onMouseDown={onMouseDown}
      />
    </Parent>
  )
}

function areEqual(
  props: PianoVelocityControlProps,
  nextProps: PianoVelocityControlProps
) {
  return (
    props.scrollLeft === nextProps.scrollLeft &&
    props.width === nextProps.width &&
    props.height === nextProps.height &&
    props.events === nextProps.events &&
    props.transform === nextProps.transform
  )
}

export default React.memo(PianoVelocityControl, areEqual)

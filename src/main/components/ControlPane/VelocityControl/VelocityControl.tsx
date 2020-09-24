import React, { useCallback, FC } from "react"
import isEqual from "lodash/isEqual"

import VelocityItem, { VelocityItemEvent } from "./VelocityItem"
import { NoteCoordTransform } from "common/transform"
import { TrackEvent, isNoteEvent } from "common/track"
import { CanvasDrawStyle } from "main/style"
import { GraphAxis } from "../Graph/GraphAxis"
import styled from "styled-components"
import { Stage, Container } from "@inlet/react-pixi"
import Color from "color"

export interface PianoVelocityControlProps {
  width: number
  height: number
  events: TrackEvent[]
  transform: NoteCoordTransform
  scrollLeft: number
  color: CanvasDrawStyle
  changeVelocity: (noteIds: number[], velocity: number) => void
}

const Parent = styled.div`
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
`

const PianoVelocityControl: FC<PianoVelocityControlProps> = ({
  width,
  height,
  events,
  transform,
  scrollLeft,
  color,
  changeVelocity,
}: PianoVelocityControlProps) => {
  const onMouseDown = useCallback(
    (ev: VelocityItemEvent) => {
      const e = ev.originalEvent.data.originalEvent as MouseEvent
      const startY = e.clientY - e.offsetY

      const calcValue = (e: MouseEvent) => {
        const offsetY = e.clientY - startY
        return Math.round(Math.max(0, Math.min(1, 1 - offsetY / height)) * 127)
      }

      const noteIds = [ev.item.id]

      changeVelocity(noteIds, calcValue(e))

      const onMouseMove = (e: MouseEvent) => {
        changeVelocity(noteIds, calcValue(e))
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
      y: 0,
      width: itemWidth,
      height,
    }
    return (
      <VelocityItem
        key={note.id}
        id={note.id}
        bounds={bounds}
        itemHeight={itemHeight}
        selected={false}
        fillColor={Color(color).rgbNumber()}
        onMouseDown={onMouseDown}
      />
    )
  })

  const axis = [0, 32, 64, 96, 128]

  return (
    <Parent>
      <GraphAxis axis={axis} onClick={() => {}} />
      <Stage
        className="PianoControl VelocityControl"
        options={{ transparent: true }}
        width={width}
        height={height}
      >
        <Container x={-scrollLeft}>{items}</Container>
      </Stage>
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
    props.changeVelocity === nextProps.changeVelocity &&
    isEqual(props.events, nextProps.events) &&
    isEqual(props.transform, nextProps.transform) &&
    isEqual(props.color, nextProps.color)
  )
}

export default React.memo(PianoVelocityControl, areEqual)

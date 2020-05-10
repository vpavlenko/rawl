import React, { StatelessComponent } from "react"
import LineGraph, { LineGraphProps } from "./LineGraph"
import { NoteCoordTransform } from "common/transform"
import { StageMouseEvent } from "components/Stage/Stage"
import { IPoint } from "common/geometry"

interface ItemValue {
  tick: number
  value: number
}

export interface LineGraphControlEvent extends ItemValue {
  id: number
}

export type LineGraphControlProps = Omit<LineGraphProps, "items"> & {
  events: LineGraphControlEvent[]
  transform: NoteCoordTransform
  maxValue: number
  createEvent: (value: ItemValue) => void
}

const LineGraphControl: StatelessComponent<LineGraphControlProps> = ({
  events,
  transform,
  maxValue,
  createEvent,
  ...props
}) => {
  const lineWidth = props.lineWidth ?? 1
  function transformToPosition(tick: number, value: number) {
    return {
      x: Math.round(transform.getX(tick)),
      y:
        Math.round((1 - value / maxValue) * (props.height - lineWidth * 2)) +
        lineWidth,
    }
  }

  function transformFromPosition(position: IPoint): ItemValue {
    return {
      tick: transform.getTicks(position.x),
      value:
        (1 - (position.y - lineWidth) / (props.height - lineWidth * 2)) *
        maxValue,
    }
  }

  const items = events.map((e) => {
    return {
      id: e.id,
      ...transformToPosition(e.tick, e.value),
    }
  })

  const onMouseDown = (e: StageMouseEvent<MouseEvent>) => {
    createEvent(transformFromPosition(e.local))
  }

  return <LineGraph onMouseDown={onMouseDown} items={items} {...props} />
}

export default React.memo(LineGraphControl)

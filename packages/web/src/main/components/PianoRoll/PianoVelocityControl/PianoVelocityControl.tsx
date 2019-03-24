import React, { Component } from "react"
import { shouldUpdate, Omit } from "recompose"
import _ from "lodash"

import Stage, { StageMouseEvent } from "components/Stage/Stage"

import VelocityItem from "./VelocityItem"
import { NoteCoordTransform } from "common/transform"
import Item from "../../Stage/Item"

export interface PianoVelocityControlProps {
  width: number
  height: number
  events: any[]
  transform: NoteCoordTransform
  scrollLeft: number
  color: any
  onMouseDown: (e: StageMouseEvent<MouseEvent>) => void
}

function PianoVelocityControl({
  width,
  height,
  events,
  transform,
  scrollLeft,
  color,
  onMouseDown
}: PianoVelocityControlProps) {
  const items = events
    .filter(e => e.subtype === "note")
    .map(note => {
      const { x } = transform.getRect(note)
      const itemWidth = 5
      const itemHeight = (note.velocity / 127) * height
      const bounds = {
        x,
        y: height - itemHeight,
        width: itemWidth,
        height: itemHeight
      }
      return new VelocityItem(note.id, bounds, note.selected, color)
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

type Props = Omit<PianoVelocityControlProps, "onMouseDown"> & {
  changeVelocity: (notes: Item[], velocity: number) => void
}

class _PianoVelocityControl extends Component<Props> {
  constructor(props: Props) {
    super(props)
  }

  render() {
    return (
      <PianoVelocityControl
        {...this.props}
        onMouseDown={e => this.onMouseDown(e)}
      />
    )
  }

  onMouseDown = (e: StageMouseEvent<MouseEvent>) => {
    const items = e.items
    if (items.length === 0) {
      return
    }

    const { changeVelocity, height } = this.props

    const calcValue = (e: MouseEvent) =>
      Math.round(Math.max(0, Math.min(1, 1 - e.offsetY / height)) * 127)

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
  }
}

function test(props: Props, nextProps: Props) {
  return (
    props.scrollLeft !== nextProps.scrollLeft ||
    props.width !== nextProps.width ||
    props.height !== nextProps.height ||
    props.events !== nextProps.events ||
    props.transform !== nextProps.transform
  )
}

export default shouldUpdate(test)<Props>(_PianoVelocityControl)

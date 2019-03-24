import React, { Component } from "react"
import { shouldUpdate, Omit } from "recompose"
import _ from "lodash"

import Stage, { StageMouseEvent } from "components/Stage/Stage"

import VelocityItem from "./VelocityItem"
import VelocityMouseHandler from "./VelocityMouseHandler"
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
  private mouseHandler: VelocityMouseHandler

  constructor(props: Props) {
    super(props)

    this.mouseHandler = new VelocityMouseHandler(props.changeVelocity)
  }

  render() {
    return (
      <PianoVelocityControl
        {...this.props}
        onMouseDown={this.mouseHandler.onMouseDown}
      />
    )
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

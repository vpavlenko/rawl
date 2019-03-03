import React, { Component } from "react"
import { shouldUpdate } from "recompose"
import _ from "lodash"

import { IRect } from "common/geometry"
import Stage from "components/Stage/Stage"

import VelocityItem from "./VelocityItem"
import VelocityMouseHandler from "./VelocityMouseHandler"
import { NoteCoordTransform } from "common/transform"
import { Dispatcher } from "main/createDispatcher";

export interface PianoVelocityControlProps {
  width: number
  height: number
  events: any[]
  transform: NoteCoordTransform
  scrollLeft: number
  dispatch: Dispatcher
  color: any
  mouseHandler: any
}

function PianoVelocityControl({
  width,
  height,
  events,
  transform,
  scrollLeft,
  dispatch,
  color,
  mouseHandler
}: PianoVelocityControlProps) {
  const items = events
    .filter(e => e.subtype === "note")
    .map(note => {
      const { x } = transform.getRect(note)
      const itemWidth = 5
      const itemHeight = note.velocity / 127 * height
      const bounds = { x, y: height - itemHeight, width: itemWidth, height: itemHeight }
      return new VelocityItem(note.id, bounds, note.selected, color)
    })

  mouseHandler.dispatch = dispatch

  return <Stage
    className="PianoControl VelocityControl"
    items={items}
    width={width}
    height={height}
    scrollLeft={scrollLeft}
    onMouseDown={e => mouseHandler.onMouseDown(e)}
  />
}

interface State {
  mouseHandler: any  
}

class _PianoVelocityControl extends Component<PianoVelocityControlProps, State> {
  constructor(props) {
    super(props)

    this.state = {
      mouseHandler: new VelocityMouseHandler()
    }
  }

  render() {
    return <PianoVelocityControl {...this.props} {...this.state} />
  }
}

function test(props: PianoVelocityControlProps, nextProps: PianoVelocityControlProps) {
  return props.scrollLeft !== nextProps.scrollLeft
    || props.width !== nextProps.width
    || props.height !== nextProps.height
    || props.events !== nextProps.events
    || props.transform !== nextProps.transform
}

export default shouldUpdate(test)(_PianoVelocityControl)

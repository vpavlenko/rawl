import React, { Component } from "react"
import { shouldUpdate } from "recompose"
import _ from "lodash"

import Rect from "model/Rect"
import Stage from "components/Stage/Stage"

import VelocityItem from "./VelocityItem.ts"
import VelocityMouseHandler from "./VelocityMouseHandler"

function PianoVelocityControl({
  width,
  height,
  events,
  transform,
  scrollLeft,
  dispatch,
  color,
  mouseHandler
}) {
  const items = events
    .filter(e => e.subtype === "note")
    .map(note => {
      const { x } = transform.getRect(note)
      const itemWidth = 5
      const itemHeight = note.velocity / 127 * height
      return new VelocityItem(note.id, new Rect(x, height - itemHeight, itemWidth, itemHeight), note.selected, color)
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

class _PianoVelocityControl extends Component {
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

function test(props, nextProps) {
  return _.isEqual(props.items, nextProps.items)
    || props.scrollLeft !== nextProps.scrollLeft
    || props.width !== nextProps.width
    || props.height !== nextProps.height
    || props.events !== nextProps.events
    || props.transform !== nextProps.transform
}

export default shouldUpdate(test)(_PianoVelocityControl)

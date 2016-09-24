import React, { Component } from "react"
import _ from "lodash"
import PencilMouseHandler from "../NoteMouseHandler/PencilMouseHandler"
import SelectionMouseHandler from "../NoteMouseHandler/SelectionMouseHandler"

function filterEventsInRect(boundsMap, rect) {
  const right = rect.x + rect.width
  const bottom = rect.y + rect.height
  return _.chain(boundsMap)
    .entries()
    .filter(e => {
      const b = e[1]
      return b.x >= rect.x
        && b.x + b.width < right
        && b.y >= rect.y
        && b.y + b.height < bottom
    })
    .value()
}

function filterEventsUnderPoint(boundsMap, x, y) {
  return _.chain(boundsMap)
    .entries()
    .filter(e => {
      const b = e[1]
      return x >= b.x
        && x <= b.x + b.width
        && y >= b.y
        && y <= b.y + b.height
    })
    .value()
}

function entryToObjectWithId(e) {
  return {
    id: e[0],
    ...e[1]
  }
}

export default function mouseablePianoNotes(WrappedComponent) {
  return class extends Component {
    constructor(props) {
      super(props)
      this.mouseHandler = new SelectionMouseHandler(props.emitter)
    }

    render() {
      const props = this.props
      const boundsMap = {}
      const handler = this.mouseHandler

      function setEventBounds(id, bounds) {
        boundsMap[id] = bounds
      }

      // MouseHandler が必要とする機能を提供する
      const ctx = {
        track: props.track,
        selection: props.selection,
        transform: props.transform,
        quantizer: props.quantizer,

        getEventsUnderPoint: (x, y) => {
          return filterEventsUnderPoint(boundsMap, x, y).map(entryToObjectWithId)
        },

        getEventsInRect: rect => {
          return filterEventsInRect(boundsMap, rect).map(entryToObjectWithId)
        }
      }

      return <WrappedComponent {...props}
        setEventBounds={setEventBounds}
        onMouseDown={e => handler.onMouseDown(e, ctx)}
        onMouseMove={e => handler.onMouseMove(e, ctx)}
        onMouseUp={e => handler.onMouseUp(e, ctx)}
      />
    }
  }
}

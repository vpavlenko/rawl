import React, { Component } from "react"
import _ from "lodash"
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
      this.mouseHandler = new SelectionMouseHandler()
      this.state = {
        cursor: "auto"
      }
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
        ...props,

        getEventsUnderPoint: (x, y) => {
          return filterEventsUnderPoint(boundsMap, x, y).map(entryToObjectWithId)
        },

        getEventsInRect: rect => {
          return filterEventsInRect(boundsMap, rect).map(entryToObjectWithId)
        },

        changeCursor: cursor => {
          this.setState({ cursor })
        }
      }

      function getLocal(e) {
        return {
          x: e.nativeEvent.offsetX + props.scrollLeft,
          y: e.nativeEvent.offsetY
        }
      }

      return <WrappedComponent {...props}
        setEventBounds={setEventBounds}
        onMouseDown={e => handler.onMouseDown(getLocal(e), ctx, e)}
        onMouseMove={e => handler.onMouseMove(getLocal(e), ctx, e)}
        onMouseUp={e => handler.onMouseUp(getLocal(e))}
        style={{...props.style, cursor: this.state.cursor}}
      />
    }
  }
}

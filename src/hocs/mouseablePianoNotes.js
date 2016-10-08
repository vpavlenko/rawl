import React, { Component } from "react"
import _ from "lodash"
import SelectionMouseHandler from "../NoteMouseHandler/SelectionMouseHandler"
import PencilMouseHandler from "../NoteMouseHandler/PencilMouseHandler"

function filterEventsInSelection(boundsMap, selection) {
  const s = selection
  return _.chain(boundsMap)
    .entries()
    .filter(e => {
      const b = e[1]
      return b.tick >= s.fromTick
        && b.tick <= s.toTick // ノートの先頭だけ範囲にはいっていればよい
        && b.noteNumber <= s.fromNoteNumber
        && b.noteNumber >= s.toNoteNumber
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
      this.mouseHandler = null
      this.state = {
        cursor: "auto"
      }
    }

    componentWillReceiveProps(nextProps) {
      if (this.mouseHandler === null || this.props.mouseMode !== nextProps.mouseMode) {
        switch(nextProps.mouseMode) {
          case 0:
            this.mouseHandler = new PencilMouseHandler()
            break
          case 1:
            this.mouseHandler = new SelectionMouseHandler()
            break
        }
        this.setState({ cursor: this.mouseHandler.defaultCursor })
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

        getEventsInSelection: () => {
          return filterEventsInSelection(boundsMap, props.selection).map(entryToObjectWithId)
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

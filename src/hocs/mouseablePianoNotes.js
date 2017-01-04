import React, { Component } from "react"
import _ from "lodash"

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

/**
  NoteMouseHandler をラップしたマウスハンドラを生成する
  NoteMouseHandler が必要とする機能を ctx として提供する
  ノート位置の収集などを行う
*/
function wrapMouseHandler(
  { mouseHandler, scrollLeft, quantizer, track, transform, selection, onChangeTool },
  boundsMap, changeCursor) {
  const ctx = {
    getEventsUnderPoint: (x, y) => {
      return filterEventsUnderPoint(boundsMap, x, y).map(entryToObjectWithId)
    },

    getEventsInSelection: () => {
      return filterEventsInSelection(boundsMap, selection).map(entryToObjectWithId)
    },

    quantizer, track, transform, selection, onChangeTool, changeCursor
  }

  function getLocal(e) {
    return {
      x: e.nativeEvent.offsetX + scrollLeft,
      y: e.nativeEvent.offsetY
    }
  }

  return {
    setEventBounds: (id, bounds) => boundsMap[id] = bounds,
    onMouseDown: e => mouseHandler.onMouseDown(getLocal(e), ctx, e),
    onMouseMove: e => mouseHandler.onMouseMove(getLocal(e), ctx, e),
    onMouseUp: e => mouseHandler.onMouseUp(getLocal(e))
  }
}

export default function mouseablePianoNotes(WrappedComponent) {
  return class extends Component {
    constructor(props) {
      super(props)
      this.state = {}
      this.boundsMap = {}
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.mouseHandler !== nextProps.mouseHandler) {
        // カーソルを更新する
        this.setState({ cursor: nextProps.mouseHandler.defaultCursor })
      }
    }

    render() {
      const { props } = this
      const mouseHandler = wrapMouseHandler(
        props,
        this.boundsMap,
        cursor => this.setState({ cursor })
      )

      return <WrappedComponent
        {..._.omit(props, "mouseHandler")}
        mouseHandler={mouseHandler}
        style={{ cursor: this.state.cursor || props.mouseHandler.defaultCursor }}
      />
    }
  }
}

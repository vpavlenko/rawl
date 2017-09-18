import React, { Component } from "react"
import PropTypes from "prop-types"
import SplitPane from "react-split-pane"

import NoteCoordTransform from "../../model/NoteCoordTransform"
import fitToContainer from "../../hocs/fitToContainer"
import mapBeats from "../../helpers/mapBeats"

import PianoKeys from "./PianoKeys"
import PianoGrid from "./PianoGrid"
import PianoLines from "./PianoLines"
import PianoRuler from "./PianoRuler"
import PianoNotes from "./PianoNotes/PianoNotes"
import PianoSelection from "./PianoSelection"
import PianoCursor from "./PianoCursor"
import ControlPane from "./ControlPane"
import { VerticalScrollBar, HorizontalScrollBar, BAR_WIDTH } from "../inputs/ScrollBar"
import { open as openContextMenu } from "./PianoContextMenu"

import "./PianoRoll.css"

const SCROLL_KEY_SPEED = 4

function positionType(selection, transform, pos) {
  const rect = selection.getBounds(transform)
  const contains =
    rect.x <= pos.x && rect.x + rect.width >= pos.x &&
    rect.y <= pos.y && rect.y + rect.height >= pos.y
  if (!contains) {
    return "outside"
  }
  const localX = pos.x - rect.x
  const edgeSize = Math.min(rect.width / 3, 8)
  if (localX <= edgeSize) { return "left" }
  if (rect.width - localX <= edgeSize) { return "right" }
  return "center"
}

class PianoRoll extends Component {
  constructor(props) {
    super(props)

    this.state = {
      scrollLeft: 0,
      scrollTop: 0,
      controlHeight: 0,
      cursorPosition: 0,
      notesCursor: "auto",
      controlMode: "velocity"
    }
  }

  componentDidMount() {
    this.props.player.on("change-position", this.onTick)

    document.addEventListener("copy", this.onCopy)
    document.addEventListener("paste", this.onPaste)
  }

  componentWillUnmount() {
    document.removeEventListener("copy", this.onCopy)
    document.removeEventListener("paste", this.onPaste)
    this.props.player.off("change-position", this.onTick)
  }

  onTick = tick => {
    const { autoScroll } = this.props
    const x = this.getTransform().getX(tick)
    this.setState({
      cursorPosition: x
    })

    // keep scroll position to cursor
    if (autoScroll) {
      const screenX = x - this.state.scrollLeft
      if (screenX > this.props.containerWidth * 0.7 || screenX < 0) {
        this.setScrollLeft(x)
      }
    }
  }

  getContentSize() {
    const { endTick, containerWidth } = this.props
    const transform = this.getTransform()
    const widthTick = Math.max(endTick, transform.getTicks(containerWidth))
    return {
      width: widthTick * transform.pixelsPerTick,
      height: transform.getMaxY()
    }
  }

  setScrollLeft(scroll) {
    const maxOffset = this.getContentSize().width - this.alpha.getBoundingClientRect().width
    this.setState({ scrollLeft: Math.floor(Math.min(maxOffset, Math.max(0, scroll))) })
  }

  setScrollTop(scroll) {
    const maxOffset = this.getContentSize().height - this.alpha.getBoundingClientRect().height
    this.setState({ scrollTop: Math.floor(Math.min(maxOffset, Math.max(0, scroll))) })
  }

  onCopy = () => {
    if (this.props.mouseMode !== 1) {
      // not selection mode
      return
    }

    this.props.dispatch("COPY_SELECTION")
  }

  onPaste = () => {
    this.props.dispatch("PASTE_SELECTION")
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true
  }

  getTransform() {
    const { theme, scaleX } = this.props
    const keyHeight = theme.keyHeight
    const pixelsPerTick = 0.1 * scaleX
    return new NoteCoordTransform(
      pixelsPerTick,
      keyHeight,
      127)
  }

  dispatch = (type, params) => {
    const {
      quantizer,
      dispatch,
      selection
    } = this.props

    const transform = this.getTransform()

    // TODO: dispatch 内では音符座標系を扱い、position -> tick 変換等は component 内で行う
    // TODO: setState を使うもの以外は上の階層で実装する
    switch (type) {
      case "CHANGE_CURSOR":
        this.setState({ notesCursor: params.cursor })
        break
      case "SCROLL_BY":
        // TODO: PianoRoll をスクロールする
        break
      case "GET_SELECTION_RECT": // FIXME: dispatch から値を取得しない
        return selection.getBounds(transform)
      case "GET_SELECTION_POSITION_TYPE": // FIXME: dispatch から値を取得しない
        return positionType(selection, transform, params.position)
      case "MOVE_SELECTION_XY": {
        const tick = quantizer.round(transform.getTicks(params.position.x))
        const noteNumber = Math.round(transform.getNoteNumber(params.position.y))
        dispatch("MOVE_SELECTION", { tick, noteNumber })
        break
      }
      case "RESIZE_SELECTION_LEFT_XY": {
        const tick = quantizer.round(transform.getTicks(params.position.x))
        dispatch("RESIZE_SELECTION_LEFT", { tick })
        break
      }
      case "RESIZE_SELECTION_RIGHT_XY": {
        const tick = quantizer.round(transform.getTicks(params.position.x))
        dispatch("RESIZE_SELECTION_RIGHT", { tick })
        break
      }
      case "OPEN_CONTEXT_MENU":
        return openContextMenu(this.dispatch, params)
      case "SELECT_CONTROL_TAB":
        this.setState({ controlMode: params.name })
        break
      default:
        return dispatch(type, params)
    }
  }

  render() {
    const {
      theme,
      track,
      onClickKey,
      beats,
      endTick,
      mouseMode,
      selection,
      containerWidth
    } = this.props

    const {
      scrollLeft,
      scrollTop,
      notesCursor,
      cursorPosition,
      controlMode
    } = this.state

    const { keyWidth, rulerHeight } = theme
    const width = containerWidth

    const transform = this.getTransform()
    const widthTick = Math.max(endTick, transform.getTicks(width))

    const contentSize = this.getContentSize()
    const contentWidth = contentSize.width
    const contentHeight = contentSize.height

    const events = track.getEvents()

    const startTick = scrollLeft / transform.pixelsPerTick
    const mappedBeats = mapBeats(beats, transform.pixelsPerTick, startTick, widthTick)

    const dispatch = this.dispatch

    const onScrollLeft = ({ scroll }) => {
      this.setScrollLeft(scroll)
    }

    const onScrollTop = ({ scroll }) => {
      this.setScrollTop(scroll)
    }

    return <div className="PianoRoll">
      <SplitPane split="horizontal" defaultSize={180} primary="second">
        <div
          className="alpha"
          ref={c => this.alpha = c}
          onWheel={e => {
            e.preventDefault()
            const scrollLineHeight = transform.pixelsPerKey * SCROLL_KEY_SPEED
            const delta = scrollLineHeight * (e.deltaY > 0 ? 1 : -1)
            this.setScrollTop(this.state.scrollTop + delta)
          }}>
          <div className="alphaContent" style={{ top: -scrollTop }}>
            <PianoLines
              width={width}
              pixelsPerKey={transform.pixelsPerKey}
              numberOfKeys={transform.numberOfKeys} />
            <PianoGrid
              width={width}
              height={contentHeight}
              scrollLeft={scrollLeft}
              beats={mappedBeats} />
            <PianoNotes
              events={events}
              selectedEventIds={selection.noteIds}
              transform={transform}
              width={width}
              cursor={notesCursor}
              dispatch={dispatch}
              mouseMode={mouseMode}
              scrollLeft={scrollLeft}
              isDrumMode={track.isRhythmTrack} />
            <PianoSelection
              theme={theme}
              width={width}
              height={contentHeight}
              transform={transform}
              selection={selection}
              scrollLeft={scrollLeft} />
            <PianoCursor
              width={width}
              height={contentHeight}
              position={cursorPosition - scrollLeft} />
            <PianoKeys
              theme={theme}
              width={keyWidth}
              keyHeight={transform.pixelsPerKey}
              numberOfKeys={transform.numberOfKeys}
              onClickKey={onClickKey} />
          </div>
          <div className="alphaRuler">
            <PianoRuler
              width={width}
              theme={theme}
              height={rulerHeight}
              endTick={widthTick}
              beats={mappedBeats}
              onMouseDown={({ tick }) => dispatch("SET_PLAYER_POSITION", { tick })}
              scrollLeft={scrollLeft}
              pixelsPerTick={transform.pixelsPerTick} />
            <div className="PianoRollLeftSpace" />
          </div>
          <VerticalScrollBar
            scrollOffset={scrollTop}
            contentLength={contentHeight}
            onScroll={onScrollTop}
          />
        </div>
        <div
          className="beta"
          ref={c => this.beta = c}>
          <ControlPane
            mode={controlMode}
            theme={theme}
            beats={mappedBeats}
            events={events}
            dispatch={dispatch}
            transform={transform}
            scrollLeft={scrollLeft}
            paddingBottom={BAR_WIDTH}
          />
          <HorizontalScrollBar
            scrollOffset={scrollLeft}
            contentLength={contentWidth}
            onScroll={onScrollLeft}
          />
        </div>
      </SplitPane>
    </div>
  }
}

PianoRoll.propTypes = {
  player: PropTypes.object.isRequired,
  quantizer: PropTypes.object.isRequired,
  endTick: PropTypes.number.isRequired,
  scaleX: PropTypes.number.isRequired,
  scaleY: PropTypes.number.isRequired,
  autoScroll: PropTypes.bool.isRequired,
  onClickKey: PropTypes.func.isRequired,
  mouseMode: PropTypes.number.isRequired
}

PianoRoll.defaultProps = {
  endTick: 400,
  scaleX: 1,
  scaleY: 1,
  autoScroll: false
}

export default fitToContainer(PianoRoll, {
  width: "100%",
  height: "100%"
})

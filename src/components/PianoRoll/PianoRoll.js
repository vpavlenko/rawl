import React, { Component } from "react"
import PropTypes from "prop-types"
import { pure } from "recompose"
import SplitPane  from "react-split-pane"

import SelectionModel from "../../model/SelectionModel"
import NoteCoordTransform from "../../model/NoteCoordTransform"
import fitToContainer from "../../hocs/fitToContainer"
import mapBeats from "../../helpers/mapBeats"

import SelectionController from "./controllers/SelectionController"

import PianoKeys from "./PianoKeys"
import PianoGrid from "./PianoGrid"
import PianoLines from "./PianoLines"
import PianoRuler from "./PianoRuler"
import PianoNotes from "./PianoNotes/PianoNotes"
import PianoSelection from "./PianoSelection"
import PianoCursor from "./PianoCursor"
import ControlPane from "./ControlPane"
import { open as openContextMenu } from "./PianoContextMenu"

import "./PianoRoll.css"

const SCROLL_KEY_SPEED = 4

const PseudoHeightContent = pure(({ height }) => {
  return <div style={{
    height
  }} />
})

const PseudoWidthContent = pure(({ onmount, width }) => {
  return <div ref={onmount} style={{
    width,
    height: "100%"
  }} />
})

const FixedLeftContent = pure(({ children, left }) => {
  return <div className="fixed-left" style={{ left }}>
    {children}
  </div>
})

class PianoRoll extends Component {
  constructor(props) {
    super(props)

    this.state = {
      scrollLeft: 0,
      scrollTop: 0,
      controlHeight: 0,
      cursorPosition: 0,
      notesCursor: "auto",
      controlMode: "velocity",
      selection: new SelectionModel()
    }

    this.state.selection.on("change", () => {
      this.setState({selection: this.state.selection})
    })
  }

  forceScrollLeft(requiredScrollLeft) {
    const maxScrollLeft = this.beta.scrollWidth - this.beta.clientWidth
    const scrollLeft = Math.floor(Math.min(maxScrollLeft, requiredScrollLeft))
    this.alpha.scrollLeft = scrollLeft
    this.beta.scrollLeft = scrollLeft
    this.setState({ scrollLeft })
  }

  alphaDidScroll = (e) => {
    const { scrollTop } = e.target
    this.alpha.scrollLeft = 0
    this.setState({ scrollTop })
  }

  betaDidScroll = (e) => {
    const { scrollLeft } = e.target
    this.alpha.scrollLeft = 0
    this.beta.scrollTop = 0
    this.setState({ scrollLeft })
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
        this.forceScrollLeft(x)
      }
    }
  }

  onCopy = () => {
    if (this.props.mouseMode !== 1) {
      // not selection mode
      return
    }

    this.selectionController.copySelection()
  }

  get selectionController() {
    return new SelectionController(
        this.state.selection,
        this.props.track,
        this.props.quantizer,
        this.getTransform(),
        this.props.player)
  }

  onPaste = () => {
    this.selectionController.pasteSelection()
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

  render() {
    const {
      theme,
      track,
      onClickKey,
      beats,
      endTick,
      mouseMode,
      player,
      quantizer,
      containerWidth
    } = this.props

    const {
      scrollLeft,
      scrollTop,
      notesCursor,
      selection,
      cursorPosition,
      controlMode
    } = this.state

    const { keyWidth, rulerHeight } = theme
    const width = containerWidth

    const transform = this.getTransform()
    const widthTick = Math.max(endTick, transform.getTicks(width))

    const contentWidth = widthTick * transform.pixelsPerTick
    const contentHeight = transform.getMaxY()

    const events = track.getEvents()
    
    const startTick = scrollLeft / transform.pixelsPerTick
    const mappedBeats = mapBeats(beats, transform.pixelsPerTick, startTick, widthTick)

    const selectionController = new SelectionController(selection, track, quantizer, transform, player)

    // TODO: dispatch 内では音符座標系を扱い、position -> tick 変換等は component 内で行う
    // TODO: setState を使うもの以外は上の階層で実装する
    const dispatch = (type, params) => {
      switch(type) {
        case "CHANGE_CURSOR":
          this.setState({ notesCursor: params.cursor })
          break
        case "SCROLL_BY":
          // TODO: PianoRoll をスクロールする
          break
        case "RESIZE_SELECTION_LEFT":
          return selectionController.resizeLeft(params.position)
        case "RESIZE_SELECTION_RIGHT":
          return selectionController.resizeRight(params.position)
        case "MOVE_SELECTION":
          return selectionController.moveTo(params.position)
        case "GET_SELECTION_RECT": // FIXME: dispatch から値を取得しない
          return selectionController.getRect()
        case "GET_SELECTION_POSITION_TYPE": // FIXME: dispatch から値を取得しない
          return selectionController.positionType(params.position)
        case "START_SELECTION":
          if (!player.isPlaying) {
            dispatch("SET_PLAYER_POSITION", { tick: params.tick })
          }
          return selectionController.startAt(params.tick, params.noteNumber)
        case "RESIZE_SELECTION":
          return selection.resize(
            quantizer.round(params.start.tick),
            params.start.noteNumber,
            quantizer.round(params.end.tick),
            params.end.noteNumber)
        case "FIX_SELECTION":
          return selectionController.fix()
        case "COPY_SELECTION":
          return selectionController.copySelection()
        case "DELETE_SELECTION":
          return selectionController.deleteSelection()
        case "PASTE_SELECTION":
          return selectionController.pasteSelection()
        case "OPEN_CONTEXT_MENU":
          return openContextMenu(dispatch, params)
        case "SELECT_CONTROL_TAB":
          this.setState({ controlMode: params.name })
          break
        default:
          return this.props.dispatch(type, params)
      }
    }

    return <div className="PianoRoll">
      <SplitPane split="horizontal" defaultSize={180} primary="second">
      <div className="alpha" ref={c => this.alpha = c}
        onScroll={this.alphaDidScroll}
        onWheel={e => {
          e.preventDefault()
          const scrollLineHeight = transform.pixelsPerKey * SCROLL_KEY_SPEED
          this.alpha.scrollTop += scrollLineHeight * (e.deltaY > 0 ? 1 : -1)
        }}>
        <PseudoHeightContent height={contentHeight} />
        <div className="alphaContent">
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
        <div className="alphaRuler" style={{ top: scrollTop }}>
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
      </div>
      <div
        className="beta"
        ref={c => this.beta = c}
        onScroll={this.betaDidScroll}>
        <PseudoWidthContent width={contentWidth} onmount={c => this.betaPseudoContent = c} />
        <FixedLeftContent left={scrollLeft}>
          <ControlPane
            mode={controlMode}
            theme={theme}
            beats={mappedBeats}
            events={events}
            dispatch={dispatch}
            transform={transform}
            scrollLeft={scrollLeft}
          />
        </FixedLeftContent>
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

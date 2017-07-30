import React, { Component } from "react"
import PropTypes from "prop-types"
import { pure } from "recompose"
import SplitPane  from "react-split-pane"

import SelectionModel from "../../model/SelectionModel"
import NoteCoordTransform from "../../model/NoteCoordTransform"
import withTheme from "../../hocs/withTheme"
import fitToContainer from "../../hocs/fitToContainer"
import { PitchBendMidiEvent } from "../../midi/MidiEvent"

import NoteController from "./controllers/NoteController"
import SelectionController from "./controllers/SelectionController"

import PianoKeys from "./PianoKeys"
import PianoGrid from "./PianoGrid"
import PianoLines from "./PianoLines"
import PianoRuler from "./PianoRuler"
import PianoNotes from "./PianoNotes/PianoNotes"
import PianoSelection from "./PianoSelection"
import PianoVelocityControl from "./PianoVelocityControl/PianoVelocityControl"
import PitchGraph from "./PitchGraph/PitchGraph"
import PianoCursor from "./PianoCursor"

import "./PianoRoll.css"

const SCROLL_KEY_SPEED = 4

const ControlToolbar = pure(({ onmount, buttons }) => {
  return <div className="control-toolbar" ref={onmount}>
    {buttons.map(({ label, selected, onClick }) =>
      <button className={selected ? "selected" : ""} onClick={onClick} key={label}>{label}</button>
    )}
  </div>
})

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

const FixedTopLeftContent = pure(({ children, left, top }) => {
  return <div className="fixed-left-top" style={{ left, top }}>
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

  fitBetaSize = () => {
    this.setState({
      controlHeight: this.betaPseudoContent.clientHeight - this.controlToolbar.clientHeight
    })
  }

  alphaDidScroll = (e) => {
    const { scrollTop } = e.target
    this.setState({ scrollTop })
  }

  betaDidScroll = (e) => {
    const { scrollLeft } = e.target
    this.alpha.scrollLeft = scrollLeft
    this.setState({ scrollLeft })
  }

  componentDidMount() {
    this.fitBetaSize()

    window.addEventListener("resize", this.fitBetaSize)
    this.props.player.on("change-position", this.onTick)

    document.addEventListener("copy", this.onCopy)
    document.addEventListener("paste", this.onPaste)
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.fitBetaSize)
    document.removeEventListener("copy", this.onCopy)
    document.removeEventListener("paste", this.onPaste)
    this.props.player.off("change-position", this.onTick)
  }

  onTick = tick => {
    const { player, autoScroll } = this.props
    const x = this.getTransform().getX(tick)
    this.setState({
      cursorPosition: x
    })

    // keep scroll position to cursor
    if (autoScroll && player.isPlaying) {
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
      onClickRuler,
      onClickKey,
      ticksPerBeat,
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
      controlHeight,
      controlMode
    } = this.state

    const { keyWidth, rulerHeight } = theme
    const width = containerWidth

    const transform = this.getTransform()
    const widthTick = Math.max(endTick, transform.getTicks(width))

    const contentWidth = widthTick * transform.pixelsPerTick
    const contentHeight = transform.getMaxY()

    const onMouseDownRuler = e => {
      const tick = quantizer.round(transform.getTicks(e.nativeEvent.offsetX + scrollLeft))
      onClickRuler(tick, e)
    }

    const events = track.getEvents()

    const controlToolbar = <ControlToolbar
      onmount={c => this.controlToolbar = c}
      buttons={[
        {
          label: "velocity",
          selected: controlMode === "velocity",
          onClick: () => this.setState({ controlMode: "velocity" })
        },
        {
          label: "pitchBend",
          selected: controlMode === "pitchBend",
          onClick: () => this.setState({ controlMode: "pitchBend" })
        }
      ]} />

    const noteController = new NoteController(track, quantizer, transform, player)
    const selectionController = new SelectionController(selection, track, quantizer, transform, player)

    // TODO: dispatch 内では音符座標系を扱い、position -> tick 変換等は component 内で行う
    // TODO: setState を使うもの以外は上の階層で実装する
    const dispatch = (type, params) => {
      switch(type) {
        case "CREATE_NOTE":
          return noteController.createAt(params.position)
        case "REMOVE_NOTE":
          return noteController.remove(params.id)
        case "MOVE_NOTE":
          return noteController.moveTo(params.id, params.position)
        case "RESIZE_NOTE_LEFT":
          return noteController.resizeLeft(params.id, params.position)
        case "RESIZE_NOTE_RIGHT":
          return noteController.resizeRight(params.id, params.position)
        case "MOVE_NOTE_CENTER":
          return noteController.moveCenter(params.id, params.position)
        case "CHANGE_CURSOR":
          this.setState({ notesCursor: params.cursor })
          break
        case "TOGGLE_TOOL":
          this.props.toggleMouseMode()
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
          return selectionController.startAt(params.position)
        case "RESIZE_SELECTION":
          return selectionController.resize(params.position)
        case "FIX_SELECTION":
          return selectionController.fix()
        case "SET_PLAYER_CURSOR":
          return selectionController.setPlayerCursor(params.position)
        case "COPY_SELECTION":
          return selectionController.copySelection()
        case "DELETE_SELECTION":
          return selectionController.deleteSelection()
        case "PASTE_SELECTION":
          return selectionController.pasteSelection()
        case "CHANGE_NOTES_VELOCITY":
          return track.transaction(it => {
            params.notes.forEach(item => {
              it.updateEvent(item.id, { velocity: params.velocity })
            })
          })
        case "CREATE_PITCH_BEND":
          const event = new PitchBendMidiEvent(0, params.value)
          event.tick = params.tick
          return track.addEvent(event)
        default:
          // TODO: 上の階層に投げる
          break
      }
    }

    return <div
      className="PianoRoll"
      ref={c => this.container = c}>

      <SplitPane split="horizontal" onChange={this.fitBetaSize} defaultSize={180} primary="second">
      <div className="alpha" ref={c => this.alpha = c}
        onScroll={this.alphaDidScroll}
        onWheel={e => {
          e.preventDefault()
          const scrollLineHeight = transform.pixelsPerKey * SCROLL_KEY_SPEED
          this.alpha.scrollTop += scrollLineHeight * (e.deltaY > 0 ? 1 : -1)
        }}>
        <PseudoHeightContent height={contentHeight} />
        <FixedLeftContent left={scrollLeft}>
          <PianoLines
            width={width}
            pixelsPerKey={transform.pixelsPerKey}
            numberOfKeys={transform.numberOfKeys} />
          <PianoGrid
            endTick={widthTick}
            ticksPerBeat={ticksPerBeat}
            width={width}
            height={contentHeight}
            scrollLeft={scrollLeft}
            transform={transform} />
          <PianoNotes
            events={events}
            transform={transform}
            width={width}
            cursor={notesCursor}
            dispatch={dispatch}
            mouseMode={mouseMode}
            scrollLeft={scrollLeft} />
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
        </FixedLeftContent>
        <FixedTopLeftContent top={scrollTop} left={scrollLeft}>
          <PianoRuler
            theme={theme}
            height={rulerHeight}
            endTick={widthTick}
            ticksPerBeat={ticksPerBeat}
            onMouseDown={e => onMouseDownRuler(e)}
            scrollLeft={scrollLeft}
            pixelsPerTick={transform.pixelsPerTick} />
          <div className="PianoRollLeftSpace" />
        </FixedTopLeftContent>
      </div>
      <div
        className="beta"
        ref={c => this.beta = c}
        onScroll={this.betaDidScroll}>
        <PseudoWidthContent width={contentWidth} onmount={c => this.betaPseudoContent = c} />
        <FixedLeftContent left={scrollLeft}>
          {controlToolbar}
          <div className="control-content">
            {controlMode === "velocity" && <PianoVelocityControl
              width={width}
              height={controlHeight}
              transform={transform}
              events={events}
              scrollLeft={scrollLeft}
              dispatch={dispatch} />}
            {controlMode === "pitchBend" && <PitchGraph
              width={width}
              height={controlHeight}
              scrollLeft={scrollLeft}
              events={events}
              transform={transform}
              dispatch={dispatch} />}
            <PianoGrid
              endTick={widthTick}
              ticksPerBeat={ticksPerBeat}
              width={width}
              height={controlHeight}
              scrollLeft={scrollLeft}
              transform={transform} />
          </div>
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
  ticksPerBeat: PropTypes.number.isRequired,
  autoScroll: PropTypes.bool.isRequired,
  onClickRuler: PropTypes.func.isRequired,
  onClickKey: PropTypes.func.isRequired,
  mouseMode: PropTypes.number.isRequired
}

PianoRoll.defaultProps = {
  endTick: 400,
  scaleX: 1,
  scaleY: 1,
  autoScroll: false,
  ticksPerBeat: 480
}

export default fitToContainer(withTheme(PianoRoll), {
  width: "100%",
  height: "100%"
})

import React, { Component } from "react"
import PropTypes from "prop-types"
import { pure } from "recompose"
import SplitPane  from "react-split-pane"

import SelectionModel from "../model/SelectionModel"
import NoteCoordTransform from "../model/NoteCoordTransform"
import PianoKeys from "./PianoKeys"
import PianoGrid from "./PianoGrid"
import PianoLines from "./PianoLines"
import PianoRuler from "./PianoRuler"
import PianoNotes from "./PianoNotes"
import PianoSelection from "./PianoSelection"
import PianoVelocityControl from "./PianoVelocityControl"
import PitchGraph from "./PitchGraph"
import PianoCursor from "./PianoCursor"
import withTheme from "../hocs/withTheme"
import fitToContainer from "../hocs/fitToContainer"
import NoteController from "../helpers/NoteController"
import SelectionController from "../helpers/SelectionController"

import pianoNotesPresentation from "../presentations/pianoNotes"
import velocityControlPresentation from "../presentations/velocityControl"
import pitchGraphPresentation from "../presentations/pitchGraph"

import SelectionMouseHandler from "../NoteMouseHandler/SelectionMouseHandler"
import PencilMouseHandler from "../NoteMouseHandler/PencilMouseHandler"
import VelocityMouseHandler from "../NoteMouseHandler/VelocityMouseHandler"

import "./PianoRoll.css"

const SCROLL_KEY_SPEED = 4

const ControlToolbar = pure(({ onmount, buttons }) => {
  return <div className="control-toolbar" ref={onmount}>
    {buttons.map(({ label, selected, onClick }) =>
      <button className={selected ? "selected" : ""} onClick={onClick}>{label}</button>
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

    const changeCursor = cursor => {
      this.setState({ notesCursor: cursor})
    }

    const toggleTool = this.props.toggleMouseMode

    this.pencilMouseHandler = new PencilMouseHandler(changeCursor, toggleTool)
    this.selectionMouseHandler = new SelectionMouseHandler(changeCursor, toggleTool)
    this.controlMouseHandler = new VelocityMouseHandler(props.track)
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
    const noteItems = pianoNotesPresentation(events, transform, scrollLeft, width)
    const velocityControlItems = velocityControlPresentation(events, transform, scrollLeft, width, controlHeight)

    this.pencilMouseHandler.noteController = new NoteController(track, quantizer, transform, player)
    this.selectionMouseHandler.selectionController = new SelectionController(selection, track, quantizer, transform, player)

    const noteMouseHandler = mouseMode === 0 ?
      this.pencilMouseHandler : this.selectionMouseHandler

    const controlMouseHandler = this.controlMouseHandler

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
            items={noteItems}
            height={transform.pixelsPerKey * transform.numberOfKeys}
            width={width}
            cursor={notesCursor}
            onMouseDown={noteMouseHandler.onMouseDown}
            onMouseMove={noteMouseHandler.onMouseMove}
            onMouseUp={noteMouseHandler.onMouseUp}
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
              items={velocityControlItems}
              scrollLeft={scrollLeft}
              onMouseDown={controlMouseHandler.onMouseDown}
              onMouseMove={controlMouseHandler.onMouseMove}
              onMouseUp={controlMouseHandler.onMouseUp} />}
            {controlMode === "pitchBend" && <PitchGraph
              width={width}
              height={controlHeight}
              scrollLeft={scrollLeft}
              items={pitchGraphPresentation(events, transform, controlHeight)} />}
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

import React, { Component, PropTypes } from "react"
import SelectionModel from "../model/SelectionModel"
import NoteCoordTransform from "../model/NoteCoordTransform"
import PianoKeys from "./PianoKeys"
import PianoGrid from "./PianoGrid"
import PianoLines from "./PianoLines"
import PianoRuler from "./PianoRuler"
import PianoNotes from "./PianoNotes"
import PianoSelection from "./PianoSelection"
import PianoVelocityControl from "./PianoVelocityControl"
import PianoCursor from "./PianoCursor"
import withTheme from "../hocs/withTheme"
import fitToContainer from "../hocs/fitToContainer"
import NoteController from "../helpers/NoteController"
import SelectionController from "../helpers/SelectionController"

import pianoNotesPresentation from "../presentations/pianoNotes"
import velocityControlPresentation from "../presentations/velocityControl"

import SelectionMouseHandler from "../NoteMouseHandler/SelectionMouseHandler"
import PencilMouseHandler from "../NoteMouseHandler/PencilMouseHandler"
import VelocityMouseHandler from "../NoteMouseHandler/VelocityMouseHandler"

import "./PianoRoll.css"

class PianoRoll extends Component {
  constructor(props) {
    super(props)

    this.fitBetaSize = this.fitBetaSize.bind(this)
    this.alphaDidScroll = this.alphaDidScroll.bind(this)
    this.betaDidScroll = this.betaDidScroll.bind(this)

    this.state = {
      scrollLeft: 0,
      scrollTop: 0,
      controlHeight: 0,
      cursorPosition: 0,
      notesCursor: "auto",
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

  fitBetaSize() {
    this.setState({
      controlHeight: this.betaPseudoContent.clientHeight
    })
  }

  alphaDidScroll(e) {
    const { scrollTop } = e.target
    this.setState({ scrollTop })
  }

  betaDidScroll(e) {
    const { scrollLeft } = e.target
    this.alpha.scrollLeft = scrollLeft
    this.setState({ scrollLeft })
  }

  componentDidMount() {
    this.fitBetaSize()

    window.addEventListener("resize", this.fitBetaSize)
    this.alpha.addEventListener("scroll", this.alphaDidScroll)
    this.beta.addEventListener("scroll", this.betaDidScroll)

    const { player, autoScroll } = this.props
    player.on("change-position", tick => {
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
    })
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.fitBetaSize)
    this.alpha.removeEventListener("scroll", this.alphaDidScroll)
    this.beta.removeEventListener("scroll", this.betaDidScroll)
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
      controlHeight
    } = this.state

    const { keyWidth, rulerHeight } = theme
    const width = containerWidth

    const transform = this.getTransform()
    const widthTick = Math.max(endTick, transform.getTicks(width))

    const contentWidth = widthTick * transform.pixelsPerTick
    const contentHeight = transform.getMaxY()

    const fixedLeftStyle = {left: scrollLeft}
    const fixedTopStyle = {top: scrollTop}

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

    function FixedLeftContent({ children }) {
      return <div className="fixed-left" style={fixedLeftStyle}>
        {children}
      </div>
    }

    function FixedTopLeftContent({ children }) {
      return <div className="fixed-left-top" style={{...fixedLeftStyle, ...fixedTopStyle}}>
        {children}
      </div>
    }

    function PseudoHeightContent() {
      return <div className="pseudo-content" style={{
        height: contentHeight
      }} />
    }

    function PseudoWidthContent({ onmount }) {
      return <div className="pseudo-content" ref={onmount} style={{
        width: contentWidth,
        height: "100%"
      }} />
    }

    return <div
      className="PianoRoll"
      ref={c => this.container = c}>

      <div className="alpha" ref={c => this.alpha = c}>
        <PseudoHeightContent />
        <FixedLeftContent>
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
            width={keyWidth}
            keyHeight={transform.pixelsPerKey}
            numberOfKeys={transform.numberOfKeys}
            onClickKey={onClickKey} />
        </FixedLeftContent>
        <FixedTopLeftContent>
          <PianoRuler
            height={rulerHeight}
            endTick={widthTick}
            ticksPerBeat={ticksPerBeat}
            onMouseDown={e => onMouseDownRuler(e)}
            scrollLeft={scrollLeft}
            pixelsPerTick={transform.pixelsPerTick} />
          <div className="PianoRollLeftSpace" />
        </FixedTopLeftContent>
      </div>
      <div className="beta" ref={c => this.beta = c}>
        <PseudoWidthContent onmount={c => this.betaPseudoContent = c} />
        <FixedLeftContent>
          <PianoVelocityControl
            width={width}
            height={controlHeight}
            items={velocityControlItems}
            scrollLeft={scrollLeft}
            onMouseDown={controlMouseHandler.onMouseDown}
            onMouseMove={controlMouseHandler.onMouseMove}
            onMouseUp={controlMouseHandler.onMouseUp} />
        </FixedLeftContent>
      </div>
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

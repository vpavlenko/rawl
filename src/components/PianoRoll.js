import React, { Component, PropTypes } from "react"
import SelectionModel from "../model/SelectionModel"
import NoteCoordTransform from "../model/NoteCoordTransform"
import Quantizer from "../services/Quantizer"
import PianoKeys from "./PianoKeys"
import PianoGrid from "./PianoGrid"
import PianoLines from "./PianoLines"
import PianoRuler from "./PianoRuler"
import PianoNotes from "./PianoNotes"
import PianoSelection from "./PianoSelection"
import PianoVelocityControl from "./PianoVelocityControl"
import PianoCursor from "./PianoCursor"
import withTheme from "../hocs/withTheme"
import NoteController from "../helpers/NoteController"
import SelectionController from "../helpers/SelectionController"

import pianoNotesPresentation from "../presentations/pianoNotes"
import velocityControlPresentation from "../presentations/velocityControl"

import SelectionMouseHandler from "../NoteMouseHandler/SelectionMouseHandler"
import PencilMouseHandler from "../NoteMouseHandler/PencilMouseHandler"

import "./PianoRoll.css"

function filterEventsWithScroll(events, transform, scrollLeft, width) {
  const tickStart = transform.getTicks(scrollLeft)
  const tickEnd = transform.getTicks(scrollLeft + width)
  function test(tick) {
    return tick >= tickStart && tick <= tickEnd
  }
  return events.filter(e => test(e.tick) || test(e.tick + e.duration))
}

class PianoRoll extends Component {
  constructor(props) {
    super(props)

    this.state = {
      scrollLeft: 0,
      scrollTop: 0,
      cursorPosition: 0,
      width: 0,
      notesCursor: "auto",

      /* ノート配置部分のサイズ */
      contentWidth: 0,
      contentHeight: 0,
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
  }

  forceScrollLeft(requiredScrollLeft) {
    const maxScrollLeft = this.beta.scrollWidth - this.beta.clientWidth
    const scrollLeft = Math.floor(Math.min(maxScrollLeft, requiredScrollLeft))
    this.alpha.scrollLeft = scrollLeft
    this.beta.scrollLeft = scrollLeft
    this.setState({ scrollLeft })
  }

  fitWidthToParent() {
    this.setState({ width: this.container.clientWidth })
  }

  componentDidMount() {
    this.fitWidthToParent()

    window.addEventListener("resize", () => {
      this.fitWidthToParent()
    })

    this.alpha.addEventListener("scroll", e => {
      const { scrollTop } = e.target
      this.setState({ scrollTop })
    })
    this.beta.addEventListener("scroll", e => {
      const { scrollLeft } = e.target
      this.alpha.scrollLeft = scrollLeft
      this.setState({ scrollLeft })
    })

    const { player, autoScroll } = this.props
    player.on("change-position", tick => {
      const x = this.getTransform().getX(tick)
      this.setState({
        cursorPosition: x
      })

      // keep scroll position to cursor
      if (autoScroll && player.isPlaying) {
        const screenX = x - this.state.scrollLeft
        if (screenX > this.alpha.clientWidth * 0.7 || screenX < 0) {
          this.forceScrollLeft(x)
        }
      }
    })
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
      quantizer
    } = this.props

    const {
      width,
      scrollLeft,
      scrollTop,
      notesCursor,
      selection,
      cursorPosition
    } = this.state

    const { keyWidth, rulerHeight, controlHeight } = theme

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

    const events = filterEventsWithScroll(track.getEvents(), transform, scrollLeft, width)
    const noteItems = pianoNotesPresentation(events, transform)
    const velocityControlItems = velocityControlPresentation(events, transform)

    this.pencilMouseHandler.noteController = new NoteController(track, quantizer, transform, player)
    this.selectionMouseHandler.selectionController = new SelectionController(selection, track, quantizer, transform)
    const noteMouseHandler = mouseMode === 0 ?
      this.pencilMouseHandler : this.selectionMouseHandler

    return <div id="piano-roll-container" ref={c => this.container = c}>
      <div className="alpha" ref={c => this.alpha = c}>
        <div className="pseudo-content" style={{
          height: contentHeight
        }} />
        <div className="fixed-left" style={fixedLeftStyle}>
          <PianoLines
            width={width}
            pixelsPerKey={transform.pixelsPerKey}
            numberOfKeys={transform.numberOfKeys} />
          <PianoGrid
            endTick={widthTick}
            ticksPerBeat={ticksPerBeat}
            width={width}
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
        </div>
        <div className="fixed-left-top" style={{...fixedLeftStyle, ...fixedTopStyle}}>
          <PianoRuler
            height={rulerHeight}
            endTick={widthTick}
            ticksPerBeat={ticksPerBeat}
            onMouseDown={e => onMouseDownRuler(e)}
            scrollLeft={scrollLeft}
            transform={transform} />
          <div className="PianoRollLeftSpace" />
        </div>
      </div>
      <div className="beta" ref={c => this.beta = c}>
        <div className="pseudo-content" style={{
          width: contentWidth
        }} />
        <PianoVelocityControl
          items={velocityControlItems}
          height={controlHeight}
          endTick={widthTick}
          transform={transform}
          setEventBounds={() => true} />
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

export default withTheme(PianoRoll)

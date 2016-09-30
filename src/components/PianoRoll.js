import React, { Component } from "react"
import observable from "riot-observable"
import SelectionModel from "../model/SelectionModel"
import NoteCoordTransform from "../model/NoteCoordTransform"
import SharedService from "../services/SharedService"
import PianoKeys from "./PianoKeys"
import PianoGrid from "./PianoGrid"
import PianoRuler from "./PianoRuler"
import PianoNotes from "./PianoNotes"
import PianoSelection from "./PianoSelection"
import PianoVelocityControl from "./PianoVelocityControl"
import PianoCursor from "./PianoCursor"
import withTheme from "../hocs/withTheme"

function filterEventsWithScroll(events, transform, scrollLeft, width) {
  const tickStart = transform.getTicks(scrollLeft)
  const tickEnd = transform.getTicks(scrollLeft + width)
  return events.filter(e => e.tick >= tickStart && e.tick <= tickEnd)
}

function getMaxX(events) {
  return Math.max.apply(null,
    events
      .filter(e => e.subtype == "note")
      .map(n => n.tick + n.duration)
  )
}

class PianoRoll extends Component {
  constructor(props) {
    super(props)

    this.state = {
      scrollLeft: 0,
      scrollTop: 0,
      cursorPosition: 0,
      notesCursor: "auto",

      /* ノート配置部分のサイズ */
      contentWidth: 0,
      contentHeight: 0,
      selection: new SelectionModel()
    }

    this.state.selection.on("change", () => {
      this.setState({selection: this.state.selection})
    })

    this.mouseEmitter = observable()

    this.mouseEmitter.on("change-cursor", cursor => {
      this.setState({
        notesCursor: cursor
      })
    })
  }

  forceScrollLeft(scrollLeft) {
    this.alpha.scrollLeft = scrollLeft
    this.beta.scrollLeft = scrollLeft
    this.setState({ scrollLeft })
  }

  componentDidMount() {
    this.alpha.addEventListener("scroll", e => {
      const { scrollTop } = e.target
      this.setState({ scrollTop })
    })
    this.beta.addEventListener("scroll", e => {
      const { scrollLeft } = e.target
      this.alpha.scrollLeft = scrollLeft
      this.setState({ scrollLeft })
    })

    const player = SharedService.player
    player.on("change-position", tick => {
      const x = this.getTransform().getX(tick)
      this.setState({
        cursorPosition: x
      })

      // keep scroll position to cursor
      if (this.props.autoScroll && player.isPlaying) {
        const screenX = x - this.state.scrollLeft
        if (screenX > this.alpha.clientWidth * 0.7 || screenX < 0) {
          this.forceScrollLeft(x)
        }
      }
    })
  }

  getTransform() {
    const theme = this.props.theme
    const keyHeight = theme.keyHeight
    const pixelsPerTick = 0.1 * this.props.scaleX
    return new NoteCoordTransform(
      pixelsPerTick,
      keyHeight,
      127)
  }

  render() {
    const theme = this.props.theme
    const props = this.props

    const endTick = Math.max(getMaxX(props.track.getEvents()), 5000)

    const transform = this.getTransform()
    const ticksPerBeat = 480
    const contentWidth = endTick * transform.getPixelsPerTick()
    const contentHeight = transform.getMaxY()

    const events = filterEventsWithScroll(props.track.getEvents(), transform, this.state.scrollLeft, 300)

    const fixedLeftStyle = {left: this.state.scrollLeft}
    const fixedTopStyle = {top: this.state.scrollTop}

    const quantizer = SharedService.quantizer

    const { keyWidth, rulerHeight, controlHeight } = theme

    const selection = this.state.selection

    return <div id="piano-roll-container">
      <div className="alpha" ref={c => this.alpha = c}>
        <div className="PianoGridWrapper">
          <PianoGrid
            endTick={endTick}
            ticksPerBeat={ticksPerBeat}
            transform={transform} />
        </div>
        <div className="PianoNotesWrapper">
          <PianoNotes
            events={events}
            transform={transform}
            endTick={endTick}
            emitter={this.mouseEmitter}
            quantizer={quantizer}
            selection={selection}
            track={props.track}
            style={{cursor: this.state.notesCursor}} />
        </div>
        <div className="PianoSelectionWrapper">
          <PianoSelection
            width={contentWidth}
            height={contentHeight}
            transform={transform}
            selection={selection} />
        </div>
        <div className="PianoCursorWrapper">
          <PianoCursor
            width={contentWidth}
            height={contentHeight}
            position={this.state.cursorPosition} />
        </div>
        <div className="PianoKeysWrapper" style={fixedLeftStyle}>
          <PianoKeys
            width={keyWidth}
            keyHeight={transform.getPixelsPerKey()}
            numberOfKeys={transform.getMaxNoteNumber()} />
        </div>
        <div className="PianoRulerWrapper" style={fixedTopStyle}>
          <PianoRuler
            height={rulerHeight}
            endTick={endTick}
            pixelsPerTick={transform.getPixelsPerTick()}
            ticksPerBeat={ticksPerBeat} />
        </div>
        <div className="PianoRollLeftSpace" />
      </div>
      <div className="beta" ref={c => this.beta = c}>
        <PianoVelocityControl
          events={events}
          height={controlHeight}
          endTick={endTick}
          transform={transform}
          setEventBounds={() => true} />
      </div>
    </div>
  }
}

export default withTheme(PianoRoll)

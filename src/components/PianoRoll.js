import React, { Component } from "react"
import NoteCoordTransform from "../model/note-coord-transform"
import PianoKeys from "./piano-keys"
import PianoRuler from "./piano-ruler"
import PianoVelocityControl from "./piano-velocity-control"
import PianoGrid from "./piano-grid"
import PianoNotes from "./piano-notes"
import PianoSelection from "./piano-selection"
import Theme from "../theme"
import SharedService from "../shared-service"
import observable from "riot-observable"
import SelectionModel from "../model/selection-model"

function filterEventsWithScroll(events, transform, scrollLeft, width) {
  const tickStart = transform.getTicks(scrollLeft)
  const tickEnd = transform.getTicks(scrollLeft + width)
  return events.filter(e => e.tick >= tickStart && e.tick <= tickEnd)
}

/**

FIXME

mouseEmitter.on("change-cursor", cursor => {
  const style = this.canvas.parentNode.style
  if (style.cursor != cursor) {
    style.cursor = cursor
  }
})

    this.player.on("change-position", tick => {
      const x = this._transform.getX(tick)
      this.stage.update()

      // keep scroll position to cursor
      if (this.autoScroll && this.player.isPlaying) {
        const screenX = x + this.scrollContainer.scrollX
        if (screenX > this.canvas.width * 0.7 || screenX < 0) {
          this.scrollContainer.scrollX = -x
        }
      }
    })
    */

function getMaxX(events) {
  return Math.max.apply(null,
    events
      .filter(e => e.subtype == "note")
      .map(n => n.tick + n.duration)
  )
}

export default class PianoRoll extends Component {
  constructor(props) {
    super(props)

    this.state = {
      scrollLeft: 0,
      scrollTop: 0,

      /* ノート配置部分のサイズ */
      contentWidth: 0,
      contentHeight: 0,
      selection: new SelectionModel()
    }

    this.state.selection.on("change", () => {
      this.setState({selection: this.state.selection})
    })
  }

  componentDidMount() {
    this.alpha.addEventListener("scroll", e => {
      this.setState({
        scrollTop: e.target.scrollTop
      })
    })
    this.beta.addEventListener("scroll", e => {
      const { scrollLeft } = e.target
      this.alpha.scrollLeft = scrollLeft
      this.setState({
        scrollLeft: scrollLeft
      })
    })
  }

  render() {
    const props = this.props
    const endTick = Math.max(getMaxX(props.track.getEvents()), 5000)
    const numberOfKeys = 128
    const pixelsPerTick = 0.1 * props.scaleX
    const ticksPerBeat = 480
    const contentWidth = endTick * pixelsPerTick
    const keyWidth = Theme.keyWidth
    const keyHeight = Theme.keyHeight
    const rulerHeight = Theme.rulerHeight
    const controlHeight = Theme.controlHeight
    const contentHeight = keyHeight * numberOfKeys
    const noteScale = {x: 1, y: 1}
    const transform = new NoteCoordTransform(
      pixelsPerTick,
      keyHeight,
      numberOfKeys)
    const events = filterEventsWithScroll(props.track.getEvents(), transform, this.state.scrollLeft, 300)
    const fixedLeftStyle = {left: this.state.scrollLeft}
    const fixedTopStyle = {top: this.state.scrollTop}
    const quantizer = SharedService.quantizer

    const mouseEmitter = observable()
    const selection = this.state.selection

    return <div id="piano-roll-container">
      <div className="alpha" ref={c => this.alpha = c}>
        <div className="PianoGridWrapper">
          <PianoGrid
            endTick={endTick}
            pixelsPerTick={pixelsPerTick}
            ticksPerBeat={ticksPerBeat}
            keyHeight={keyHeight}
            numberOfKeys={numberOfKeys} />
        </div>
        <div className="PianoNotesWrapper">
          <PianoNotes
            events={events}
            transform={transform}
            endTick={endTick}
            emitter={mouseEmitter}
            quantizer={quantizer}
            selection={selection}
            track={props.track} />
        </div>
        <div className="PianoSelectionWrapper">
          <PianoSelection
            width={contentWidth}
            height={contentHeight}
            transform={transform}
            selection={selection} />
        </div>
        <div className="PianoKeysWrapper" style={fixedLeftStyle}>
          <PianoKeys
            width={keyWidth}
            keyHeight={keyHeight}
            numberOfKeys={numberOfKeys} />
        </div>
        <div className="PianoRulerWrapper" style={fixedTopStyle}>
          <PianoRuler
            height={rulerHeight}
            endTick={endTick}
            pixelsPerTick={pixelsPerTick}
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
          setEventBounds={(id, bounds) => true} />
      </div>
    </div>
  }
}

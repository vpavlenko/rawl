import React, { Component } from "react"
import PianoRollController from "../controller/piano-roll-controller"

function applyPropsToController(pianoRoll, props) {
  if (!pianoRoll) {
    return
  }
  pianoRoll.autoScroll = props.autoScroll
  pianoRoll.noteScale = {
    x: props.scaleX,
    y: props.scaleY
  }
  pianoRoll.mouseMode = props.mouseMode
  pianoRoll.emitter = props.emitter
  pianoRoll.track = props.track
}

export default class PianoRoll extends Component {
  componentDidMount() {
    this.pianoRoll = new PianoRollController(this.canvas)
    applyPropsToController(this.pianoRoll, this.props)
  }

  componentWillReceiveProps(props) {
    applyPropsToController(this.pianoRoll, props)
  }

  render() {
    return <div id="piano-roll-container">
      <canvas id="piano-roll" ref={c => this.canvas = c} onContextMenu={e => e.preventDefault()}></canvas>
    </div>
  }
}

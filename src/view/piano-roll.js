import React, { Component } from "react"
import PianoRollController from "../controller/piano-roll-controller"

export default class PianoRoll extends Component {
  componentDidMount() {
    this.pianoRoll = new PianoRollController(this.canvas)     
  }

  componentWillReceiveProps(props) {
    const pianoRoll = this.pianoRoll
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

  render() {
    return <div id="piano-roll-container">
      <canvas id="piano-roll" ref={c => this.canvas = c} onContextMenu={e => e.preventDefault()}></canvas>
    </div>
  }
}

import React, { Component } from "react"
import _ from "lodash"

export default class DrawCanvas extends Component {
  componentDidMount() {
    this.ctx = this.canvas.getContext("2d")
    this.drawCanvas()
  }

  componentDidUpdate() {
    this.drawCanvas()
  }

  drawCanvas() {
    if (this.props.draw) {
      this.props.draw(this.ctx)
    }
  }

  render() {
    return <canvas ref={c => this.canvas = c} {..._.omit(this.props, "draw")} />
  }
}

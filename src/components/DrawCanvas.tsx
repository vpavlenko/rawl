import React, { Component, CanvasHTMLAttributes } from "react"
import _ from "lodash"

export interface DrawCanvasProps extends CanvasHTMLAttributes<HTMLCanvasElement> {
  draw: (CanvasRenderingContext2D) => void
}

export default class DrawCanvas extends Component<DrawCanvasProps> {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  
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

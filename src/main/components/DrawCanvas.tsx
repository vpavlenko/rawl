import React, { Component, CanvasHTMLAttributes } from "react"
import _ from "lodash"

export interface DrawCanvasProps
  extends CanvasHTMLAttributes<HTMLCanvasElement> {
  draw: (ctx: CanvasRenderingContext2D) => void
}

export default class DrawCanvas extends Component<DrawCanvasProps> {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  componentDidMount() {
    const ctx = this.canvas.getContext("2d")
    if (ctx === null) {
      throw new Error("failed to getContext 2d")
    }
    this.ctx = ctx
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
    return (
      <canvas
        ref={c => c && (this.canvas = c)}
        {..._.omit(this.props, "draw")}
      />
    )
  }
}

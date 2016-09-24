import React, { Component } from "react"
import DrawCanvas from "./draw-canvas"

export default class SizeFitCanvas extends Component {
  constructor(props) {
    super(props)
    this.state = {
      containerWidth: 0,
      containerHeight: 0
    }
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize)
    this.handleResize()
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize)
  }

  handleResize() {
    this.setState({
      containerWidth: this.container.offsetWidth,
      containerHeight: this.container.offsetHeight
    })
  }

  render() {
    return <DrawCanvas
      ref={c => this.container = c && c.canvas}
      width={this.state.containerWidth}
      height={this.state.containerHeight}
      {...this.props}
     />
  }
}

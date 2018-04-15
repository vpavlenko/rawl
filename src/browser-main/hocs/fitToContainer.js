import React, { Component } from "react"
import ResizeObserver from "resize-observer-polyfill"

export default style => WrappedComponent => class extends Component {
  constructor(props) {
    super(props)

    this.state = {
      containerWidth: 0,
      containerHeight: 0
    }

    this.updateContainerSize = this.updateContainerSize.bind(this)
  }

  componentDidMount() {
    this.updateContainerSize()
    window.addEventListener("resize", this.updateContainerSize)

    this.ro = new ResizeObserver(() => {
      this.updateContainerSize()
    })
    this.ro.observe(this.container)
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateContainerSize)
    this.ro.disconnect()
  }

  updateContainerSize() {
    this.setState({
      containerWidth: this.container.clientWidth,
      containerHeight: this.container.clientHeight
    })
  }

  render() {
    return <div ref={c => { if (c) this.container = c }} style={style}>
      <WrappedComponent {...this.props} {...this.state} />
    </div>
  }
}

import React, { Component } from "react"

export default function fitToContainer(WrappedComponent, style) {
  return class extends Component {
    constructor(props) {
      super(props)
    }

    componentDidMount() {
      this.updateContainerSize()

      window.addEventListener("resize", () => {
        this.updateContainerSize()
      })
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
}

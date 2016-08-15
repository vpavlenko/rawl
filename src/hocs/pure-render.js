import React, { Component } from "react"
import shallowCompare from "react-addons-shallow-compare"

export default function pureRender(WrappedComponent) {
  return class extends Component {
    shouldComponentUpdate(nextProps, nextState) {
      return shallowCompare(this, nextProps, nextState)
    }

    render() {
      return <WrappedComponent {...this.props} />
    }
  }
}

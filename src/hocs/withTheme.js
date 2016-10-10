import React, { Component } from "react"
import Theme from "../model/Theme"

export default function withTheme(WrappedComponent) {
  return class extends Component {
    render() {
      return <WrappedComponent {...this.props} theme={Theme.load()} />
    }
  }
}

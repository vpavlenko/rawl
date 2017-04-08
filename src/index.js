import React from "react"
import ReactDOM from "react-dom"
import RootView from "./components/RootView"
import App from "./App"

import "./index.css"

window.onload = () => {
  const app = new App()
  document.app = app // for debug
  ReactDOM.render(<RootView app={app} />, document.querySelector("#root"))
}

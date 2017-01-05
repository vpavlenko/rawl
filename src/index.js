import React from "react"
import ReactDOM from "react-dom"
import Root from "./Root"
import App from "./App"

import "./index.css"

window.onload = () => {
  const app = new App()
  document.app = app // for debug
  ReactDOM.render(<Root app={app} />, document.querySelector("#root"))
}

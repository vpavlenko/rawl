import React from "react"
import ReactDOM from "react-dom"
import Root from "./Root"

window.onload = () => {
  ReactDOM.render(<Root />, document.querySelector("#root"))
}

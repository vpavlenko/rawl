import React from "react"
import ReactDOM from "react-dom"
import App from "./app"

window.onload = () => {
  ReactDOM.render(<App />, document.querySelector("#root"))
}

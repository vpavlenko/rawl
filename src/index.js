import React from "react"
import ReactDOM from "react-dom"

import App from "./App"
import SynthApp from "./synth"

switch (document.location.hash) {
  case "": {
    ReactDOM.render(<App />, document.querySelector("#root"))
    break
  }
  case "#synth": {
    const app = new SynthApp()
    app.init()
    break
  }
  default: break
}

import React from "react"
import ReactDOM from "react-dom"

import App from "containers/App/App.js"
import SynthApp from "./synth.js"

function renderApp() {
  ReactDOM.render(<App />, document.querySelector("#root"))
}

switch (document.location.hash) {
  case "": {
    renderApp()
    if (module.hot) {
      module.hot.accept("containers/App/App", () => {
        renderApp()
      })
    }
    break
  }
  case "#synth": {
    const app = new SynthApp()
    app.init()
    break
  }
  default: break
}

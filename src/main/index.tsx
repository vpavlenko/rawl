import React from "react"
import ReactDOM from "react-dom"

import App from "main/components/App/App"

function renderApp() {
  ReactDOM.render(<App />, document.querySelector("#root"))
}

window.onbeforeunload = (e: BeforeUnloadEvent) => {
  e.returnValue =
    "Your edits have not been saved. Be sure to download it before exiting. Do you really want to close it?"
}

renderApp()

if (module.hot) {
  module.hot.accept("components/App/App", () => {
    renderApp()
  })
}

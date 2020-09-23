import React from "react"
import ReactDOM from "react-dom"

import App from "main/components/App/App"

function renderApp() {
  ReactDOM.render(<App />, document.querySelector("#root"))
}

renderApp()

if (module.hot) {
  module.hot.accept("components/App/App", () => {
    renderApp()
  })
}

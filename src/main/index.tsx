import React from "react"
import ReactDOM from "react-dom"

import { App } from "main/components/App/App"
import { localized } from "../common/localize/localizedString"

function renderApp() {
  ReactDOM.render(<App />, document.querySelector("#root"))
}

window.onbeforeunload = (e: BeforeUnloadEvent) => {
  e.returnValue = localized(
    "confirm-close",
    "Your edits have not been saved. Be sure to download it before exiting. Do you really want to close it?"
  )
}

renderApp()

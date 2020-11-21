import { configure } from "mobx"
import React from "react"
import ReactDOM from "react-dom"
import { localized } from "../common/localize/localizedString"
import { App } from "./components/App/App"

configure({
  enforceActions: "never",
})

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

import { configure } from "mobx"
import { createRoot } from "react-dom/client"
import { localized } from "../common/localize/localizedString"
import { App } from "./components/App/App"

configure({
  enforceActions: "never",
})

window.onbeforeunload = (e: BeforeUnloadEvent) => {
  e.returnValue = localized(
    "confirm-close",
    "Your edits have not been saved. Be sure to download it before exiting. Do you really want to close it?"
  )
}

const root = createRoot(document.querySelector("#root")!)
root.render(<App />)

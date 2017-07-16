import React from "react"
import ReactDOM from "react-dom"
import RootView from "./components/RootView"
import App from "./App"
import withSong from "./hocs/withSong"

import "./index.css"

window.onload = () => {
  const app = new App()
  document.app = app // for debug

  const RootView2 = withSong(app, RootView)

  ReactDOM.render(<RootView2
    app={app}
  />, document.querySelector("#root"))
}

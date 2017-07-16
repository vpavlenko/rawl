import React from "react"
import ReactDOM from "react-dom"
import RootView from "./components/RootView"
import App from "./App"
import withSong from "./hocs/withSong"
import Song from "./model/Song"

import "./index.css"

window.onload = () => {
  const app = new App()
  document.app = app // for debug

  const RootView2 = withSong(app, RootView)

  ReactDOM.render(<RootView2
    openFile={f => app.open(f)}
    saveFile={() => app.save()}
    createNewSong={() => app.song = Song.emptySong()}
    song={app.song}
    player={app.player}
    quantizer={app.quantizer}
  />, document.querySelector("#root"))
}

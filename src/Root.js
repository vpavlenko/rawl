import React, { Component } from "react"
import RootView from "./components/RootView"

export default class Root extends Component {
  constructor(props) {
    super(props)

    this.initKeyboardShortcut()

    this.state = {
      song: props.app.song
    }

    props.app.on("change-song", song => {
      this.setSong(song)
    })
  }

  initKeyboardShortcut() {
    document.onkeydown = e => {
      if (e.target != document.body) {
        return
      }
      switch(e.keyCode) {
        case 32: {
          const { player } = this.props.app
          if (player.isPlaying) {
            player.stop()
          } else {
            player.play()
          }
          e.preventDefault()
          break
        }
      }
    }
  }

  setSong(song) {
    if (!song || song === this.state.song) {
      return
    }

    this.setState({ song })

    song.on("change", () => {
      this.setState({ song })
    })
  }

  render() {
    const { app } = this.props

    return <RootView
      onChangeFile={file => app.open(file)}
      onSaveFile={() => app.save()}
      song={this.state.song}
    />
  }
}

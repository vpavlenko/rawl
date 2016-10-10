import React, { Component } from "react"
import RootView from "./components/RootView"

function withSong(WrappedComponent) {
  return class extends Component {
    constructor(props) {
      super(props)

      this.state = {
        song: props.app.song
      }

      props.app.on("change-song", song => {
        this.setSong(song)
      })
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
      return <WrappedComponent {...props} song={this.state.song} />
    }
  }
}

class Root extends Component {
  componentDidMount() {
    this.initKeyboardShortcut()
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

  render() {
    const { app } = this.props

    return <RootView
      onChangeFile={file => app.open(file)}
      onSaveFile={() => app.save()}
      song={this.props.song}
    />
  }
}

export default withSong(Root)

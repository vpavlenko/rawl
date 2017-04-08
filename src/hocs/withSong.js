import React, { Component } from "react"

export default function withSong(app, WrappedComponent) {
  return class extends Component {
    constructor(props) {
      super(props)

      const { song } = app
      this.state = { song }
      song.on("change", () => {
        this.setState({ song })
      })
      app.on("change-song", song => {
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
      return <WrappedComponent {...this.props} song={this.state.song} />
    }
  }
}

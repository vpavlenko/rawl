import React, { Component } from "react"

export default function withSong(app, WrappedComponent) {
  return class extends Component {
    constructor(props) {
      super(props)

      const { song, pianoSelection } = app
      this.state = { song, pianoSelection }
      song.on("change", () => {
        this.setState({ song })
      })
      app.on("change-song", song => {
        this.setSong(song)
      })
      app.on("change-piano-selection", pianoSelection => {
        this.setState({ pianoSelection })
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
      return <WrappedComponent {...this.props} {...this.state} />
    }
  }
}

import React, { Component } from "react"

export default function withSong(WrappedComponent) {
  return class extends Component {
    constructor(props) {
      super(props)

      const { song } = props.app
      this.state = { song }
      props.app.song.on("change", () => {
        this.setState({ song })
      })
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
      return <WrappedComponent {...this.props} song={this.state.song} />
    }
  }
}

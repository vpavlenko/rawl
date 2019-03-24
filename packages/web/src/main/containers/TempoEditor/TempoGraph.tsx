import Player from "common/player/Player"
import { TempoCoordTransform } from "common/transform"
import { TempoGraph, TempoGraphProps } from "components/TempoGraph/TempoGraph"
import { CHANGE_TEMPO, CREATE_TEMPO, SET_PLAYER_POSITION } from "main/actions"
import { inject, observer } from "mobx-react"
import React, { Component } from "react"
import { withSize } from "react-sizeme"
import { compose } from "recompose"
import RootStore from "stores/RootStore"

type Props = Pick<
  TempoGraphProps,
  | "beats"
  | "track"
  | "theme"
  | "events"
  | "setPlayerPosition"
  | "endTick"
  | "changeTempo"
  | "createTempo"
  | "size"
  | "setScrollLeft"
  | "pixelsPerTick"
> & {
  player: Player
  autoScroll: boolean
}

interface State {
  playerPosition: number
  scrollLeft: number
}

function stateful(WrappedComponent: React.StatelessComponent<TempoGraphProps>) {
  return class extends Component<Props, State> {
    constructor(props: Props) {
      super(props)

      this.state = {
        playerPosition: props.player.position,
        scrollLeft: 0
      }
    }

    componentDidMount() {
      this.props.player.on("change-position", this.updatePosition)
    }

    componentWillUnmount() {
      this.props.player.off("change-position", this.updatePosition)
    }

    updatePosition = (tick: number) => {
      this.setState({
        playerPosition: tick
      })

      const { autoScroll, pixelsPerTick, size } = this.props

      // keep scroll position to cursor
      if (autoScroll) {
        const transform = new TempoCoordTransform(pixelsPerTick, size.height)
        const x = transform.getX(tick)
        const screenX = x - this.state.scrollLeft
        if (screenX > size.width * 0.7 || screenX < 0) {
          this.props.setScrollLeft(x)
        }
      }
    }

    render() {
      return <WrappedComponent {...this.state} {...this.props} />
    }
  }
}

export default compose(
  withSize({ monitorHeight: true }),
  inject(
    ({
      rootStore: {
        rootViewStore: { theme },
        tempoEditorStore: s,
        services: { player },
        song,
        dispatch
      }
    }: {
      rootStore: RootStore
    }) => ({
      theme,
      player,
      pixelsPerTick: 0.1 * s.scaleX,
      track: song.conductorTrack,
      events: (song.conductorTrack.events as any).toJS(),
      endTick: song.endOfSong,
      beats: song.measureList.beats,
      autoScroll: s.autoScroll,
      scrollLeft: s.scrollLeft,
      setScrollLeft: (v: number) => (s.scrollLeft = v),
      changeTempo: (id: number, microsecondsPerBeat: number) =>
        dispatch(CHANGE_TEMPO, id, microsecondsPerBeat),
      createTempo: (tick: number, microsecondsPerBeat: number) =>
        dispatch(CREATE_TEMPO, tick, microsecondsPerBeat),
      setPlayerTempo: (tick: number) => dispatch(SET_PLAYER_POSITION, tick)
    })
  ),
  observer,
  stateful
)(TempoGraph)

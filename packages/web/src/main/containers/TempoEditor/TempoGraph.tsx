import { TempoCoordTransform } from "common/transform"
import { TempoGraph, TempoGraphProps } from "components/TempoGraph/TempoGraph"
import { CHANGE_TEMPO, CREATE_TEMPO, SET_PLAYER_POSITION } from "main/actions"
import { inject, observer } from "mobx-react"
import React, { SFC, useState, useEffect } from "react"
import { withSize } from "react-sizeme"
import { compose, Omit } from "recompose"
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
  isPlaying: boolean
  autoScroll: boolean
  playerPosition: number
}

const Wrapper: SFC<Props> = props => {
  const { autoScroll, pixelsPerTick, size, playerPosition, isPlaying } = props
  const [scrollLeft, setScrollLeft] = useState(0)

  useEffect(() => {
    // keep scroll position to cursor
    if (autoScroll && isPlaying) {
      const transform = new TempoCoordTransform(pixelsPerTick, size.height)
      const x = transform.getX(playerPosition)
      const screenX = x - scrollLeft
      if (screenX > size.width * 0.7 || screenX < 0) {
        setScrollLeft(x)
      }
    }
  }, [
    autoScroll,
    isPlaying,
    scrollLeft,
    size.width,
    pixelsPerTick,
    playerPosition
  ])

  return (
    <TempoGraph
      {...props}
      scrollLeft={scrollLeft}
      setScrollLeft={setScrollLeft}
    />
  )
}

export default compose(
  inject(
    ({
      rootStore: {
        rootViewStore: { theme },
        playerStore,
        tempoEditorStore: s,
        services: { player },
        song,
        dispatch
      }
    }: {
      rootStore: RootStore
    }) =>
      ({
        theme,
        isPlaying: player.isPlaying,
        pixelsPerTick: 0.1 * s.scaleX,
        track: song.conductorTrack,
        events: (song.conductorTrack.events as any).toJS(),
        endTick: song.endOfSong,
        beats: song.measureList.beats,
        autoScroll: s.autoScroll,
        scrollLeft: s.scrollLeft,
        setScrollLeft: v => (s.scrollLeft = v),
        changeTempo: (id, microsecondsPerBeat) =>
          dispatch(CHANGE_TEMPO, id, microsecondsPerBeat),
        createTempo: (tick, microsecondsPerBeat) =>
          dispatch(CREATE_TEMPO, tick, microsecondsPerBeat),
        playerPosition: playerStore.position,
        setPlayerPosition: tick => dispatch(SET_PLAYER_POSITION, tick)
      } as Omit<Props, "size">)
  ),
  observer,
  withSize({ monitorHeight: true })
)(Wrapper)

import { TempoCoordTransform } from "common/transform"
import { TempoGraph, TempoGraphProps } from "components/TempoGraph/TempoGraph"
import { setPlayerPosition, changeTempo, createTempo } from "main/actions"
import { inject, observer } from "mobx-react"
import React, { SFC, useState, useEffect } from "react"
import { withSize } from "react-sizeme"
import { compose } from "recompose"
import RootStore from "stores/RootStore"
import { toJS } from "mobx"

type Props = Pick<
  TempoGraphProps,
  | "measures"
  | "timebase"
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

const Wrapper: SFC<Props> = (props) => {
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
    playerPosition,
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
        dispatch2,
      },
    }: {
      rootStore: RootStore
    }) =>
      ({
        theme,
        isPlaying: player.isPlaying,
        pixelsPerTick: 0.1 * s.scaleX,
        events:
          song.conductorTrack !== undefined
            ? toJS(song.conductorTrack.events)
            : [],
        endTick: song.endOfSong,
        measures: song.measures,
        timebase: player.timebase,
        autoScroll: s.autoScroll,
        scrollLeft: s.scrollLeft,
        setScrollLeft: (v) => (s.scrollLeft = v),
        changeTempo: (id, microsecondsPerBeat) =>
          dispatch2(changeTempo(id, microsecondsPerBeat)),
        createTempo: (tick, microsecondsPerBeat) =>
          dispatch2(createTempo(tick, microsecondsPerBeat)),
        playerPosition: playerStore.position,
        setPlayerPosition: (tick) => dispatch2(setPlayerPosition(tick)),
      } as Omit<Props, "size">)
  ),
  observer,
  withSize({ monitorHeight: true })
)(Wrapper)

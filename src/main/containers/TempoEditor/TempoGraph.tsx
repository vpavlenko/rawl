import React, { SFC, useState, useEffect } from "react"
import { TempoCoordTransform } from "common/transform"
import { TempoGraph } from "components/TempoGraph/TempoGraph"
import { setPlayerPosition, changeTempo, createTempo } from "main/actions"
import { useObserver } from "mobx-react"
import { withSize } from "react-sizeme"
import { toJS } from "mobx"
import { useTheme } from "main/hooks/useTheme"
import { useStores } from "src/main/hooks/useStores"
import { ISize } from "pixi.js"

interface TempoGraphWrapperProps {
  size: ISize
}

const TempoGraphWrapper: SFC<TempoGraphWrapperProps> = (props) => {
  const { rootStore } = useStores()

  const {
    isPlaying,
    pixelsPerTick,
    events,
    endTick,
    measures,
    timebase,
    autoScroll,
    playerPosition,
  } = useObserver(() => ({
    isPlaying: rootStore.services.player.isPlaying,
    pixelsPerTick: 0.1 * rootStore.tempoEditorStore.scaleX,
    events:
      rootStore.song.conductorTrack !== undefined
        ? toJS(rootStore.song.conductorTrack.events)
        : [],
    endTick: rootStore.song.endOfSong,
    measures: rootStore.song.measures,
    timebase: rootStore.services.player.timebase,
    autoScroll: rootStore.tempoEditorStore.autoScroll,
    scrollLeft: rootStore.tempoEditorStore.scrollLeft,
    playerPosition: rootStore.playerStore.position,
  }))

  const { size } = props
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

  const theme = useTheme()

  return (
    <TempoGraph
      size={size}
      pixelsPerTick={pixelsPerTick}
      events={events}
      endTick={endTick}
      measures={measures}
      timebase={timebase}
      playerPosition={playerPosition}
      changeTempo={(id, microsecondsPerBeat) =>
        changeTempo(rootStore)(id, microsecondsPerBeat)
      }
      setScrollLeft={(v) => (rootStore.tempoEditorStore.scrollLeft = v)}
      createTempo={(tick, microsecondsPerBeat) =>
        createTempo(rootStore)(tick, microsecondsPerBeat)
      }
      setPlayerPosition={(tick) => setPlayerPosition(rootStore)(tick)}
      theme={theme}
      scrollLeft={scrollLeft}
    />
  )
}

export default withSize({ monitorHeight: true })(TempoGraphWrapper)

import useComponentSize from "@rehooks/component-size"
import { toJS } from "mobx"
import { useObserver } from "mobx-react-lite"
import React, { FC, useEffect, useRef, useState } from "react"
import { NoteCoordTransform } from "../../../common/transform"
import {
  arrangeEndSelection,
  arrangeMoveSelection,
  arrangeResizeSelection,
  arrangeStartSelection,
  setPlayerPosition,
} from "../../actions"
import { Layout } from "../../Constants"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import { ArrangeView } from "../ArrangeView/ArrangeView"

const ArrangeViewWrapper: FC = () => {
  const rootStore = useStores()

  const {
    autoScroll,
    playerPosition,
    pixelsPerTick,
    isPlaying,
    tracks,
    measures,
    timebase,
    endTick,
    selection,
  } = useObserver(() => ({
    autoScroll: rootStore.arrangeViewStore.autoScroll,
    playerPosition: rootStore.services.player.position,
    pixelsPerTick: Layout.pixelsPerTick * rootStore.arrangeViewStore.scaleX,
    isPlaying: rootStore.services.player.isPlaying,
    tracks: toJS(rootStore.song.tracks),
    measures: rootStore.song.measures,
    timebase: rootStore.services.player.timebase,
    endTick: rootStore.song.endOfSong,
    selection: rootStore.arrangeViewStore.selection,
  }))
  const { arrangeViewStore: s } = rootStore

  const ref = useRef(null)
  const size = useComponentSize(ref)

  const keyHeight = 0.3

  const [scrollLeft, setScrollLeft] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)

  const transform = new NoteCoordTransform(pixelsPerTick, keyHeight, 127)

  useEffect(() => {
    // keep scroll position to cursor
    if (autoScroll && isPlaying) {
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
    playerPosition,
    pixelsPerTick,
    size.width,
  ])

  const theme = useTheme()

  return (
    <ArrangeView
      tracks={tracks}
      measures={measures}
      timebase={timebase}
      endTick={endTick}
      size={size}
      theme={theme}
      scrollLeft={scrollLeft}
      scrollTop={scrollTop}
      transform={transform}
      playerPosition={playerPosition}
      selection={selection}
      autoScroll={autoScroll}
      onScrollLeft={(scroll: number) => setScrollLeft(scroll)}
      onScrollTop={(scroll: number) => setScrollTop(scroll)}
      onClickScaleUp={() => (s.scaleX = s.scaleX + 0.1)}
      onClickScaleDown={() => (s.scaleX = Math.max(0.05, s.scaleX - 0.1))}
      onClickScaleReset={() => (s.scaleX = 1)}
      setPlayerPosition={(tick) => setPlayerPosition(rootStore)(tick)}
      startSelection={(pos) => arrangeStartSelection(rootStore)(pos)}
      endSelection={(start, end) => arrangeEndSelection(rootStore)(start, end)}
      resizeSelection={(start, end) =>
        arrangeResizeSelection(rootStore)(start, end)
      }
      moveSelection={(pos) => arrangeMoveSelection(rootStore)(pos)}
    />
  )
}

export default ArrangeViewWrapper

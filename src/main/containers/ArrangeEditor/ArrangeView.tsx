import React, { SFC, useState, useEffect } from "react"
import { ISize } from "common/geometry"
import { NoteCoordTransform } from "common/transform"
import {
  arrangeStartSelection,
  arrangeEndSelection,
  arrangeResizeSelection,
  arrangeMoveSelection,
  arrangeOpenContextMenu,
} from "actions"
import { withSize } from "react-sizeme"
import { useObserver } from "mobx-react"
import { ArrangeView } from "components/ArrangeView/ArrangeView"
import { toJS } from "mobx"
import { setPlayerPosition } from "main/actions"
import { useTheme } from "main/hooks/useTheme"
import { useStores } from "src/main/hooks/useStores"

interface ArrangeViewWrapperProps {
  size: ISize
}

const ArrangeViewWrapper: SFC<ArrangeViewWrapperProps> = ({ size }) => {
  const { rootStore } = useStores()

  const {
    autoScroll,
    playerPosition,
    pixelsPerTick,
    isPlaying,
    tracks,
    measures,
    timebase,
    endTick,
    loop,
    selection,
  } = useObserver(() => ({
    autoScroll: rootStore.arrangeViewStore.autoScroll,
    playerPosition: rootStore.playerStore.position,
    pixelsPerTick: 0.1 * rootStore.arrangeViewStore.scaleX,
    isPlaying: rootStore.services.player.isPlaying,
    tracks: toJS(rootStore.song.tracks),
    measures: rootStore.song.measures,
    timebase: rootStore.services.player.timebase,
    endTick: rootStore.song.endOfSong,
    loop: rootStore.playerStore.loop,
    selection: rootStore.arrangeViewStore.selection,
  }))
  const { arrangeViewStore: s } = rootStore

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
      loop={loop}
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
      openContextMenu={(e, isSelectionSelected) =>
        arrangeOpenContextMenu(rootStore)(e, isSelectionSelected)
      }
    />
  )
}

export default withSize({ monitorHeight: true })(ArrangeViewWrapper)

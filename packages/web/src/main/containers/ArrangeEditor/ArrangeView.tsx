import Player from "common/player"
import { ISize } from "common/geometry"
import React, { SFC, useState, useEffect } from "react"
import { NoteCoordTransform } from "common/transform"
import RootStore from "stores/RootStore"
import {
  SET_PLAYER_POSITION,
  ARRANGE_START_SELECTION,
  ARRANGE_END_SELECTION,
  ARRANGE_RESIZE_SELECTION,
  ARRANGE_MOVE_SELECTION,
  ARRANGE_OPEN_CONTEXT_MENU
} from "actions"
import { compose, Omit } from "recompose"
import { withSize } from "react-sizeme"
import { inject, observer } from "mobx-react"
import {
  ArrangeView,
  ArrangeViewProps
} from "components/ArrangeView/ArrangeView"

type Props = Omit<
  ArrangeViewProps,
  | "onScrollLeft"
  | "onScrollTop"
  | "transform"
  | "playerPosition"
  | "scrollLeft"
  | "scrollTop"
  | "onScrollLeft"
  | "onScrollTop"
> & {
  pixelsPerTick: number
  keyHeight: number
  autoScroll: boolean
  size: ISize
  playerPosition: number
  isPlaying: boolean
}

const Wrapper: SFC<Props> = props => {
  const {
    autoScroll,
    size,
    playerPosition,
    pixelsPerTick,
    keyHeight,
    isPlaying
  } = props

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
    size.width
  ])

  return (
    <ArrangeView
      {...props}
      scrollLeft={scrollLeft}
      scrollTop={scrollTop}
      onScrollLeft={(scroll: number) => setScrollLeft(scroll)}
      onScrollTop={(scroll: number) => setScrollTop(scroll)}
      transform={transform}
    />
  )
}

const mapStoreToProps = ({
  rootStore: {
    rootViewStore: { theme },
    song: { tracks, measures, endOfSong },
    arrangeViewStore: s,
    services: { player, quantizer },
    playerStore: { loop, position },
    dispatch
  }
}: {
  rootStore: RootStore
}) =>
  ({
    theme,
    isPlaying: player.isPlaying,
    quantizer,
    loop,
    tracks: (tracks as any).toJS(),
    measures,
    timebase: player.timebase,
    endTick: endOfSong,
    keyHeight: 0.3,
    pixelsPerTick: 0.1 * s.scaleX,
    autoScroll: s.autoScroll,
    selection: s.selection,
    onClickScaleUp: () => (s.scaleX = s.scaleX + 0.1),
    onClickScaleDown: () => (s.scaleX = Math.max(0.05, s.scaleX - 0.1)),
    onClickScaleReset: () => (s.scaleX = 1),
    setPlayerPosition: tick => dispatch(SET_PLAYER_POSITION, tick),
    startSelection: pos => dispatch(ARRANGE_START_SELECTION, pos),
    endSelection: (start, end) =>
      dispatch(ARRANGE_END_SELECTION, { start, end }),
    resizeSelection: (start, end) =>
      dispatch(ARRANGE_RESIZE_SELECTION, { start, end }),
    moveSelection: pos => dispatch(ARRANGE_MOVE_SELECTION, pos),
    openContextMenu: (e, isSelectionSelected) =>
      dispatch(ARRANGE_OPEN_CONTEXT_MENU, e, isSelectionSelected),
    playerPosition: position
  } as Partial<Props>)

export default compose(
  inject(mapStoreToProps),
  observer,
  withSize({ monitorHeight: true })
)(Wrapper)

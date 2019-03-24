import Player from "common/player"
import { ISize } from "common/geometry"
import React, { Component } from "react"
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
  "onScrollLeft" | "onScrollTop" | "transform" | "playerPosition"
> & {
  player: Player
  pixelsPerTick: number
  keyHeight: number
  autoScroll: boolean
  size: ISize
  scrollLeft: number
  setScrollLeft: (scroll: number) => void
  setScrollTop: (scroll: number) => void
}

function stateful(WrappedComponent: any) {
  return class extends Component<Props> {
    componentDidMount() {
      this.props.player.on("change-position", this.updatePosition)
    }

    componentWillUnmount() {
      this.props.player.off("change-position", this.updatePosition)
    }

    get transform() {
      return new NoteCoordTransform(
        this.props.pixelsPerTick,
        this.props.keyHeight,
        127
      )
    }

    updatePosition = (tick: number) => {
      this.setState({
        playerPosition: tick
      })

      const { autoScroll, size } = this.props

      // keep scroll position to cursor
      if (autoScroll) {
        const transform = this.transform
        const x = transform.getX(tick)
        const screenX = x - this.props.scrollLeft
        if (screenX > size.width * 0.7 || screenX < 0) {
          this.props.setScrollLeft(x)
        }
      }
    }

    render() {
      const { setScrollLeft, setScrollTop } = this.props

      return (
        <WrappedComponent
          onScrollLeft={(scroll: number) => setScrollLeft(scroll)}
          onScrollTop={(scroll: number) => setScrollTop(scroll)}
          transform={this.transform}
          {...this.state}
          {...this.props}
        />
      )
    }
  }
}

const mapStoreToProps = ({
  rootStore: {
    rootViewStore: { theme },
    song: { tracks, measureList, endOfSong },
    arrangeViewStore: s,
    services: { player, quantizer },
    playerStore: { loop },
    dispatch
  }
}: {
  rootStore: RootStore
}) =>
  ({
    theme,
    player,
    quantizer,
    loop,
    tracks: (tracks as any).toJS(),
    beats: measureList.beats,
    endTick: endOfSong,
    keyHeight: 0.3,
    pixelsPerTick: 0.1 * s.scaleX,
    autoScroll: s.autoScroll,
    scrollLeft: s.scrollLeft,
    scrollTop: s.scrollTop,
    selection: s.selection,
    setScrollLeft: v => (s.scrollLeft = v),
    setScrollTop: v => (s.scrollTop = v),
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
      dispatch(ARRANGE_OPEN_CONTEXT_MENU, e, isSelectionSelected)
  } as Partial<Props>)

export default compose(
  withSize({ monitorHeight: true }),
  inject(mapStoreToProps),
  observer,
  stateful
)(ArrangeView)

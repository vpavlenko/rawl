import { NoteCoordTransform } from "common/transform"
import {
  PREVIEW_NOTE,
  SET_LOOP_BEGIN,
  SET_LOOP_END,
  SET_PLAYER_POSITION,
  CHANGE_NOTES_VELOCITY,
  CREATE_VOLUME,
  CREATE_PITCH_BEND,
  CREATE_PAN,
  CREATE_MODULATION,
  CREATE_EXPRESSION
} from "main/actions"
import { inject, observer } from "mobx-react"
import React, { SFC, useState, useEffect } from "react"
import { withSize } from "react-sizeme"
import { compose } from "recompose"
import { PianoRollProps, PianoRoll } from "components/PianoRoll/PianoRoll"
import PencilMouseHandler from "./MouseHandler/PencilMouseHandler"
import SelectionMouseHandler from "./MouseHandler/SelectionMouseHandler"
import { PianoRollMouseMode } from "stores/PianoRollStore"
import { Dispatcher } from "createDispatcher"
import RootStore from "stores/RootStore"

export type SPianoRollProps = PianoRollProps & {
  playerPosition: number
  autoScroll: boolean
  scaleX: number
  mouseMode: PianoRollMouseMode
  dispatch: Dispatcher
  isPlaying: boolean
}

const Wrapper: SFC<SPianoRollProps> = props => {
  const {
    dispatch,
    selection,
    theme,
    size,
    playerPosition,
    mouseMode,
    scrollLeft,
    setScrollLeft,
    scaleX = 1,
    autoScroll = false,
    isPlaying
  } = props

  const [pencilMouseHandler] = useState(new PencilMouseHandler())
  const [selectionMouseHandler] = useState(new SelectionMouseHandler())
  const [alpha, setAlpha] = useState<HTMLElement | null>(null)
  const transform = new NoteCoordTransform(0.1 * scaleX, theme.keyHeight, 127)

  pencilMouseHandler.dispatch = dispatch
  pencilMouseHandler.transform = transform
  selectionMouseHandler.dispatch = dispatch
  selectionMouseHandler.transform = transform
  selectionMouseHandler.selection = selection

  const mouseHandler =
    mouseMode === "pencil" ? pencilMouseHandler : selectionMouseHandler

  useEffect(() => {
    // keep scroll position to cursor
    if (autoScroll && isPlaying) {
      const x = transform.getX(playerPosition)
      const screenX = x - scrollLeft
      if (screenX > size.width * 0.7 || screenX < 0) {
        setScrollLeft(x)
      }
    }
  }, [autoScroll, isPlaying, scaleX, scrollLeft, playerPosition])

  return (
    <PianoRoll
      {...props}
      scrollLeft={scrollLeft}
      setScrollLeft={setScrollLeft}
      transform={transform}
      mouseHandler={mouseHandler}
      onMountAlpha={c => setAlpha(c)}
      alphaHeight={alpha !== null ? alpha.getBoundingClientRect().height : 0}
    />
  )
}

export default compose<{}, {}>(
  inject(
    ({
      rootStore: {
        song: { selectedTrack: track, endOfSong: endTick, measures },
        pianoRollStore: s,
        rootViewStore: { theme },
        playerStore,
        services: { quantizer, player },
        dispatch
      }
    }: {
      rootStore: RootStore
    }) =>
      ({
        track,
        endTick,
        measures,
        timebase: player.timebase,
        theme,
        events: track !== undefined ? (track.events as any).toJS() : [], // 変更が反映されるように toJS() する
        scaleX: s.scaleX,
        scaleY: s.scaleY,
        autoScroll: s.autoScroll,
        selection: s.selection,
        scrollLeft: s.scrollLeft,
        setScrollLeft: v => (s.scrollLeft = v),
        scrollTop: s.scrollTop,
        setScrollTop: v => (s.scrollTop = v),
        controlMode: s.controlMode,
        setControlMode: v => (s.controlMode = v),
        cursorPosition: s.cursorPosition,
        notesCursor: s.notesCursor,
        mouseMode: s.mouseMode,
        onChangeTool: () =>
          (s.mouseMode = s.mouseMode === "pencil" ? "selection" : "pencil"),
        onClickScaleUp: () => (s.scaleX = s.scaleX + 0.1),
        onClickScaleDown: () => (s.scaleX = Math.max(0.05, s.scaleX - 0.1)),
        onClickScaleReset: () => (s.scaleX = 1),
        loop: playerStore.loop,
        isPlaying: player.isPlaying,
        quantizer,
        setLoopBegin: tick => {},
        setLoopEnd: tick => {},
        setPlayerPosition: tick => dispatch(SET_PLAYER_POSITION, tick),
        previewNote: (noteNumber, channel) =>
          dispatch(PREVIEW_NOTE, noteNumber, channel),
        dispatch,
        changeVelocity: (notes, velocity) =>
          dispatch(CHANGE_NOTES_VELOCITY, notes, velocity),
        createControlEvent: (mode, value, tick) => {
          const type = (() => {
            switch (mode) {
              case "volume":
                return CREATE_VOLUME
              case "pitchBend":
                return CREATE_PITCH_BEND
              case "pan":
                return CREATE_PAN
              case "modulation":
                return CREATE_MODULATION
              case "expression":
                return CREATE_EXPRESSION
              case "velocity":
                throw new Error("invalid type")
            }
          })()
          dispatch(type, value, tick)
        },
        playerPosition: playerStore.position
      } as Partial<SPianoRollProps>)
  ),
  observer,
  withSize({ monitorHeight: true })
)(Wrapper)

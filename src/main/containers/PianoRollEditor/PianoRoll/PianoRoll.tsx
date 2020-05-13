import { NoteCoordTransform } from "common/transform"
import {
  setPlayerPosition,
  previewNote,
  changeNotesVelocity,
  createVolume,
  createPitchBend,
  createPan,
  createModulation,
  createExpression,
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
import { toJS } from "mobx"

export type SPianoRollProps = PianoRollProps & {
  playerPosition: number
  autoScroll: boolean
  scaleX: number
  mouseMode: PianoRollMouseMode
  dispatch: Dispatcher
  isPlaying: boolean
}

const Wrapper: SFC<SPianoRollProps> = (props) => {
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
    isPlaying,
  } = props

  const [pencilMouseHandler] = useState(new PencilMouseHandler(dispatch))
  const [selectionMouseHandler] = useState(new SelectionMouseHandler(dispatch))
  const transform = new NoteCoordTransform(0.1 * scaleX, theme.keyHeight, 127)

  pencilMouseHandler.transform = transform
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
      alphaHeight={size.height}
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
        dispatch,
      },
    }: {
      rootStore: RootStore
    }) =>
      ({
        track,
        endTick,
        measures,
        timebase: player.timebase,
        theme,
        events: track !== undefined ? toJS(track.events) : [], // 変更が反映されるように toJS() する
        scaleX: s.scaleX,
        scaleY: s.scaleY,
        autoScroll: s.autoScroll,
        selection: s.selection,
        scrollLeft: s.scrollLeft,
        setScrollLeft: (v) => (s.scrollLeft = v),
        scrollTop: s.scrollTop,
        setScrollTop: (v) => (s.scrollTop = v),
        controlMode: s.controlMode,
        setControlMode: (v) => (s.controlMode = v),
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
        setLoopBegin: (tick) => {},
        setLoopEnd: (tick) => {},
        setPlayerPosition: (tick) => dispatch(setPlayerPosition(tick)),
        previewNote: (noteNumber, channel) =>
          dispatch(previewNote(noteNumber, channel)),
        dispatch,
        changeVelocity: (notes, velocity) =>
          dispatch(
            changeNotesVelocity(
              notes.map((n) => n.id),
              velocity
            )
          ),
        createControlEvent: (mode, value, tick) => {
          const action = (() => {
            switch (mode) {
              case "volume":
                return createVolume
              case "pitchBend":
                return createPitchBend
              case "pan":
                return createPan
              case "modulation":
                return createModulation
              case "expression":
                return createExpression
              case "velocity":
                throw new Error("invalid type")
            }
          })()
          dispatch(action(value, tick || 0))
        },
        playerPosition: playerStore.position,
      } as Partial<SPianoRollProps>)
  ),
  observer,
  withSize({ monitorHeight: true })
)(Wrapper)

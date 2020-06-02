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
  moveNote,
  resizeNoteLeft,
  resizeNoteRight,
} from "main/actions"
import { observer, useObserver } from "mobx-react"
import React, { SFC, useState, useEffect } from "react"
import { withSize } from "react-sizeme"
import { compose } from "recompose"
import { PianoRoll } from "components/PianoRoll/PianoRoll"
import PencilMouseHandler from "./MouseHandler/PencilMouseHandler"
import { pointAdd, pointSub, ISize } from "common/geometry"
import { useTheme } from "main/hooks/useTheme"
import { useStores } from "main/hooks/useStores"
import { PianoNotesNoteMouseEvent } from "main/components/PianoRoll/PianoNotes/PianoNotes"
import SelectionMouseHandler from "./MouseHandler/SelectionMouseHandler"

export interface PianoRollWrapperProps {
  size: ISize
}

const PianoRollWrapper: SFC<PianoRollWrapperProps> = ({ size }) => {
  const { rootStore } = useStores()
  const {
    events,
    isRhythmTrack,
    channel,
    endTick,
    measures,
    isPlaying,
    playerPosition,
    timebase,
    dispatch,
    mouseMode,
    scaleX,
    scrollLeft,
    scrollTop,
    autoScroll,
    controlMode,
    notesCursor,
    selection,
    loop,
    s,
  } = useObserver(() => ({
    events: rootStore.song.selectedTrack!.events,
    isRhythmTrack: rootStore.song.selectedTrack!.isRhythmTrack,
    channel: rootStore.song.selectedTrack!.channel!,
    endTick: rootStore.song.endOfSong,
    measures: rootStore.song.measures,
    isPlaying: rootStore.services.player.isPlaying,
    playerPosition: rootStore.playerStore.position,
    timebase: rootStore.services.player.timebase,
    dispatch: rootStore.dispatch,
    s: rootStore.pianoRollStore,
    mouseMode: rootStore.pianoRollStore.mouseMode,
    scaleX: rootStore.pianoRollStore.scaleX,
    scrollLeft: rootStore.pianoRollStore.scrollLeft,
    scrollTop: rootStore.pianoRollStore.scrollTop,
    autoScroll: rootStore.pianoRollStore.autoScroll,
    controlMode: rootStore.pianoRollStore.controlMode,
    notesCursor: rootStore.pianoRollStore.notesCursor,
    selection: rootStore.pianoRollStore.selection,
    loop: rootStore.playerStore.loop,
  }))

  const theme = useTheme()

  const [pencilMouseHandler] = useState(new PencilMouseHandler(dispatch))
  const [selectionMouseHandler] = useState(new SelectionMouseHandler(dispatch))
  const transform = new NoteCoordTransform(0.1 * scaleX, theme.keyHeight, 127)

  selectionMouseHandler.selection = selection

  const mouseHandler =
    mouseMode === "pencil" ? pencilMouseHandler : selectionMouseHandler

  useEffect(() => {
    // keep scroll position to cursor
    if (autoScroll && isPlaying) {
      const x = transform.getX(playerPosition)
      const screenX = x - scrollLeft
      if (screenX > size.width * 0.7 || screenX < 0) {
        s.scrollLeft = x
      }
    }
  }, [autoScroll, isPlaying, scaleX, scrollLeft, playerPosition])

  const onDragNote = (e: PianoNotesNoteMouseEvent) => {
    switch (e.position) {
      case "center":
        const delta = pointSub(e.offset, e.dragStart)
        console.log(delta)
        const position = pointAdd(e.dragItem, delta)
        dispatch(
          moveNote({
            id: e.note.id,
            tick: e.transform.getTicks(position.x),
            noteNumber: Math.round(e.transform.getNoteNumber(position.y)),
            quantize: "round",
          })
        )
        break
      case "left":
        dispatch(resizeNoteLeft(e.dragItem.id, e.tick))
        break
      case "right":
        dispatch(resizeNoteRight(e.dragItem.id, e.tick))
        break
    }
  }

  return (
    <PianoRoll
      width={size.width}
      isRhythmTrack={isRhythmTrack}
      measures={measures}
      endTick={endTick}
      scrollLeft={scrollLeft}
      setScrollLeft={(v) => (s.scrollLeft = v)}
      transform={transform}
      mouseHandler={mouseHandler}
      alphaHeight={size.height}
      onDragNote={onDragNote}
      timebase={timebase}
      events={events}
      selection={s.selection}
      scrollTop={scrollTop}
      setScrollTop={(v) => (s.scrollTop = v)}
      controlMode={controlMode}
      setControlMode={(v) => (s.controlMode = v)}
      cursorPosition={playerPosition}
      notesCursor={notesCursor}
      onClickScaleUp={() => (s.scaleX = scaleX + 0.1)}
      onClickScaleDown={() => (s.scaleX = Math.max(0.05, scaleX - 0.1))}
      onClickScaleReset={() => (s.scaleX = 1)}
      loop={loop}
      onMouseDownRuler={(e) => {
        const tick = e.tick
        if (e.nativeEvent.ctrlKey) {
          // setLoopBegin(tick)
        } else if (e.nativeEvent.altKey) {
          // setLoopEnd(tick)
        } else {
          dispatch(setPlayerPosition(tick))
        }
      }}
      onClickKey={(noteNumber) => {
        dispatch(previewNote(channel, noteNumber))
      }}
      changeVelocity={(notes, velocity) =>
        dispatch(
          changeNotesVelocity(
            notes.map((n) => n.id),
            velocity
          )
        )
      }
      createControlEvent={(mode, value, tick) => {
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
      }}
    />
  )
}

export default compose<{}, {}>(
  observer,
  withSize({ monitorHeight: true })
)(PianoRollWrapper)

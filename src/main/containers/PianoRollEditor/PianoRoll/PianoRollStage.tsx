import React, { SFC, useState, useCallback, useMemo } from "react"
import { Stage, Container } from "@inlet/react-pixi"
import { Point, Rectangle } from "pixi.js"
import { useTheme } from "main/hooks/useTheme"
import PencilMouseHandler from "./MouseHandler/PencilMouseHandler"
import SelectionMouseHandler from "./MouseHandler/SelectionMouseHandler"
import { NoteCoordTransform } from "common/transform"
import { useObserver } from "mobx-react"
import { useStores } from "main/hooks/useStores"
import PianoLines from "main/components/PianoRoll/PianoLines"
import PianoGrid from "main/components/PianoRoll/PianoGrid"
import PianoNotes from "main/components/PianoRoll/PianoNotes/PianoNotes"
import PianoSelection from "main/components/PianoRoll/PianoSelection"
import PianoCursor from "main/components/PianoRoll/PianoCursor"
import PianoRuler, { TickEvent } from "main/components/PianoRoll/PianoRuler"
import PianoKeys from "main/components/PianoRoll/PianoKeys"
import { DisplayEvent } from "main/components/PianoRoll/PianoControlEvents"
import { show as showEventEditor } from "components/EventEditor/EventEditor"
import { createBeatsInRange } from "common/helpers/mapBeats"
import { pointSub, pointAdd, IPoint } from "common/geometry"
import {
  moveNote,
  resizeNoteLeft,
  resizeNoteRight,
  setPlayerPosition,
  previewNote,
} from "main/actions"
import { filterEventsWithScroll } from "common/helpers/filterEventsWithScroll"
import { isNoteEvent } from "common/track"
import { LeftTopSpace } from "./LeftTopSpace"
import {
  PianoNoteMouseEvent,
  PianoNoteItem,
} from "main/components/PianoRoll/PianoNotes/PianoNote"
import { useRecycle } from "main/hooks/useRecycle"

export interface PianoRollStageProps {
  width: number
}

export interface PianoNotesMouseEvent {
  nativeEvent: MouseEvent
  tick: number
  noteNumber: number
  local: IPoint
  transform: NoteCoordTransform
}

export const PianoRollStage: SFC<PianoRollStageProps> = ({ width }) => {
  const { rootStore } = useStores()
  const {
    events,
    isRhythmTrack,
    channel,
    measures,
    playerPosition,
    timebase,
    mouseMode,
    scaleX,
    scrollLeft,
    scrollTop,
    notesCursor,
    selection,
    loop,
  } = useObserver(() => ({
    events: rootStore.song.selectedTrack?.events ?? [],
    isRhythmTrack: rootStore.song.selectedTrack?.isRhythmTrack ?? false,
    channel: rootStore.song.selectedTrack?.channel ?? 0,
    measures: rootStore.song.measures,
    playerPosition: rootStore.playerStore.position,
    timebase: rootStore.services.player.timebase,
    mouseMode: rootStore.pianoRollStore.mouseMode,
    scaleX: rootStore.pianoRollStore.scaleX,
    scrollLeft: rootStore.pianoRollStore.scrollLeft,
    scrollTop: rootStore.pianoRollStore.scrollTop,
    notesCursor: rootStore.pianoRollStore.notesCursor,
    selection: rootStore.pianoRollStore.selection,
    loop: rootStore.playerStore.loop,
  }))
  const theme = useTheme()

  const [pencilMouseHandler] = useState(new PencilMouseHandler(rootStore))
  const [selectionMouseHandler] = useState(new SelectionMouseHandler(rootStore))
  const transform = useMemo(
    () => new NoteCoordTransform(0.1 * scaleX, theme.keyHeight, 127),
    [scaleX, theme]
  )

  selectionMouseHandler.selection = selection

  const stageHeight = transform.pixelsPerKey * transform.numberOfKeys
  const startTick = scrollLeft / transform.pixelsPerTick

  const mouseHandler =
    mouseMode === "pencil" ? pencilMouseHandler : selectionMouseHandler

  // MouseHandler で利用する追加情報をイベントに付加する
  const extendEvent = (
    e: PIXI.interaction.InteractionEvent
  ): PianoNotesMouseEvent => {
    const local = {
      x: e.data.global.x - theme.keyWidth + scrollLeft,
      y: e.data.global.y - theme.rulerHeight + scrollTop,
    }
    return {
      nativeEvent: e.data.originalEvent as MouseEvent,
      local,
      tick: transform.getTicks(local.x),
      noteNumber: Math.ceil(transform.getNoteNumber(local.y)),
      transform,
    }
  }

  const handleMouseDown = (e: PIXI.interaction.InteractionEvent) =>
    mouseHandler.onMouseDown(extendEvent(e))

  const handleMouseMove = (e: PIXI.interaction.InteractionEvent) =>
    mouseHandler.onMouseMove(extendEvent(e))

  const handleMouseUp = (e: PIXI.interaction.InteractionEvent) =>
    mouseHandler.onMouseUp(extendEvent(e))

  const onHoverNote = useCallback(() => {}, [])

  const notes = filterEventsWithScroll(
    events.filter(isNoteEvent),
    transform.pixelsPerTick,
    scrollLeft,
    width
  ).map(
    (e): PianoNoteItem => {
      const rect = transform.getRect(e)
      const isSelected = selection.noteIds.includes(e.id)
      return {
        ...rect,
        id: e.id,
        velocity: e.velocity,
        isSelected,
        mouseData: {
          note: e,
          transform,
        },
      }
    }
  )

  const keyedNotes = useRecycle(notes)

  const mappedBeats = createBeatsInRange(
    measures,
    transform.pixelsPerTick,
    timebase,
    startTick,
    width
  )

  const cursorPositionX = transform.getX(playerPosition)
  const contentHeight = transform.getMaxY()

  const onDoubleClickMark = (group: DisplayEvent[]) => {
    showEventEditor(group)
  }

  const onDragNote = useCallback((e: PianoNoteMouseEvent) => {
    const { note, transform } = e.dragItem.mouseData
    const tick = transform.getTicks(e.offset.x)

    switch (e.position) {
      case "center":
        const delta = pointSub(e.offset, e.dragStart)
        console.log(delta)
        const position = pointAdd(e.dragItem, delta)
        moveNote(rootStore)({
          id: note.id,
          tick: transform.getTicks(position.x),
          noteNumber: Math.round(transform.getNoteNumber(position.y)),
          quantize: "round",
        })
        break
      case "left":
        resizeNoteLeft(rootStore)(e.dragItem.id, tick)
        break
      case "right":
        resizeNoteRight(rootStore)(e.dragItem.id, tick)
        break
    }
  }, [])

  const onMouseDownRuler = (e: TickEvent<MouseEvent>) => {
    const tick = e.tick
    if (e.nativeEvent.ctrlKey) {
      // setLoopBegin(tick)
    } else if (e.nativeEvent.altKey) {
      // setLoopEnd(tick)
    } else {
      setPlayerPosition(rootStore)(tick)
    }
  }

  const onClickKey = (noteNumber: number) => {
    previewNote(rootStore)(channel, noteNumber)
  }

  return (
    <Stage
      className="alphaContent"
      width={width}
      height={stageHeight}
      options={{ transparent: true }}
    >
      <Container position={new Point(theme.keyWidth, 0)}>
        <Container position={new Point(0, -scrollTop + theme.rulerHeight)}>
          <PianoLines
            width={width}
            pixelsPerKey={transform.pixelsPerKey}
            numberOfKeys={transform.numberOfKeys}
          />
          <Container
            position={new Point(-scrollLeft, 0)}
            interactive={true}
            hitArea={new Rectangle(0, 0, 100000, 100000)} // catch all hits
            mousedown={handleMouseDown}
            mousemove={handleMouseMove}
            mouseup={handleMouseUp}
          >
            <PianoGrid height={contentHeight} beats={mappedBeats} />
            <PianoNotes
              notes={keyedNotes}
              cursor={notesCursor}
              isDrumMode={isRhythmTrack}
              onDragNote={onDragNote}
              onHoverNote={onHoverNote}
            />
            <PianoSelection
              selectionBounds={
                selection.enabled ? selection.getBounds(transform) : null
              }
            />
            <Container x={cursorPositionX}>
              <PianoCursor height={contentHeight} />
            </Container>
          </Container>
        </Container>
        <PianoRuler
          width={width}
          beats={mappedBeats}
          loop={loop}
          onMouseDown={onMouseDownRuler}
          scrollLeft={scrollLeft}
          pixelsPerTick={transform.pixelsPerTick}
        />
      </Container>
      <Container position={new Point(0, -scrollTop + theme.rulerHeight)}>
        <PianoKeys
          keyHeight={transform.pixelsPerKey}
          numberOfKeys={transform.numberOfKeys}
          onClickKey={onClickKey}
        />
      </Container>
      <LeftTopSpace width={width} />
    </Stage>
  )
}

import { ISize } from "common/geometry"
import Measure from "common/measure"
import { LoopSetting } from "common/player"
import SelectionModel from "common/selection/SelectionModel"
import Track, { TrackEvent } from "common/track"
import { NoteCoordTransform } from "common/transform"
import { show as showEventEditor } from "components/EventEditor/EventEditor"
import { HorizontalScaleScrollBar } from "components/inputs/ScaleScrollBar"
import { VerticalScrollBar } from "components/inputs/ScrollBar"
import { createBeatsInRange } from "helpers/mapBeats"
import React, { StatelessComponent, SFC, useCallback } from "react"
import { ControlMode, ControlPaneProps } from "./ControlPane"
import { DisplayEvent } from "./PianoControlEvents"
import PianoCursor from "./PianoCursor"
import PianoGrid from "./PianoGrid"
import PianoKeys from "./PianoKeys"
import PianoLines from "./PianoLines"
import PianoNotes, {
  PianoNotesMouseEvent,
  PianoNotesNoteMouseEvent,
} from "./PianoNotes/PianoNotes"
import PianoRuler, { TickEvent } from "./PianoRuler"
import PianoSelection from "./PianoSelection"

import "./PianoRoll.css"
import { useTheme } from "main/hooks/useTheme"
import { Stage, Container, Graphics } from "@inlet/react-pixi"
import { Point, Rectangle } from "pixi.js"
import Color from "color"
import filterEventsWithScroll from "common/helpers/filterEventsWithScroll"

const SCROLL_KEY_SPEED = 4

export interface PianoNotesMouseHandler {
  onMouseDown(e: PianoNotesMouseEvent): void
  onMouseMove(e: PianoNotesMouseEvent): void
  onMouseUp(e: PianoNotesMouseEvent): void
}

const LeftTopSpace: SFC<{ width: number }> = ({ width }) => {
  const theme = useTheme()
  return (
    <Graphics
      draw={(g) => {
        g.clear()
          .lineStyle()
          .beginFill(Color(theme.backgroundColor).rgbNumber())
          .drawRect(0, 0, theme.keyWidth, theme.rulerHeight)
        g.lineStyle(1, Color(theme.dividerColor).rgbNumber())
          .moveTo(theme.keyWidth, 0)
          .lineTo(theme.keyWidth, theme.rulerHeight)
          .moveTo(0, theme.rulerHeight)
          .lineTo(width, theme.rulerHeight)
      }}
    />
  )
}

export type PianoRollProps = Pick<
  ControlPaneProps,
  "createControlEvent" | "changeVelocity"
> & {
  mouseHandler: PianoNotesMouseHandler
  onDragNote: (e: PianoNotesNoteMouseEvent) => void
  track: Track
  events: TrackEvent[]
  transform: NoteCoordTransform
  measures: Measure[]
  timebase: number
  endTick: number
  selection: SelectionModel
  alphaHeight: number
  scrollLeft: number
  scrollTop: number
  setScrollLeft: (scroll: number) => void
  setScrollTop: (scroll: number) => void
  controlMode: ControlMode
  setControlMode: (mode: string) => void
  notesCursor: string
  cursorPosition: number
  loop: LoopSetting
  size: ISize
  onClickScaleUp: () => void
  onClickScaleDown: () => void
  onClickScaleReset: () => void
  onMouseDownRuler: (e: TickEvent<MouseEvent>) => void
  onClickKey: (noteNumber: number) => void
}

export const PianoRoll: StatelessComponent<PianoRollProps> = ({
  mouseHandler,
  onDragNote,
  track,
  events,
  transform,
  measures,
  timebase,
  endTick: trackEndTick,
  selection,
  alphaHeight,
  scrollLeft,
  scrollTop,
  setScrollLeft,
  setScrollTop,
  controlMode,
  setControlMode,
  notesCursor,
  cursorPosition,
  loop,
  size,
  onClickScaleUp,
  onClickScaleDown,
  onClickScaleReset,
  onMouseDownRuler,
  changeVelocity,
  createControlEvent,
  onClickKey,
}) => {
  const containerWidth = size.width

  const width = containerWidth
  const startTick = scrollLeft / transform.pixelsPerTick
  const widthTick = transform.getTicks(containerWidth)
  const endTick = startTick + widthTick
  const mappedBeats = createBeatsInRange(
    measures,
    transform.pixelsPerTick,
    timebase,
    startTick,
    endTick
  )

  const contentWidth = Math.max(trackEndTick, endTick) * transform.pixelsPerTick
  const contentHeight = transform.getMaxY()

  const cursorPositionX = transform.getX(cursorPosition)

  function clampScroll(maxOffset: number, scroll: number) {
    return Math.floor(Math.min(maxOffset, Math.max(0, scroll)))
  }

  scrollLeft = clampScroll(contentWidth - containerWidth, scrollLeft)
  scrollTop = clampScroll(contentHeight - alphaHeight, scrollTop)

  const onDoubleClickMark = (group: DisplayEvent[]) => {
    showEventEditor(group)
  }

  const stageHeight = transform.pixelsPerKey * transform.numberOfKeys
  const theme = useTheme()

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
    events,
    transform.pixelsPerTick,
    scrollLeft,
    containerWidth
  )

  return (
    <div className="PianoRoll">
      <div>
        <div
          className="alpha"
          onWheel={(e) => {
            const scrollLineHeight = transform.pixelsPerKey * SCROLL_KEY_SPEED
            const delta = scrollLineHeight * (e.deltaY > 0 ? 1 : -1)
            setScrollTop(scrollTop + delta)
          }}
        >
          <Stage
            className="alphaContent"
            width={width}
            height={stageHeight}
            options={{ transparent: true }}
          >
            <Container position={new Point(theme.keyWidth, 0)}>
              <Container
                position={new Point(0, -scrollTop + theme.rulerHeight)}
              >
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
                    events={notes}
                    selectedEventIds={selection.noteIds}
                    transform={transform}
                    cursor={notesCursor}
                    isDrumMode={track.isRhythmTrack}
                    onDragNote={onDragNote}
                    onHoverNote={onHoverNote}
                  />
                  <PianoSelection
                    selectionBounds={
                      selection.enabled ? selection.getBounds(transform) : null
                    }
                  />
                  <PianoCursor
                    height={contentHeight}
                    position={cursorPositionX}
                  />
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
          <VerticalScrollBar
            scrollOffset={scrollTop}
            contentLength={contentHeight}
            onScroll={setScrollTop}
          />
        </div>
        <div className="beta"></div>
      </div>
      <HorizontalScaleScrollBar
        scrollOffset={scrollLeft}
        contentLength={contentWidth}
        onScroll={setScrollLeft}
        onClickScaleUp={onClickScaleUp}
        onClickScaleDown={onClickScaleDown}
        onClickScaleReset={onClickScaleReset}
      />
    </div>
  )
}

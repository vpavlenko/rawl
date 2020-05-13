import { ISize } from "common/geometry"
import Measure from "common/measure"
import { LoopSetting } from "common/player"
import SelectionModel from "common/selection/SelectionModel"
import Theme from "common/theme/Theme"
import Track, { TrackEvent } from "common/track"
import { NoteCoordTransform } from "common/transform"
import { show as showEventEditor } from "components/EventEditor/EventEditor"
import { HorizontalScaleScrollBar } from "components/inputs/ScaleScrollBar"
import { VerticalScrollBar } from "components/inputs/ScrollBar"
import { createBeatsInRange } from "helpers/mapBeats"
import React, { StatelessComponent } from "react"
import { ControlMode, ControlPaneProps } from "./ControlPane"
import { DisplayEvent } from "./PianoControlEvents"
import PianoCursor from "./PianoCursor"
import PianoGrid from "./PianoGrid"
import PianoKeys from "./PianoKeys"
import PianoLines from "./PianoLines"
import PianoNotes, { PianoNotesMouseEvent } from "./PianoNotes/PianoNotes"
import PianoRuler, { TickEvent } from "./PianoRuler"
import PianoSelection from "./PianoSelection"

import "./PianoRoll.css"

const SCROLL_KEY_SPEED = 4

export interface PianoNotesMouseHandler {
  onMouseDown(e: PianoNotesMouseEvent<MouseEvent>): void
  onMouseMove(e: PianoNotesMouseEvent<MouseEvent>): void
  onMouseUp(e: PianoNotesMouseEvent<MouseEvent>): void
}

export type PianoRollProps = Pick<
  ControlPaneProps,
  "createControlEvent" | "changeVelocity"
> & {
  mouseHandler: PianoNotesMouseHandler
  theme: Theme
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
  onMouseDownRuler: (e: TickEvent<React.MouseEvent>) => void
  onClickKey: (noteNumber: number) => void
}

export const PianoRoll: StatelessComponent<PianoRollProps> = ({
  mouseHandler,
  theme,
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
  const { keyWidth, rulerHeight } = theme

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

  return (
    <div className="PianoRoll">
      <div>
        <div
          className="alpha"
          onWheel={(e) => {
            e.preventDefault()
            const scrollLineHeight = transform.pixelsPerKey * SCROLL_KEY_SPEED
            const delta = scrollLineHeight * (e.deltaY > 0 ? 1 : -1)
            setScrollTop(scrollTop + delta)
          }}
        >
          <div className="alphaContent" style={{ top: -scrollTop }}>
            <PianoLines
              theme={theme}
              width={width}
              pixelsPerKey={transform.pixelsPerKey}
              numberOfKeys={transform.numberOfKeys}
            />
            <PianoGrid
              theme={theme}
              width={width}
              height={contentHeight}
              scrollLeft={scrollLeft}
              beats={mappedBeats}
            />
            <PianoNotes
              events={events}
              selectedEventIds={selection.noteIds}
              transform={transform}
              width={width}
              cursor={notesCursor}
              scrollLeft={scrollLeft}
              isDrumMode={track.isRhythmTrack}
              onMouseDown={(e) => mouseHandler.onMouseDown(e)}
              onMouseMove={(e) => mouseHandler.onMouseMove(e)}
              onMouseUp={(e) => mouseHandler.onMouseUp(e)}
              theme={theme}
            />
            <PianoSelection
              color={theme.themeColor}
              width={width}
              height={contentHeight}
              selectionBounds={
                selection.enabled ? selection.getBounds(transform) : null
              }
              scrollLeft={scrollLeft}
            />
            <PianoCursor
              width={width}
              height={contentHeight}
              position={cursorPositionX - scrollLeft}
            />
            <PianoKeys
              theme={theme}
              width={keyWidth}
              keyHeight={transform.pixelsPerKey}
              numberOfKeys={transform.numberOfKeys}
              onClickKey={onClickKey}
            />
          </div>
          <div className="alphaRuler">
            <PianoRuler
              width={width}
              theme={theme}
              height={rulerHeight}
              beats={mappedBeats}
              loop={loop}
              onMouseDown={onMouseDownRuler}
              scrollLeft={scrollLeft}
              pixelsPerTick={transform.pixelsPerTick}
            />
            <div className="PianoRollLeftSpace" />
          </div>
          <VerticalScrollBar
            scrollOffset={scrollTop}
            contentLength={contentHeight}
            onScroll={(scroll: number) => setScrollTop(scroll)}
          />
        </div>
        <div className="beta"></div>
      </div>
      <HorizontalScaleScrollBar
        scrollOffset={scrollLeft}
        contentLength={contentWidth}
        onScroll={(scroll: number) => setScrollLeft(scroll)}
        onClickScaleUp={onClickScaleUp}
        onClickScaleDown={onClickScaleDown}
        onClickScaleReset={onClickScaleReset}
      />
    </div>
  )
}

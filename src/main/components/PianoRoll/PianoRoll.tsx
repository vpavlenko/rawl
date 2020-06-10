import React, { StatelessComponent } from "react"
import styled from "styled-components"
import { NoteCoordTransform } from "common/transform"
import { HorizontalScaleScrollBar } from "components/inputs/ScaleScrollBar"
import { VerticalScrollBar } from "components/inputs/ScrollBar"
import { PianoNotesMouseEvent } from "./PianoNotes/PianoNotes"
import { ControlPaneWrapper } from "main/containers/PianoRollEditor/PianoRoll/ControlPane"
import { PianoRollStage } from "main/containers/PianoRollEditor/PianoRoll/PianoRollStage"
import SplitPane from "react-split-pane"

import "./PianoRoll.css"

const SCROLL_KEY_SPEED = 4

export interface PianoNotesMouseHandler {
  onMouseDown(e: PianoNotesMouseEvent): void
  onMouseMove(e: PianoNotesMouseEvent): void
  onMouseUp(e: PianoNotesMouseEvent): void
}

const Parent = styled.div`
  flex-grow: 1;
  background: var(--background-color);

  .ScrollBar {
    z-index: 10;
  }
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

const Alpha = styled.div`
  flex-grow: 1;
  position: relative;
  overflow: hidden;

  .alphaContent {
    position: absolute;
    top: 0;
    left: 0;
  }
`

const Beta = styled.div`
  border-top: 1px solid var(--secondary-text-color);
  height: 100%;
`

export interface PianoRollProps {
  transform: NoteCoordTransform
  endTick: number
  alphaHeight: number
  scrollLeft: number
  scrollTop: number
  setScrollLeft: (scroll: number) => void
  setScrollTop: (scroll: number) => void
  width: number
  onClickScaleUp: () => void
  onClickScaleDown: () => void
  onClickScaleReset: () => void
}

export const PianoRoll: StatelessComponent<PianoRollProps> = ({
  transform,
  endTick: trackEndTick,
  alphaHeight,
  scrollLeft,
  scrollTop,
  setScrollLeft,
  setScrollTop,
  width,
  onClickScaleUp,
  onClickScaleDown,
  onClickScaleReset,
}) => {
  const startTick = scrollLeft / transform.pixelsPerTick
  const widthTick = transform.getTicks(width)
  const endTick = startTick + widthTick

  const contentWidth = Math.max(trackEndTick, endTick) * transform.pixelsPerTick
  const contentHeight = transform.getMaxY()

  function clampScroll(maxOffset: number, scroll: number) {
    return Math.floor(Math.min(maxOffset, Math.max(0, scroll)))
  }

  scrollLeft = clampScroll(contentWidth - width, scrollLeft)
  scrollTop = clampScroll(contentHeight - alphaHeight, scrollTop)

  return (
    <Parent>
      <Content>
        <SplitPane split="horizontal" minSize={50} defaultSize={"60%"}>
          <Alpha
            onWheel={(e) => {
              const scrollLineHeight = transform.pixelsPerKey * SCROLL_KEY_SPEED
              const delta = scrollLineHeight * (e.deltaY > 0 ? 1 : -1)
              setScrollTop(scrollTop + delta)
            }}
          >
            <PianoRollStage width={width} />
            <VerticalScrollBar
              scrollOffset={scrollTop}
              contentLength={contentHeight}
              onScroll={setScrollTop}
            />
          </Alpha>
          <Beta>
            <ControlPaneWrapper />
          </Beta>
        </SplitPane>
      </Content>
      <HorizontalScaleScrollBar
        scrollOffset={scrollLeft}
        contentLength={contentWidth}
        onScroll={setScrollLeft}
        onClickScaleUp={onClickScaleUp}
        onClickScaleDown={onClickScaleDown}
        onClickScaleReset={onClickScaleReset}
      />
    </Parent>
  )
}

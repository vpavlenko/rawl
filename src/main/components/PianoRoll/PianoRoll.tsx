import React, { FC, useState, useCallback, useRef } from "react"
import styled from "styled-components"
import SplitPane from "react-split-pane"
import useComponentSize from "@rehooks/component-size"
import { NoteCoordTransform } from "common/transform"
import { HorizontalScaleScrollBar } from "components/inputs/ScaleScrollBar"
import { VerticalScrollBar } from "components/inputs/ScrollBar"
import { ControlPaneWrapper } from "main/containers/PianoRollEditor/PianoRoll/ControlPane"
import {
  PianoRollStage,
  PianoNotesMouseEvent,
} from "main/containers/PianoRollEditor/PianoRoll/PianoRollStage"
import { ISize } from "common/geometry"

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
  border-top: 1px solid var(--divider-color);
  height: 100%;
`

export interface PianoRollProps {
  transform: NoteCoordTransform
  endTick: number
  scrollLeft: number
  scrollTop: number
  size: ISize
  setScrollLeft: (scroll: number) => void
  setScrollTop: (scroll: number) => void
  onClickScaleUp: () => void
  onClickScaleDown: () => void
  onClickScaleReset: () => void
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export const PianoRoll: FC<PianoRollProps> = ({
  transform,
  endTick: trackEndTick,
  scrollLeft,
  scrollTop,
  size,
  setScrollLeft,
  setScrollTop,
  onClickScaleUp,
  onClickScaleDown,
  onClickScaleReset,
}) => {
  const startTick = scrollLeft / transform.pixelsPerTick
  const widthTick = transform.getTicks(size.width)
  const endTick = startTick + widthTick

  const contentWidth = Math.max(trackEndTick, endTick) * transform.pixelsPerTick
  const contentHeight = transform.getMaxY()

  const alphaRef = useRef(null)
  const { height: alphaHeight = 0 } = useComponentSize(alphaRef)

  const clampScrollLeft = (scroll: number) =>
    Math.floor(clamp(scroll, 0, contentWidth - size.width))

  const clampScrollTop = (scroll: number) =>
    Math.floor(clamp(scroll, 0, contentHeight - alphaHeight))

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      const scrollLineHeight = transform.pixelsPerKey * SCROLL_KEY_SPEED
      const delta = scrollLineHeight * (e.deltaY > 0 ? 1 : -1)
      const scroll = scrollTop + delta
      setScrollTop(clampScrollTop(scroll))
    },
    [scrollTop, setScrollTop, transform]
  )

  scrollLeft = clampScrollLeft(scrollLeft)
  scrollTop = clampScrollTop(scrollTop)

  return (
    <Parent>
      <Content>
        <SplitPane split="horizontal" minSize={50} defaultSize={"60%"}>
          <Alpha onWheel={onWheel} ref={alphaRef}>
            <PianoRollStage width={size.width} />
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

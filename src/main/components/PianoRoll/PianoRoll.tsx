import React, { FC, useCallback, useRef, useEffect } from "react"
import { useObserver } from "mobx-react-lite"
import { withSize } from "react-sizeme"
import { useTheme } from "main/hooks/useTheme"
import { useStores } from "main/hooks/useStores"
import styled from "styled-components"
import SplitPane from "react-split-pane"
import useComponentSize from "@rehooks/component-size"
import { NoteCoordTransform } from "common/transform"
import { HorizontalScaleScrollBar } from "components/inputs/ScaleScrollBar"
import { VerticalScrollBar } from "components/inputs/ScrollBar"
import {
  PianoRollStage,
  PianoNotesMouseEvent,
} from "main/components/PianoRoll/PianoRollStage"
import { ISize } from "common/geometry"
import ControlPane from "../ControlPane/ControlPane"

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
  position: relative;
  height: calc(100% - 17px);
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

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export interface PianoRollWrapperProps {
  size: ISize
}

const PianoRollWrapper: FC<PianoRollWrapperProps> = ({ size }) => {
  const { rootStore } = useStores()
  const {
    trackEndTick,
    isPlaying,
    playerPosition,
    scaleX,
    scrollLeft,
    scrollTop,
    autoScroll,
    s,
  } = useObserver(() => ({
    trackEndTick: rootStore.song.endOfSong,
    isPlaying: rootStore.services.player.isPlaying,
    playerPosition: rootStore.services.player.position,
    s: rootStore.pianoRollStore,
    scaleX: rootStore.pianoRollStore.scaleX,
    scrollLeft: rootStore.pianoRollStore.scrollLeft,
    scrollTop: rootStore.pianoRollStore.scrollTop,
    autoScroll: rootStore.pianoRollStore.autoScroll,
  }))

  const theme = useTheme()
  const transform = new NoteCoordTransform(0.1 * scaleX, theme.keyHeight, 127)

  useEffect(() => {
    // keep scroll position to cursor
    if (autoScroll && isPlaying) {
      const x = transform.getX(playerPosition)
      const screenX = x - scrollLeft
      if (screenX > size.width * 0.7 || screenX < 0) {
        s.scrollLeft = x
      }
    }
  }, [autoScroll, isPlaying, scaleX, scrollLeft, playerPosition, size])

  const setScrollLeft = useCallback((v) => (s.scrollLeft = v), [scrollLeft])
  const setScrollTop = useCallback((v) => (s.scrollTop = v), [scrollTop])
  const onClickScaleUp = useCallback(() => (s.scaleX = scaleX + 0.1), [scaleX])
  const onClickScaleDown = useCallback(
    () => (s.scaleX = Math.max(0.05, scaleX - 0.1)),
    [scaleX]
  )
  const onClickScaleReset = useCallback(() => (s.scaleX = 1), [scaleX])

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

  const _scrollLeft = clampScrollLeft(scrollLeft)
  const _scrollTop = clampScrollTop(scrollTop)

  return (
    <Parent>
      <Content>
        <SplitPane split="horizontal" minSize={50} defaultSize={"60%"}>
          <Alpha onWheel={onWheel} ref={alphaRef}>
            <PianoRollStage width={size.width} />
            <VerticalScrollBar
              scrollOffset={_scrollTop}
              contentLength={contentHeight}
              onScroll={setScrollTop}
            />
          </Alpha>
          <Beta>
            <ControlPane />
          </Beta>
        </SplitPane>
      </Content>
      <HorizontalScaleScrollBar
        scrollOffset={_scrollLeft}
        contentLength={contentWidth}
        onScroll={setScrollLeft}
        onClickScaleUp={onClickScaleUp}
        onClickScaleDown={onClickScaleDown}
        onClickScaleReset={onClickScaleReset}
      />
    </Parent>
  )
}

export default withSize({ monitorHeight: true })(PianoRollWrapper)

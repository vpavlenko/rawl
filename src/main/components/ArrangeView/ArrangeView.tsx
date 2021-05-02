import useComponentSize from "@rehooks/component-size"
import Color from "color"
import { partition } from "lodash"
import cloneDeep from "lodash/cloneDeep"
import { observer } from "mobx-react-lite"
import { FC, useCallback, useEffect, useRef, useState } from "react"
import styled from "styled-components"
import {
  containsPoint,
  IPoint,
  pointAdd,
  pointSub,
  zeroRect,
} from "../../../common/geometry"
import {
  arrangeEndSelection,
  arrangeMoveSelection,
  arrangeResizeSelection,
  arrangeStartSelection,
  setPlayerPosition,
} from "../../actions"
import { Layout } from "../../Constants"
import { useContextMenu } from "../../hooks/useContextMenu"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import { GLCanvas } from "../GLCanvas/GLCanvas"
import { HorizontalScaleScrollBar } from "../inputs/ScaleScrollBar"
import { BAR_WIDTH, VerticalScrollBar } from "../inputs/ScrollBar"
import CanvasPianoRuler from "../PianoRoll/CanvasPianoRuler"
import { observeDrag } from "../PianoRoll/MouseHandler/observeDrag"
import { ArrangeContextMenu } from "./ArrangeContextMenu"
import { ArrangeViewRenderer } from "./ArrangeViewRenderer"

const Wrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  position: relative;
  background: var(--background-color);
  overflow: hidden;
`

const LeftTopSpace = styled.div`
  z-index: 999;
  position: absolute;
  width: 100%;
  box-sizing: border-box;
  border-bottom: 1px solid var(--divider-color);
  background: var(--background-color);
`

const LeftBottomSpace = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  background: var(--background-color);
`

const TrackHeader = styled.div`
  width: 8rem;
  padding: 0 0.5rem;
  box-sizing: border-box;
  display: flex;
  border-bottom: 1px solid var(--divider-color);
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const HeaderList = styled.div`
  position: relative;
  border-right: 1px solid var(--divider-color);
`

export const ArrangeView: FC = observer(() => {
  const rootStore = useStores()

  const tracks = rootStore.song.tracks.filter((t) => !t.isConductorTrack)

  const { arrangeViewStore: s } = rootStore

  const ref = useRef(null)
  const size = useComponentSize(ref)

  const {
    notes,
    cursorX,
    selection,
    mappedBeats,
    selectionRect,
    trackHeight,
    contentWidth,
    transform,
    scrollLeft,
    scrollTop,
  } = rootStore.arrangeViewStore

  const setScrollLeft = useCallback(
    (v: number) => rootStore.arrangeViewStore.setScrollLeft(v),
    []
  )
  const _setScrollTop = useCallback(
    (v: number) => (rootStore.arrangeViewStore.scrollTop = v),
    []
  )

  const containerWidth = size.width
  const containerHeight = size.height
  const contentHeight = trackHeight * tracks.length

  const theme = useTheme()

  useEffect(() => {
    rootStore.arrangeViewStore.canvasWidth = size.width
  }, [size.width])

  const onClickScaleUp = useCallback(() => (s.scaleX += 0.1), [s])
  const onClickScaleDown = useCallback(
    () => (s.scaleX = Math.max(0.05, s.scaleX - 0.1)),
    [s]
  )
  const onClickScaleReset = useCallback(() => (s.scaleX = 1), [s])

  const setScrollTop = useCallback(
    (scroll: number) => {
      const maxOffset = Math.max(
        0,
        contentHeight + Layout.rulerHeight + BAR_WIDTH - containerHeight
      )
      _setScrollTop(Math.floor(Math.min(maxOffset, Math.max(0, scroll))))
    },
    [contentHeight, containerHeight, _setScrollTop]
  )

  const handleLeftClick = useCallback(
    (e: React.MouseEvent, createPoint: (e: MouseEvent) => IPoint) => {
      const startPos = createPoint(e.nativeEvent)
      const isSelectionSelected =
        selection != null && containsPoint(selection, startPos)

      const createSelectionHandler = (
        e: MouseEvent,
        mouseMove: (handler: (e: MouseEvent) => void) => void,
        mouseUp: (handler: (e: MouseEvent) => void) => void
      ) => {
        arrangeStartSelection(rootStore)(startPos)

        if (!rootStore.services.player.isPlaying) {
          setPlayerPosition(rootStore)(startPos.x)
        }

        mouseMove((e) => {
          arrangeResizeSelection(rootStore)(startPos, createPoint(e))
        })
        mouseUp((e) => {
          arrangeEndSelection(rootStore)(startPos, createPoint(e))
        })
      }

      const dragSelectionHandler = (
        e: MouseEvent,
        mouseMove: (handler: (e: MouseEvent) => void) => void,
        mouseUp: (handler: (e: MouseEvent) => void) => void
      ) => {
        if (selection === null) {
          return
        }
        const startSelection = cloneDeep(selection)
        mouseMove((e) => {
          const delta = pointSub(createPoint(e), startPos)
          const pos = pointAdd(startSelection, delta)
          arrangeMoveSelection(rootStore)(pos)
        })
        mouseUp((e) => {})
      }

      let handler

      if (isSelectionSelected) {
        handler = dragSelectionHandler
      } else {
        handler = createSelectionHandler
      }

      let mouseMove: (e: MouseEvent) => void
      let mouseUp: (e: MouseEvent) => void
      handler(
        e.nativeEvent,
        (fn) => (mouseMove = fn),
        (fn) => (mouseUp = fn)
      )

      observeDrag({
        onMouseMove: (e) => mouseMove(e),
        onMouseUp: (e) => mouseUp(e),
      })
    },
    [selection, rootStore]
  )

  const handleMiddleClick = useCallback(
    (e: React.MouseEvent) => {
      function createPoint(e: MouseEvent) {
        return { x: e.clientX, y: e.clientY }
      }
      const startPos = createPoint(e.nativeEvent)

      observeDrag({
        onMouseMove(e) {
          const pos = createPoint(e)
          const delta = pointSub(pos, startPos)
          setScrollLeft(Math.max(0, scrollLeft - delta.x))
          setScrollTop(Math.max(0, scrollTop - delta.y))
        },
      })
    },
    [scrollLeft, scrollTop]
  )

  const { onContextMenu, menuProps } = useContextMenu()

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const { left, top } = e.currentTarget.getBoundingClientRect()

      function createPoint(e: MouseEvent) {
        const x = e.pageX - left + scrollLeft
        const y = e.pageY - top - Layout.rulerHeight + scrollTop
        const tick = transform.getTicks(x)
        return { x: tick, y: y / trackHeight }
      }

      switch (e.button) {
        case 0:
          handleLeftClick(e, createPoint)
          break
        case 1:
          handleMiddleClick(e)
          break
        case 2:
          onContextMenu(e)
          break
        default:
          break
      }
    },
    [
      scrollLeft,
      scrollTop,
      transform,
      handleLeftClick,
      handleMiddleClick,
      onContextMenu,
    ]
  )

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      const scrollLineHeight = trackHeight
      const delta = scrollLineHeight * (e.deltaY > 0 ? 1 : -1)
      setScrollTop(scrollTop + delta)
    },
    [scrollTop]
  )

  const [renderer, setRenderer] = useState<ArrangeViewRenderer | null>(null)

  useEffect(() => {
    if (renderer === null) {
      return
    }

    const [highlightedBeats, nonHighlightedBeats] = partition(
      mappedBeats,
      (b) => b.beat === 0
    )

    renderer.theme = theme
    renderer.render(
      cursorX,
      notes,
      selectionRect ?? zeroRect,
      nonHighlightedBeats.map((b) => b.x),
      highlightedBeats.map((b) => b.x),
      tracks.map((_, i) => trackHeight * (i + 1) - 1),
      { x: scrollLeft, y: scrollTop }
    )
  }, [
    renderer,
    tracks.length,
    scrollLeft,
    scrollTop,
    cursorX,
    notes,
    mappedBeats,
    selectionRect,
  ])

  return (
    <Wrapper>
      <HeaderList>
        <LeftTopSpace style={{ height: Layout.rulerHeight }} />
        <div
          style={{
            marginTop: Layout.rulerHeight,
            transform: `translateY(${-scrollTop}px)`,
          }}
        >
          {tracks.map((t, i) => (
            <TrackHeader style={{ height: trackHeight }} key={i}>
              {t.displayName}
            </TrackHeader>
          ))}
        </div>
        <LeftBottomSpace style={{ height: BAR_WIDTH }} />
      </HeaderList>
      <div
        ref={ref}
        onMouseDown={onMouseDown}
        onContextMenu={useCallback((e) => e.preventDefault(), [])}
        onWheel={onWheel}
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          position: "relative",
          overflow: "hidden",
          background: Color(theme.backgroundColor).darken(0.1).hex(),
        }}
      >
        <CanvasPianoRuler
          width={containerWidth}
          beats={mappedBeats}
          scrollLeft={scrollLeft}
          pixelsPerTick={transform.pixelsPerTick}
          style={{
            background: theme.backgroundColor,
            borderBottom: `1px solid ${theme.dividerColor}`,
            boxSizing: "border-box",
          }}
        />
        <GLCanvas
          style={{ pointerEvents: "none" }}
          onCreateContext={useCallback(
            (gl) => setRenderer(new ArrangeViewRenderer(gl)),
            []
          )}
          width={containerWidth}
          height={contentHeight}
        />
        <div
          style={{
            width: `calc(100% - ${BAR_WIDTH}px)`,
            position: "absolute",
            bottom: 0,
          }}
        >
          <HorizontalScaleScrollBar
            scrollOffset={scrollLeft}
            contentLength={contentWidth}
            onScroll={setScrollLeft}
            onClickScaleUp={onClickScaleUp}
            onClickScaleDown={onClickScaleDown}
            onClickScaleReset={onClickScaleReset}
          />
        </div>
      </div>
      <div
        style={{
          height: `calc(100% - ${BAR_WIDTH}px)`,
          position: "absolute",
          top: 0,
          right: 0,
        }}
      >
        <VerticalScrollBar
          scrollOffset={scrollTop}
          contentLength={contentHeight + Layout.rulerHeight}
          onScroll={_setScrollTop}
        />
      </div>
      <div
        style={{
          width: BAR_WIDTH,
          height: BAR_WIDTH,
          position: "absolute",
          bottom: 0,
          right: 0,
          background: theme.backgroundColor,
        }}
      />
      <ArrangeContextMenu {...menuProps} />
    </Wrapper>
  )
})

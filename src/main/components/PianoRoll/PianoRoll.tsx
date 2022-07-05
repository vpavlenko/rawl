import styled from "@emotion/styled"
import useComponentSize from "@rehooks/component-size"
import SplitPane from "@ryohey/react-split-pane"
import { clamp } from "lodash"
import { observer } from "mobx-react-lite"
import { FC, useCallback, useRef } from "react"
import { Layout, WHEEL_SCROLL_RATE } from "../../Constants"
import { isTouchPadEvent } from "../../helpers/touchpad"
import { useStores } from "../../hooks/useStores"
import ControlPane from "../ControlPane/ControlPane"
import EventList from "../EventEditor/EventList"
import {
  HorizontalScaleScrollBar,
  VerticalScaleScrollBar,
} from "../inputs/ScaleScrollBar"
import { PianoRollStage } from "./PianoRollStage"

const Parent = styled.div`
  flex-grow: 1;
  background: ${({ theme }) => theme.backgroundColor};
  position: relative;

  .ScrollBar {
    z-index: 10;
  }
`

const Alpha = styled.div`
  flex-grow: 1;
  position: relative;

  .alphaContent {
    position: absolute;
    top: 0;
    left: 0;
  }
`

const Beta = styled.div`
  border-top: 1px solid ${({ theme }) => theme.dividerColor};
  height: calc(100% - 17px);
`

const StyledSplitPane = styled(SplitPane)`
  .Resizer {
    background: #000;
    opacity: 0.2;
    z-index: 1;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    -moz-background-clip: padding;
    -webkit-background-clip: padding;
    background-clip: padding-box;
  }

  .Resizer:hover {
    transition: all 0.2s ease;
  }

  .Resizer.horizontal {
    height: 11px;
    margin: -5px 0;
    border-top: 5px solid rgba(255, 255, 255, 0);
    border-bottom: 5px solid rgba(255, 255, 255, 0);
    cursor: row-resize;
    width: 100%;
  }

  .Resizer.horizontal:hover {
    border-top: 5px solid rgba(255, 255, 255, 0.5);
    border-bottom: 5px solid rgba(255, 255, 255, 0.5);
  }

  .Resizer.vertical {
    width: 11px;
    margin: 0 -5px;
    border-left: 5px solid rgba(255, 255, 255, 0);
    border-right: 5px solid rgba(255, 255, 255, 0);
    cursor: col-resize;
  }

  .Resizer.vertical:hover {
    border-left: 5px solid rgba(255, 255, 255, 0.5);
    border-right: 5px solid rgba(255, 255, 255, 0.5);
  }

  .Resizer.disabled {
    cursor: not-allowed;
  }

  .Resizer.disabled:hover {
    border-color: transparent;
  }
`

const PianoRollWrapper: FC = observer(() => {
  const rootStore = useStores()

  const s = rootStore.pianoRollStore
  const {
    scaleX,
    scaleY,
    scrollLeft,
    scrollTop,
    transform,
    contentWidth,
    contentHeight,
  } = rootStore.pianoRollStore

  const ref = useRef(null)
  const size = useComponentSize(ref)

  const alphaRef = useRef(null)
  const { height: alphaHeight = 0 } = useComponentSize(alphaRef)

  const onClickScaleUpHorizontal = useCallback(
    () => s.scaleAroundPointX(0.2, Layout.keyWidth),
    [scaleX, s]
  )
  const onClickScaleDownHorizontal = useCallback(
    () => s.scaleAroundPointX(-0.2, Layout.keyWidth),
    [scaleX, s]
  )
  const onClickScaleResetHorizontal = useCallback(() => (s.scaleX = 1), [s])

  const onClickScaleUpVertical = useCallback(
    () => s.scaleAroundPointY(0.2, 0),
    [scaleY, s]
  )
  const onClickScaleDownVertical = useCallback(
    () => s.scaleAroundPointY(-0.2, 0),
    [scaleY, s]
  )
  const onClickScaleResetVertical = useCallback(() => (s.scaleY = 1), [s])

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.shiftKey && (e.altKey || e.ctrlKey)) {
        // vertical zoom
        let scaleYDelta = isTouchPadEvent(e.nativeEvent)
          ? 0.02 * e.deltaY
          : 0.01 * e.deltaX
        scaleYDelta = clamp(scaleYDelta, -0.15, 0.15) // prevent acceleration to zoom too fast
        s.scaleAroundPointY(scaleYDelta, e.nativeEvent.offsetY)
      } else if (e.altKey || e.ctrlKey) {
        // horizontal zoom
        const scaleFactor = isTouchPadEvent(e.nativeEvent) ? 0.01 : -0.01
        const scaleXDelta = clamp(e.deltaY * scaleFactor, -0.15, 0.15) // prevent acceleration to zoom too fast
        s.scaleAroundPointX(scaleXDelta, e.nativeEvent.offsetX)
      } else {
        // scrolling
        const scaleFactor = isTouchPadEvent(e.nativeEvent)
          ? 1
          : transform.pixelsPerKey * WHEEL_SCROLL_RATE
        const deltaY = e.deltaY * scaleFactor
        s.scrollBy(-e.deltaX, -deltaY)
      }
    },
    [s, transform]
  )

  return (
    <Parent ref={ref}>
      <StyledSplitPane split="horizontal" minSize={50} defaultSize={"60%"}>
        <Alpha onWheel={onWheel} ref={alphaRef}>
          <PianoRollStage width={size.width} height={alphaHeight} />
          <VerticalScaleScrollBar
            scrollOffset={scrollTop}
            contentLength={contentHeight}
            onScroll={useCallback((v: any) => s.setScrollTopInPixels(v), [s])}
            onClickScaleUp={onClickScaleUpVertical}
            onClickScaleDown={onClickScaleDownVertical}
            onClickScaleReset={onClickScaleResetVertical}
          />
        </Alpha>
        <Beta>
          <ControlPane />
        </Beta>
      </StyledSplitPane>
      <HorizontalScaleScrollBar
        scrollOffset={scrollLeft}
        contentLength={contentWidth}
        onScroll={useCallback((v: any) => s.setScrollLeftInPixels(v), [s])}
        onClickScaleUp={onClickScaleUpHorizontal}
        onClickScaleDown={onClickScaleDownHorizontal}
        onClickScaleReset={onClickScaleResetHorizontal}
      />
    </Parent>
  )
})

export default observer(() => {
  const { pianoRollStore } = useStores()

  if (pianoRollStore.showEventList) {
    return (
      <div style={{ display: "flex", flexGrow: 1, position: "relative" }}>
        <StyledSplitPane
          split="vertical"
          minSize={50}
          defaultSize={"20%"}
          style={{ display: "flex" }}
          pane2Style={{ display: "flex" }}
        >
          <EventList />
          <PianoRollWrapper />
        </StyledSplitPane>
      </div>
    )
  }
  return <PianoRollWrapper />
})

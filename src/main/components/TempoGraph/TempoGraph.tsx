import { Container, Stage as PixiStage } from "@inlet/react-pixi"
import useComponentSize from "@rehooks/component-size"
import { SetTempoEvent } from "midifile-ts"
import { observer } from "mobx-react-lite"
import { FC, useCallback, useEffect, useRef } from "react"
import styled from "styled-components"
import { bpmToUSecPerBeat, uSecPerBeatToBPM } from "../../../common/helpers/bpm"
import { TrackEvent } from "../../../common/track"
import {
  changeTempo as _changeTempo,
  createTempo as _createTempo,
} from "../../actions"
import { Layout } from "../../Constants"
import { StoreContext, useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import { BAR_WIDTH, HorizontalScrollBar } from "../inputs/ScrollBar"
import { observeDrag } from "../PianoRoll/MouseHandler/observeDrag"
import PianoCursor from "../PianoRoll/PianoCursor"
import PianoGrid from "../PianoRoll/PianoGrid"
import PianoRuler from "../PianoRoll/PianoRuler"
import Stage, { StageMouseEvent } from "../Stage/Stage"
import { HorizontalLines } from "./HorizontalLines"
import { TempoGraphAxis } from "./TempoGraphAxis"
import TempoGraphItem from "./TempoGraphItem"

type DisplayEvent = TrackEvent & SetTempoEvent

const Wrapper = styled.div`
  position: relative;
  flex-grow: 1;
  background: var(--background-color);
  color: var(--secondary-text-color);

  .HorizontalLines,
  .Graph {
    position: absolute;
    top: var(--ruler-height);
    pointer-events: none;
    margin-left: var(--key-width);
  }

  .Graph {
    pointer-events: all;
  }
`

export const TempoGraph: FC = observer(() => {
  const rootStore = useStores()

  const {
    mappedBeats,
    items,
    transform,
    scrollLeft: _scrollLeft,
    cursorX,
    contentWidth,
  } = rootStore.tempoEditorStore

  const ref = useRef(null)
  const size = useComponentSize(ref)

  const setScrollLeft = useCallback(
    (x: number) => (rootStore.tempoEditorStore.scrollLeft = x),
    []
  )
  const theme = useTheme()

  const changeTempo = _changeTempo(rootStore)
  const createTempo = _createTempo(rootStore)

  const scrollLeft = Math.floor(_scrollLeft)

  const containerWidth = size.width
  const containerHeight = size.height

  const contentHeight = containerHeight - Layout.rulerHeight - BAR_WIDTH

  useEffect(() => {
    rootStore.tempoEditorStore.canvasWidth = containerWidth
    rootStore.tempoEditorStore.canvasHeight = contentHeight
  }, [containerWidth, contentHeight])

  useEffect(() => {
    rootStore.tempoEditorStore.theme = theme
  }, [theme])

  function onMouseDownGraph(e: StageMouseEvent<MouseEvent, TempoGraphItem>) {
    const item = e.item
    if (!item) {
      return
    }

    const event = items.filter((ev) => ev.id === item.id)[0]
    const bpm = uSecPerBeatToBPM(event.microsecondsPerBeat)
    const startY = e.nativeEvent.clientY

    observeDrag({
      onMouseMove: (e) => {
        const delta = transform.getDeltaBPM(e.clientY - startY)
        changeTempo(event.id, bpmToUSecPerBeat(bpm + delta))
      },
    })
  }

  function onWheelGraph(e: StageMouseEvent<WheelEvent, TempoGraphItem>) {
    const item = e.item
    if (!item) {
      return
    }
    const event = items.filter((ev) => ev.id === item.id)[0]
    const movement = e.nativeEvent.deltaY > 0 ? -1 : 1
    const bpm = uSecPerBeatToBPM(event.microsecondsPerBeat)
    changeTempo(event.id, bpmToUSecPerBeat(bpm + movement))
  }

  function onDoubleClickGraph(e: StageMouseEvent<MouseEvent, TempoGraphItem>) {
    const tick = transform.getTicks(e.local.x)
    const bpm = transform.getBPM(e.local.y)
    createTempo(tick, uSecPerBeatToBPM(bpm))
  }

  const width = containerWidth

  const canvasHeight = containerHeight - BAR_WIDTH

  return (
    <Wrapper ref={ref}>
      <PixiStage
        width={containerWidth}
        height={canvasHeight}
        style={{ position: "absolute" }}
        options={{ backgroundAlpha: 0, autoDensity: true, antialias: true }}
      >
        <StoreContext.Provider value={rootStore}>
          <Container x={Layout.keyWidth}>
            <Container x={-scrollLeft} y={Layout.rulerHeight}>
              <PianoGrid height={canvasHeight} beats={mappedBeats} />
              <Container x={cursorX}>
                <PianoCursor height={canvasHeight} />
              </Container>
            </Container>
            <PianoRuler
              width={width}
              beats={mappedBeats}
              scrollLeft={scrollLeft}
              pixelsPerTick={transform.pixelsPerTick}
            />
          </Container>
        </StoreContext.Provider>
      </PixiStage>
      <HorizontalLines
        width={width}
        height={contentHeight}
        transform={transform}
        borderColor={theme.dividerColor}
      />
      <Stage
        className="Graph"
        items={items}
        width={width}
        height={contentHeight}
        onMouseDown={onMouseDownGraph}
        onDoubleClick={onDoubleClickGraph}
        onWheel={onWheelGraph}
        scrollLeft={scrollLeft}
      />
      <TempoGraphAxis
        width={Layout.keyWidth}
        offset={Layout.rulerHeight}
        transform={transform}
      />
      <HorizontalScrollBar
        scrollOffset={scrollLeft}
        contentLength={contentWidth}
        onScroll={setScrollLeft}
      />
    </Wrapper>
  )
})

import { Container, Stage as PixiStage } from "@inlet/react-pixi"
import useComponentSize from "@rehooks/component-size"
import Color from "color"
import { SetTempoEvent } from "midifile-ts"
import { toJS } from "mobx"
import { useObserver } from "mobx-react-lite"
import React, { FC, useEffect, useRef, useState } from "react"
import styled from "styled-components"
import { bpmToUSecPerBeat, uSecPerBeatToBPM } from "../../../common/helpers/bpm"
import { createBeatsInRange } from "../../../common/helpers/mapBeats"
import { TrackEvent } from "../../../common/track"
import { TempoCoordTransform } from "../../../common/transform"
import {
  changeTempo as _changeTempo,
  createTempo as _createTempo,
  setPlayerPosition as _setPlayerPosition,
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
import transformEvents from "./transformEvents"

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

export const TempoGraph: FC = () => {
  const rootStore = useStores()
  const {
    isPlaying,
    pixelsPerTick,
    events: sourceEvents,
    endTick: trackEndTick,
    measures,
    timebase,
    autoScroll,
    playerPosition,
  } = useObserver(() => ({
    isPlaying: rootStore.services.player.isPlaying,
    pixelsPerTick: Layout.pixelsPerTick * rootStore.tempoEditorStore.scaleX,
    events:
      rootStore.song.conductorTrack !== undefined
        ? toJS(rootStore.song.conductorTrack.events)
        : [],
    endTick: rootStore.song.endOfSong,
    measures: rootStore.song.measures,
    timebase: rootStore.services.player.timebase,
    autoScroll: rootStore.tempoEditorStore.autoScroll,
    scrollLeft: rootStore.tempoEditorStore.scrollLeft,
    playerPosition: rootStore.services.player.position,
  }))

  const ref = useRef(null)
  const size = useComponentSize(ref)

  const [_scrollLeft, setScrollLeft] = useState(0)

  useEffect(() => {
    // keep scroll position to cursor
    if (autoScroll && isPlaying) {
      const transform = new TempoCoordTransform(pixelsPerTick, size.height)
      const x = transform.getX(playerPosition)
      const screenX = x - _scrollLeft
      if (screenX > size.width * 0.7 || screenX < 0) {
        setScrollLeft(x)
      }
    }
  }, [
    autoScroll,
    isPlaying,
    _scrollLeft,
    size.width,
    pixelsPerTick,
    playerPosition,
  ])

  const theme = useTheme()

  const changeTempo = _changeTempo(rootStore)
  const createTempo = _createTempo(rootStore)
  const setPlayerPosition = _setPlayerPosition(rootStore)

  const events = sourceEvents.filter(
    (e) => (e as any).subtype === "setTempo"
  ) as DisplayEvent[]
  const scrollLeft = Math.floor(_scrollLeft)

  const containerWidth = size.width
  const containerHeight = size.height

  const contentHeight = containerHeight - Layout.rulerHeight - BAR_WIDTH
  const transform = new TempoCoordTransform(pixelsPerTick, contentHeight)
  const startTick = scrollLeft / pixelsPerTick
  const widthTick = transform.getTicks(containerWidth)
  const endTick = startTick + widthTick
  const contentWidth = Math.max(trackEndTick, endTick) * pixelsPerTick

  const items = transformEvents(
    events,
    transform,
    contentWidth,
    theme.themeColor,
    Color(theme.themeColor).alpha(0.1).string()
  )

  function onMouseDownGraph(e: StageMouseEvent<MouseEvent, TempoGraphItem>) {
    const item = e.item
    if (!item) {
      return
    }

    const event = events.filter((ev) => ev.id === item.id)[0]
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
    const event = events.filter((ev) => ev.id === item.id)[0]
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

  const mappedBeats = createBeatsInRange(
    measures,
    pixelsPerTick,
    timebase,
    startTick,
    width
  )

  const canvasHeight = containerHeight - BAR_WIDTH

  return (
    <Wrapper ref={ref}>
      <PixiStage
        width={containerWidth}
        height={canvasHeight}
        style={{ position: "absolute" }}
        options={{ transparent: true, autoDensity: true, antialias: true }}
      >
        <StoreContext.Provider value={rootStore}>
          <Container x={Layout.keyWidth}>
            <Container x={-scrollLeft} y={Layout.rulerHeight}>
              <PianoGrid height={canvasHeight} beats={mappedBeats} />
              <Container x={transform.getX(playerPosition)}>
                <PianoCursor height={canvasHeight} />
              </Container>
            </Container>
            <PianoRuler
              width={width}
              beats={mappedBeats}
              scrollLeft={scrollLeft}
              pixelsPerTick={pixelsPerTick}
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
}

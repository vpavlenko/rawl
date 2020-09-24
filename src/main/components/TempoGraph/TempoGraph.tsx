import { SetTempoEvent } from "midifile-ts"
import Color from "color"
import { ISize } from "common/geometry"
import { TrackEvent } from "common/track"
import { TempoCoordTransform } from "common/transform"
import { BAR_WIDTH, HorizontalScrollBar } from "components/inputs/ScrollBar"
import PianoCursor from "components/PianoRoll/PianoCursor"
import PianoGrid from "components/PianoRoll/PianoGrid"
import PianoRuler from "components/PianoRoll/PianoRuler"
import Stage, { StageMouseEvent } from "components/Stage/Stage"
import { bpmToUSecPerBeat, uSecPerBeatToBPM } from "helpers/bpm"
import { createBeatsInRange } from "helpers/mapBeats"
import _ from "lodash"
import React, { FC, useEffect, useState } from "react"
import transformEvents from "./transformEvents"
import { Stage as PixiStage } from "@inlet/react-pixi"

import TempoGraphItem from "./TempoGraphItem"
import { Container } from "@inlet/react-pixi"
import { toJS } from "mobx"
import { useObserver } from "mobx-react-lite"
import {
  changeTempo as _changeTempo,
  setPlayerPosition as _setPlayerPosition,
  createTempo as _createTempo,
} from "../../actions"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import { withSize } from "react-sizeme"
import { HorizontalLines } from "./HorizontalLines"
import { TempoGraphAxis } from "./TempoGraphAxis"
import styled from "styled-components"

type DisplayEvent = TrackEvent & SetTempoEvent

interface TempoGraphProps {
  size: ISize
}

const Wrapper = styled.div`
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

const _TempoGraph: FC<TempoGraphProps> = ({ size }) => {
  const { rootStore } = useStores()

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
    pixelsPerTick: 0.1 * rootStore.tempoEditorStore.scaleX,
    events:
      rootStore.song.conductorTrack !== undefined
        ? toJS(rootStore.song.conductorTrack.events)
        : [],
    endTick: rootStore.song.endOfSong,
    measures: rootStore.song.measures,
    timebase: rootStore.services.player.timebase,
    autoScroll: rootStore.tempoEditorStore.autoScroll,
    scrollLeft: rootStore.tempoEditorStore.scrollLeft,
    playerPosition: rootStore.playerStore.position,
  }))

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

  const { keyWidth, rulerHeight } = theme

  const containerWidth = size.width
  const containerHeight = size.height

  const contentHeight = containerHeight - rulerHeight - BAR_WIDTH
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

    function onMouseMove(e: MouseEvent) {
      const delta = transform.getDeltaBPM(e.clientY - startY)
      changeTempo(event.id, bpmToUSecPerBeat(bpm + delta))
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
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
    <Wrapper>
      <PixiStage
        width={containerWidth}
        height={canvasHeight}
        style={{ position: "absolute" }}
        options={{ transparent: true }}
      >
        <Container x={keyWidth}>
          <Container x={-scrollLeft} y={rulerHeight}>
            <PianoGrid height={canvasHeight} beats={mappedBeats} />
            <Container x={transform.getX(playerPosition)}>
              <PianoCursor height={canvasHeight} />
            </Container>
          </Container>
          <PianoRuler
            width={width}
            beats={mappedBeats}
            onMouseDown={({ tick }) => setPlayerPosition(tick)}
            scrollLeft={scrollLeft}
            pixelsPerTick={pixelsPerTick}
          />
        </Container>
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
        width={keyWidth}
        offset={rulerHeight}
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

export const TempoGraph = withSize({ monitorHeight: true })(_TempoGraph)

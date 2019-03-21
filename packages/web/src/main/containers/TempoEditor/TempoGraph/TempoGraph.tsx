import { SetTempoEvent } from "@signal-app/midifile-ts"
import Color from "color"
import { ISize } from "common/geometry"
import { Beat } from "common/measure"
import Player from "common/player/Player"
import Theme from "common/theme/Theme"
import Track, { TrackEvent } from "common/track"
import { TempoCoordTransform, NoteCoordTransform } from "common/transform"
import DrawCanvas from "components/DrawCanvas"
import { BAR_WIDTH, HorizontalScrollBar } from "components/inputs/ScrollBar"
import Stage, { ItemEvent } from "components/Stage/Stage"
import PianoCursor from "containers/PianoRollEditor/PianoRoll/PianoCursor"
import PianoGrid from "containers/PianoRollEditor/PianoRoll/PianoGrid"
import PianoRuler from "containers/PianoRollEditor/PianoRoll/PianoRuler"
import { bpmToUSecPerBeat, uSecPerBeatToBPM } from "helpers/bpm"
import mapBeats from "helpers/mapBeats"
import _ from "lodash"
import { CHANGE_TEMPO, CREATE_TEMPO, SET_PLAYER_POSITION } from "main/actions"
import { inject, observer } from "mobx-react"
import React, { Component, StatelessComponent } from "react"
import sizeMe, { withSize } from "react-sizeme"
import "./TempoGraph.css"
import transformEvents from "./transformEvents"
import RootStore from "src/main/stores/RootStore"
import { compose } from "recompose"

type DisplayEvent = TrackEvent & SetTempoEvent

interface HorizontalLinesProps {
  width: number
  height: number
  transform: TempoCoordTransform
  borderColor: any
}

function HorizontalLines({
  width,
  height,
  transform,
  borderColor
}: HorizontalLinesProps) {
  if (!width) {
    return null
  }

  function draw(ctx: CanvasRenderingContext2D) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    ctx.save()
    ctx.translate(0.5, 0.5)

    ctx.strokeStyle = borderColor
    ctx.lineWidth = 1

    // 30 -> 510 を 17 分割した線
    ctx.beginPath()
    for (let i = 30; i < transform.maxBPM; i += 30) {
      const y = Math.round(transform.getY(i))

      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
    }
    ctx.stroke()
    ctx.restore()
  }

  return (
    <DrawCanvas
      draw={draw}
      width={width}
      height={height}
      className="HorizontalLines"
      onContextMenu={e => e.preventDefault()}
    />
  )
}

interface GraphAxisProps {
  width: number
  transform: TempoCoordTransform
  offset: number
}

const GraphAxis: StatelessComponent<GraphAxisProps> = ({
  width,
  transform,
  offset
}) => {
  return (
    <div className="GraphAxis" style={{ width }}>
      <div className="values">
        {_.range(30, transform.maxBPM, 30).map(t => {
          const top = Math.round(transform.getY(t)) + offset
          return (
            <div style={{ top }} key={t}>
              {t}
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface ContentProps {
  track: Track
  events: TrackEvent[]
  size: ISize
  pixelsPerTick: number
  theme: Theme
  beats: Beat[]
  playerPosition: number
  setPlayerPosition: (tick: number) => void
  endTick: number
  scrollLeft: number
  setScrollLeft: (scroll: number) => void
  changeTempo: (id: number, microsecondsPerBeat: number) => void
  createTempo: (tick: number, microsecondsPerBeat: number) => void
}

const Content: StatelessComponent<ContentProps> = ({
  track,
  events: sourceEvents,
  size,
  pixelsPerTick,
  theme,
  beats,
  playerPosition,
  setPlayerPosition,
  endTick,
  scrollLeft,
  setScrollLeft,
  changeTempo,
  createTempo
}) => {
  const events = sourceEvents.filter(
    e => (e as any).subtype === "setTempo"
  ) as DisplayEvent[]
  scrollLeft = Math.floor(scrollLeft)

  const { keyWidth, rulerHeight } = theme

  const containerWidth = size.width
  const containerHeight = size.height

  const contentHeight = containerHeight - rulerHeight - BAR_WIDTH
  const transform = new TempoCoordTransform(pixelsPerTick, contentHeight)
  const widthTick = Math.max(endTick, transform.getTicks(containerWidth))
  const contentWidth = widthTick * pixelsPerTick

  const items = transformEvents(
    events,
    transform,
    contentWidth,
    theme.themeColor,
    Color(theme.themeColor)
      .alpha(0.1)
      .string()
  )

  function onMouseDownGraph(
    e: ItemEvent & React.MouseEvent<HTMLCanvasElement>
  ) {
    const item = e.items[0]
    if (!item) {
      return
    }

    const event = events.filter(ev => ev.id === item.id)[0]
    const bpm = uSecPerBeatToBPM(event.microsecondsPerBeat)
    const startY = e.clientY

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

  function onWheelGraph(e: ItemEvent & React.WheelEvent<HTMLCanvasElement>) {
    const item = e.items[0]
    if (!item) {
      return
    }
    const event = events.filter(ev => ev.id === item.id)[0]
    const movement = e.deltaY > 0 ? -1 : 1
    const bpm = uSecPerBeatToBPM(event.microsecondsPerBeat)
    changeTempo(event.id, bpmToUSecPerBeat(bpm + movement))
  }

  function onDoubleClickGraph(e: ItemEvent) {
    const tick = transform.getTicks(e.local.x)
    const bpm = transform.getBPM(e.local.y)
    createTempo(tick, uSecPerBeatToBPM(bpm))
  }

  const startTick = scrollLeft / pixelsPerTick
  const mappedBeats = mapBeats(beats, pixelsPerTick, startTick, widthTick)
  const width = containerWidth - keyWidth

  return (
    <div className="TempoGraph">
      <PianoGrid
        theme={theme}
        width={width}
        height={contentHeight}
        scrollLeft={scrollLeft}
        beats={mappedBeats}
      />
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
      <PianoCursor
        width={width}
        height={contentHeight}
        position={transform.getX(playerPosition) - scrollLeft}
      />
      <PianoRuler
        theme={theme}
        width={width}
        height={rulerHeight}
        beats={mappedBeats}
        onMouseDown={({ tick }) => setPlayerPosition(tick)}
        scrollLeft={scrollLeft}
        pixelsPerTick={pixelsPerTick}
      />
      <GraphAxis width={keyWidth} offset={rulerHeight} transform={transform} />
      <HorizontalScrollBar
        scrollOffset={scrollLeft}
        contentLength={contentWidth}
        onScroll={setScrollLeft}
      />
    </div>
  )
}

type Props = Pick<
  ContentProps,
  | "beats"
  | "track"
  | "theme"
  | "events"
  | "setPlayerPosition"
  | "endTick"
  | "changeTempo"
  | "createTempo"
  | "size"
  | "setScrollLeft"
  | "pixelsPerTick"
> & {
  player: Player
  autoScroll: boolean
}

interface State {
  playerPosition: number
  scrollLeft: number
}

function stateful(WrappedComponent: React.StatelessComponent<ContentProps>) {
  return class extends Component<Props, State> {
    constructor(props: Props) {
      super(props)

      this.state = {
        playerPosition: props.player.position,
        scrollLeft: 0
      }
    }

    componentDidMount() {
      this.props.player.on("change-position", this.updatePosition)
    }

    componentWillUnmount() {
      this.props.player.off("change-position", this.updatePosition)
    }

    updatePosition = (tick: number) => {
      this.setState({
        playerPosition: tick
      })

      const { autoScroll, pixelsPerTick, size } = this.props

      // keep scroll position to cursor
      if (autoScroll) {
        const transform = new TempoCoordTransform(pixelsPerTick, size.height)
        const x = transform.getX(tick)
        const screenX = x - this.state.scrollLeft
        if (screenX > size.width * 0.7 || screenX < 0) {
          this.props.setScrollLeft(x)
        }
      }
    }

    render() {
      return <WrappedComponent {...this.state} {...this.props} />
    }
  }
}

export default compose(
  withSize({ monitorHeight: true }),
  inject(
    ({
      rootStore: {
        rootViewStore: { theme },
        tempoEditorStore: s,
        services: { player },
        song,
        dispatch
      }
    }: {
      rootStore: RootStore
    }) => ({
      theme,
      player,
      pixelsPerTick: 0.1 * s.scaleX,
      track: song.conductorTrack,
      events: (song.conductorTrack.events as any).toJS(),
      endTick: song.endOfSong,
      beats: song.measureList.beats,
      autoScroll: s.autoScroll,
      scrollLeft: s.scrollLeft,
      setScrollLeft: (v: number) => (s.scrollLeft = v),
      changeTempo: (id: number, microsecondsPerBeat: number) =>
        dispatch(CHANGE_TEMPO, id, microsecondsPerBeat),
      createTempo: (tick: number, microsecondsPerBeat: number) =>
        dispatch(CREATE_TEMPO, tick, microsecondsPerBeat),
      setPlayerTempo: (tick: number) => dispatch(SET_PLAYER_POSITION, tick)
    })
  ),
  observer,
  stateful
)(Content)

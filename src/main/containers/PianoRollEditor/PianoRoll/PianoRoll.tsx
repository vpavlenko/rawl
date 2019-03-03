import React, { Component, StatelessComponent, Ref, ReactElement } from "react"
import PropTypes from "prop-types"
import SplitPane from "react-split-pane"
import { observer, inject } from "mobx-react"
import sizeMe from "react-sizeme"

import mapBeats from "helpers/mapBeats"
import { NoteCoordTransform } from "common/transform"
import Theme from "common/theme/Theme"
import { show as showEventEditor } from "components/EventEditor"
import Track, { TrackEvent } from "common/track/Track"
import { Beat } from "common/measure"
import { LoopSetting } from "common/player"
import { ISize } from "common/geometry"
import SelectionModel from "common/selection/SelectionModel"

import PianoNotes from "./PianoNotes/PianoNotes"
import PencilMouseHandler from "./PianoNotes/PencilMouseHandler"
import SelectionMouseHandler from "./PianoNotes/SelectionMouseHandler"

import PianoKeys from "./PianoKeys"
import PianoGrid from "./PianoGrid"
import PianoLines from "./PianoLines"
import PianoRuler from "./PianoRuler"
import PianoSelection from "./PianoSelection"
import PianoCursor from "./PianoCursor"
import ControlPane from "./ControlPane"
import PianoControlEvents from "./PianoControlEvents"

import { VerticalScrollBar, BAR_WIDTH } from "components/inputs/ScrollBar"
import { HorizontalScaleScrollBar } from "components/inputs/ScaleScrollBar"

import "./PianoRoll.css"
import Player from "common/player/Player";
import { Dispatcher } from "main/createDispatcher";
import { SET_LOOP_BEGIN, SET_LOOP_END, SET_PLAYER_POSITION, PREVIEW_NOTE } from "main/actions";

const SCROLL_KEY_SPEED = 4

export interface PianoRollProps {
  dispatch: Dispatcher
  mouseHandler
  theme: Theme
  track: Track
  events: TrackEvent[]
  transform: NoteCoordTransform
  beats: Beat[]
  endTick: number
  mouseMode: number
  selection: SelectionModel
  alphaHeight: number
  scrollLeft: number
  scrollTop: number
  setScrollLeft: (scroll: number) => void
  setScrollTop: (scroll: number) => void
  controlMode: string
  setControlMode: (string) => void
  notesCursor: string
  cursorPosition: number
  onMountAlpha: (ref: HTMLElement) => void
  loop: LoopSetting
  setLoopBegin: (tick: number) => void
  setLoopEnd: (tick: number) => void
  size: ISize
  onClickScaleUp: () => void
  onClickScaleDown: () => void
  onClickScaleReset: () => void
  setPlayerPosition: (tick: number) => void
  previewNote: (event: any, channel: number) => void
}

const PianoRoll: StatelessComponent<PianoRollProps> = ({
  dispatch,
  mouseHandler,
  theme,
  track,
  events,
  transform,
  beats,
  endTick,
  mouseMode,
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
  onMountAlpha,
  loop,
  setLoopBegin,
  setLoopEnd,
  size,
  onClickScaleUp,
  onClickScaleDown,
  onClickScaleReset,
  setPlayerPosition,
  previewNote
}) => {
  const { keyWidth, rulerHeight } = theme

  const containerWidth = size.width

  const width = containerWidth
  const widthTick = Math.max(endTick, transform.getTicks(containerWidth))
  const startTick = scrollLeft / transform.pixelsPerTick
  const mappedBeats = mapBeats(beats, transform.pixelsPerTick, startTick, widthTick)

  const contentWidth = widthTick * transform.pixelsPerTick
  const contentHeight = transform.getMaxY()

  const cursorPositionX = transform.getX(cursorPosition)

  function clampScroll(maxOffset, scroll) {
    return Math.floor(Math.min(maxOffset, Math.max(0, scroll)))
  }

  scrollLeft = clampScroll(contentWidth - containerWidth, scrollLeft)
  scrollTop = clampScroll(contentHeight - alphaHeight, scrollTop)

  const onMouseDownRuler = (e) => {
    const tick = e.tick
    if (e.ctrlKey) {
      setLoopBegin(tick)
    } else if (e.altKey) {
      setLoopEnd(tick)
    } else {
      setPlayerPosition(tick)
    }
  }

  const onDoubleClickMark = (e, group) => {
    showEventEditor(group)
  }

  return <div className="PianoRoll">
    <SplitPane split="horizontal" defaultSize={180} primary="second">
      <div
        className="alpha"
        ref={onMountAlpha}
        onWheel={e => {
          e.preventDefault()
          const scrollLineHeight = transform.pixelsPerKey * SCROLL_KEY_SPEED
          const delta = scrollLineHeight * (e.deltaY > 0 ? 1 : -1)
          setScrollTop(scrollTop + delta)
        }}>
        <div className="alphaContent" style={{ top: -scrollTop }}>
          <PianoLines
            theme={theme}
            width={width}
            pixelsPerKey={transform.pixelsPerKey}
            numberOfKeys={transform.numberOfKeys} />
          <PianoGrid
            theme={theme}
            width={width}
            height={contentHeight}
            scrollLeft={scrollLeft}
            beats={mappedBeats} />
          <PianoNotes
            events={events}
            selectedEventIds={selection.noteIds}
            transform={transform}
            width={width}
            cursor={notesCursor}
            scrollLeft={scrollLeft}
            isDrumMode={track.isRhythmTrack}
            onMouseDown={e => mouseHandler.onMouseDown(e)}
            onMouseMove={e => mouseHandler.onMouseMove(e)}
            onMouseUp={e => mouseHandler.onMouseUp(e)}
            theme={theme} />
          <PianoSelection
            color={theme.themeColor}
            width={width}
            height={contentHeight}
            selectionBounds={selection.enabled ? selection.getBounds(transform) : null}
            scrollLeft={scrollLeft} />
          <PianoCursor
            width={width}
            height={contentHeight}
            position={cursorPositionX - scrollLeft} />
          <PianoKeys
            theme={theme}
            width={keyWidth}
            keyHeight={transform.pixelsPerKey}
            numberOfKeys={transform.numberOfKeys}
            onClickKey={noteNumber => previewNote(noteNumber, track.channel)} />
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
            pixelsPerTick={transform.pixelsPerTick} />
          <div className="PianoRollLeftSpace" />
          <PianoControlEvents
            events={events}
            width={width}
            scrollLeft={scrollLeft}
            pixelsPerTick={transform.pixelsPerTick}
            onDoubleClickMark={onDoubleClickMark}
          />
        </div>
        <VerticalScrollBar
          scrollOffset={scrollTop}
          contentLength={contentHeight}
          onScroll={({ scroll }) => setScrollTop(scroll)}
        />
      </div>
      <div className="beta">
        <ControlPane
          mode={controlMode}
          theme={theme}
          beats={mappedBeats}
          events={events}
          dispatch={dispatch}
          transform={transform}
          scrollLeft={scrollLeft}
          paddingBottom={BAR_WIDTH}
          onSelectTab={setControlMode}
        />
      </div>
    </SplitPane>
    <HorizontalScaleScrollBar 
      scrollOffset={scrollLeft}
      contentLength={contentWidth}
      onScroll={({ scroll }) => setScrollLeft(scroll)}
      onClickScaleUp={onClickScaleUp}
      onClickScaleDown={onClickScaleDown}
      onClickScaleReset={onClickScaleReset}
    />
  </div>
}

export type SPianoRollProps = PianoRollProps & {
  player: Player
  autoScroll: boolean
  setCursorPosition: (tick: number) => void
  scaleX: number
}

export interface SPianoRollState {
} 

class stateful extends Component<SPianoRollProps, SPianoRollState> {
  private pencilMouseHandler = new PencilMouseHandler()
  private selectionMouseHandler = new SelectionMouseHandler()
  private alpha: HTMLElement

  static defaultProps = {
    endTick: 400,
    scaleX: 1,
    scaleY: 1,
    autoScroll: false
  }

  componentDidMount() {
    this.props.player.on("change-position", this.onTick)
  }

  componentWillUnmount() {
    this.props.player.off("change-position", this.onTick)
  }

  onTick = tick => {
    const { autoScroll, scrollLeft, size, setCursorPosition, setScrollLeft, theme, scaleX } = this.props
    const transform = createTransform(theme.keyHeight, scaleX)
    const x = transform.getX(tick)

    setCursorPosition(tick)

    // keep scroll position to cursor
    if (autoScroll) {
      const screenX = x - scrollLeft
      if (screenX > size.width * 0.7 || screenX < 0) {
        setScrollLeft(x)
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true
  }

  render() {
    const { dispatch, selection, theme, scaleX } = this.props
    const transform = createTransform(theme.keyHeight, scaleX)

    this.pencilMouseHandler.dispatch = dispatch
    this.pencilMouseHandler.transform = transform
    this.selectionMouseHandler.dispatch = dispatch
    this.selectionMouseHandler.transform = transform
    this.selectionMouseHandler.selection = selection

    const mouseHandler = this.props.mouseMode === 0 ?
      this.pencilMouseHandler : this.selectionMouseHandler

    return <PianoRoll {...this.props} {...this.state}
      transform={transform}
      mouseHandler={mouseHandler}
      onMountAlpha={c => this.alpha = c}
      alphaHeight={this.alpha ? this.alpha.getBoundingClientRect().height : 0}
    />
  }
}

function createTransform(keyHeight, scaleX) {
  const pixelsPerTick = 0.1 * scaleX
  return new NoteCoordTransform(
    pixelsPerTick,
    keyHeight,
    127)
}

export default sizeMe()(inject(({ rootStore: {
  song: { selectedTrack: track, endOfSong: endTick, measureList: { beats } },
  pianoRollStore: s,
  rootViewStore: { theme },
  playerStore,
  services: { player, quantizer },
  dispatch
} }) => ({
  track,
  endTick,
  beats,
  theme,
  events: track.events.toJS(), // 変更が反映されるように toJS() する
  scaleX: s.scaleX,
  scaleY: s.scaleY,
  autoScroll: s.autoScroll,
  selection: s.selection,
  scrollLeft: s.scrollLeft,
  setScrollLeft: v => s.scrollLeft = v,
  scrollTop: s.scrollTop,
  setScrollTop: v => s.scrollTop = v,
  controlMode: s.controlMode,
  setControlMode: v => s.controlMode = v,
  cursorPosition: s.cursorPosition,
  setCursorPosition: v => s.cursorPosition = v,
  notesCursor: s.notesCursor,
  setNotesCursor: v => s.notesCursor = v,
  mouseMode: s.mouseMode,
  onChangeTool: () => s.mouseMode = (s.mouseMode === 0 ? 1 : 0),
  onClickScaleUp: () => s.scaleX = s.scaleX + 0.1,
  onClickScaleDown: () => s.scaleX = Math.max(0.05, s.scaleX - 0.1),
  onClickScaleReset: () => s.scaleX = 1,
  loop: playerStore.loop,
  quantizer,
  player,
  setLoopBegin: tick => dispatch(SET_LOOP_BEGIN, { tick }),
  setLoopEnd: tick => dispatch(SET_LOOP_END, { tick }),
  setPlayerPosition: tick => dispatch(SET_PLAYER_POSITION, { tick }),
  previewNote: (noteNumber, channel) => dispatch(PREVIEW_NOTE, { noteNumber, channel }),
  dispatch,
}))(observer(stateful)))

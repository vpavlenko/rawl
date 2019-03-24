import Player from "common/player/Player"
import { NoteCoordTransform } from "common/transform"
import {
  PREVIEW_NOTE,
  SET_LOOP_BEGIN,
  SET_LOOP_END,
  SET_PLAYER_POSITION,
  CHANGE_NOTES_VELOCITY,
  CREATE_VOLUME,
  CREATE_PITCH_BEND,
  CREATE_PAN,
  CREATE_MODULATION,
  CREATE_EXPRESSION
} from "main/actions"
import { inject, observer } from "mobx-react"
import React, { Component } from "react"
import { withSize } from "react-sizeme"
import { compose } from "recompose"
import { PianoRollProps, PianoRoll } from "components/PianoRoll/PianoRoll"
import PencilMouseHandler from "./MouseHandler/PencilMouseHandler"
import SelectionMouseHandler from "./MouseHandler/SelectionMouseHandler"
import { ControlMode } from "components/PianoRoll/ControlPane"
import { PianoRollMouseMode } from "stores/PianoRollStore"
import { Dispatcher } from "createDispatcher"

export type SPianoRollProps = PianoRollProps & {
  player: Player
  autoScroll: boolean
  setCursorPosition: (tick: number) => void
  scaleX: number
  mouseMode: PianoRollMouseMode
  dispatch: Dispatcher
}

export interface SPianoRollState {}

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

  onTick = (tick: number) => {
    const {
      autoScroll,
      scrollLeft,
      size,
      setCursorPosition,
      setScrollLeft,
      theme,
      scaleX
    } = this.props
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

  shouldComponentUpdate(
    nextProps: SPianoRollState,
    nextState: SPianoRollState
  ) {
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

    const mouseHandler =
      this.props.mouseMode === "pencil"
        ? this.pencilMouseHandler
        : this.selectionMouseHandler

    return (
      <PianoRoll
        {...this.props}
        {...this.state}
        transform={transform}
        mouseHandler={mouseHandler}
        onMountAlpha={c => (this.alpha = c)}
        alphaHeight={this.alpha ? this.alpha.getBoundingClientRect().height : 0}
      />
    )
  }
}

function createTransform(keyHeight: number, scaleX: number) {
  const pixelsPerTick = 0.1 * scaleX
  return new NoteCoordTransform(pixelsPerTick, keyHeight, 127)
}

export default compose<{}, {}>(
  withSize({ monitorHeight: true }),
  inject(
    ({
      rootStore: {
        song: {
          selectedTrack: track,
          endOfSong: endTick,
          measureList: { beats }
        },
        pianoRollStore: s,
        rootViewStore: { theme },
        playerStore,
        services: { player, quantizer },
        dispatch
      }
    }) => ({
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
      setScrollLeft: (v: number) => (s.scrollLeft = v),
      scrollTop: s.scrollTop,
      setScrollTop: (v: number) => (s.scrollTop = v),
      controlMode: s.controlMode,
      setControlMode: (v: string) => (s.controlMode = v),
      cursorPosition: s.cursorPosition,
      setCursorPosition: (v: number) => (s.cursorPosition = v),
      notesCursor: s.notesCursor,
      setNotesCursor: (v: string) => (s.notesCursor = v),
      mouseMode: s.mouseMode,
      onChangeTool: () =>
        (s.mouseMode = s.mouseMode === "pencil" ? "selection" : "pencil"),
      onClickScaleUp: () => (s.scaleX = s.scaleX + 0.1),
      onClickScaleDown: () => (s.scaleX = Math.max(0.05, s.scaleX - 0.1)),
      onClickScaleReset: () => (s.scaleX = 1),
      loop: playerStore.loop,
      quantizer,
      player,
      setLoopBegin: (tick: number) => dispatch(SET_LOOP_BEGIN, tick),
      setLoopEnd: (tick: number) => dispatch(SET_LOOP_END, tick),
      setPlayerPosition: (tick: number) => dispatch(SET_PLAYER_POSITION, tick),
      previewNote: (noteNumber: number, channel: number) =>
        dispatch(PREVIEW_NOTE, noteNumber, channel),
      dispatch,
      createControlEvent: (mode: ControlMode, value: number, tick?: number) => {
        const type = (() => {
          switch (mode) {
            case "volume":
              return CREATE_VOLUME
            case "pitchBend":
              return CREATE_PITCH_BEND
            case "pan":
              return CREATE_PAN
            case "modulation":
              return CREATE_MODULATION
            case "expression":
              return CREATE_EXPRESSION
            case "velocity":
              throw new Error("invalid type")
          }
        })()
        dispatch(type, value, tick)
      }
    })
  ),
  observer
)(stateful)

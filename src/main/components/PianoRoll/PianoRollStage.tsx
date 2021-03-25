import { useObserver } from "mobx-react-lite"
import { settings } from "pixi.js"
import React, {
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { IPoint } from "../../../common/geometry"
import { createBeatsInRange } from "../../../common/helpers/mapBeats"
import { getSelectionBounds } from "../../../common/selection/Selection"
import { NoteCoordTransform } from "../../../common/transform"
import { removeEvent } from "../../actions"
import { useContextMenu } from "../../hooks/useContextMenu"
import { useNoteTransform } from "../../hooks/useNoteTransform"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import PencilMouseHandler from "./MouseHandler/PencilMouseHandler"
import SelectionMouseHandler from "./MouseHandler/SelectionMouseHandler"
import { isPianoNote, PianoNoteItem } from "./PianoNotes/PianoNote"
import { useNotes } from "./PianoNotes/PianoNotes"
import { PianoRollRenderer } from "./PianoRollRenderer/PianoRollRenderer"
import { PianoSelectionContextMenu } from "./PianoSelectionContextMenu"

export interface PianoRollStageProps {
  width: number
}

export interface PianoNotesMouseEvent {
  nativeEvent: MouseEvent
  tick: number
  noteNumber: number
  local: IPoint
  transform: NoteCoordTransform
  item: PianoNoteItem | null
}

export const PianoRollStage: FC<PianoRollStageProps> = ({ width }) => {
  const rootStore = useStores()
  const {
    trackId,
    ghostTrackIds,
    measures,
    playerPosition,
    timebase,
    mouseMode,
    scrollLeft,
    scrollTop,
    notesCursor,
    selection,
  } = useObserver(() => {
    const ghostTrackIds =
      rootStore.pianoRollStore.ghostTracks[rootStore.song.selectedTrackId] ?? []

    return {
      trackId: rootStore.song.selectedTrackId,
      ghostTrackIds,
      measures: rootStore.song.measures,
      playerPosition: rootStore.services.player.position,
      timebase: rootStore.services.player.timebase,
      mouseMode: rootStore.pianoRollStore.mouseMode,
      scrollLeft: rootStore.pianoRollStore.scrollLeft,
      scrollTop: rootStore.pianoRollStore.scrollTop,
      notesCursor: rootStore.pianoRollStore.notesCursor,
      selection: rootStore.pianoRollStore.selection,
    }
  })
  const transform = useNoteTransform()
  const theme = useTheme()

  const [pencilMouseHandler] = useState(new PencilMouseHandler(rootStore))
  const [selectionMouseHandler] = useState(new SelectionMouseHandler(rootStore))

  const stageHeight = transform.pixelsPerKey * transform.numberOfKeys
  const startTick = scrollLeft / transform.pixelsPerTick

  const mouseHandler =
    mouseMode === "pencil" ? pencilMouseHandler : selectionMouseHandler

  // MouseHandler で利用する追加情報をイベントに付加する
  const extendEvent = (e: MouseEvent): PianoNotesMouseEvent => {
    const local = {
      x: e.pageX,
      y: e.pageY,
    }
    return {
      nativeEvent: e,
      local,
      tick: transform.getTicks(local.x),
      noteNumber: Math.ceil(transform.getNoteNumber(local.y)),
      transform,
      item: null,
    }
  }

  const handleMouseDown: MouseEventHandler<HTMLCanvasElement> = useCallback(
    (e) => {
      // if (isPianoNote(e.target)) {
      //   const { item } = e.target
      //   observeDoubleClick(() => {
      //     removeEvent(rootStore)(item.id)
      //   })
      // }

      mouseHandler.onMouseDown(extendEvent(e.nativeEvent))
    },
    [mouseHandler, transform]
  )

  const handleMouseMove: MouseEventHandler<HTMLCanvasElement> = useCallback(
    (e) => {
      // if (
      //   mouseMode === "pencil" &&
      //   e.buttons === 2 &&
      //   isPianoNote(e.target)
      // ) {
      //   removeEvent(rootStore)(e.target.item.id)
      // }
      mouseHandler.onMouseMove(extendEvent(e.nativeEvent))
    },
    [mouseHandler, transform]
  )

  const handleMouseUp: MouseEventHandler<HTMLCanvasElement> = useCallback(
    (e) => {
      mouseHandler.onMouseUp(extendEvent(e.nativeEvent))
    },
    [mouseHandler, transform]
  )

  const mappedBeats = createBeatsInRange(
    measures,
    transform.pixelsPerTick,
    timebase,
    startTick,
    width
  )

  const cursorPositionX = transform.getX(playerPosition)
  const contentHeight = transform.getMaxY()

  const { onContextMenu, menuProps } = useContextMenu()

  const onRightClickSelection = useCallback(
    (ev: PIXI.InteractionEvent) => {
      ev.stopPropagation()
      const e = ev.data.originalEvent as MouseEvent
      onContextMenu(e)
    },
    [onContextMenu]
  )

  const handleRightClick = useCallback(
    (ev: PIXI.InteractionEvent) => {
      if (
        isPianoNote(ev.target) &&
        rootStore.pianoRollStore.mouseMode == "pencil"
      ) {
        removeEvent(rootStore)(ev.target.item.id)
      }
      if (rootStore.pianoRollStore.mouseMode === "selection") {
        const e = ev.data.originalEvent as MouseEvent
        ev.stopPropagation()
        onContextMenu(e)
      }
    },
    [rootStore, onContextMenu]
  )

  const ref = useRef<HTMLCanvasElement>(null)
  const [renderer, setRenderer] = useState<PianoRollRenderer | null>(null)
  const notes = useNotes(trackId, width, false)

  useEffect(() => {
    const canvas = ref.current
    if (canvas === null) {
      throw new Error("canvas is not mounted")
    }
    // GL コンテキストを初期化する
    const gl = canvas.getContext("webgl")

    // WebGL が使用可能で動作している場合にのみ続行します
    if (gl === null) {
      alert(
        "WebGL を初期化できません。ブラウザーまたはマシンがサポートしていない可能性があります。"
      )
      return
    }

    setRenderer(new PianoRollRenderer(gl))
  }, [])

  const selectionBounds = getSelectionBounds(selection, transform)

  useEffect(() => {
    if (renderer === null) {
      return
    }
    const canvas = ref.current
    if (canvas === null) {
      throw new Error("canvas is not mounted")
    }
    const beats = mappedBeats.map((b) => b.x)
    renderer.render(notes, selectionBounds, beats, cursorPositionX)
  }, [renderer, selectionBounds, notes, mappedBeats, cursorPositionX])

  settings.ROUND_PIXELS = true

  return (
    <>
      <canvas
        className="alphaContent"
        width={width}
        height={stageHeight}
        onContextMenu={useCallback((e) => e.preventDefault(), [])}
        ref={ref}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      ></canvas>
      <PianoSelectionContextMenu {...menuProps} />
    </>
  )
}

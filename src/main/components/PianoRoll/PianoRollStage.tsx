import { partition } from "lodash"
import { useObserver } from "mobx-react-lite"
import { settings } from "pixi.js"
import React, {
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import styled from "styled-components"
import { containsPoint, IPoint } from "../../../common/geometry"
import { createBeatsInRange } from "../../../common/helpers/mapBeats"
import { getSelectionBounds } from "../../../common/selection/Selection"
import { NoteCoordTransform } from "../../../common/transform"
import { removeEvent } from "../../actions"
import { Layout } from "../../Constants"
import { useContextMenu } from "../../hooks/useContextMenu"
import { PianoNoteItem, useNotes } from "../../hooks/useNotes"
import { useNoteTransform } from "../../hooks/useNoteTransform"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import PianoLines from "./CanvasPianoLines"
import CanvasPianoRuler from "./CanvasPianoRuler"
import { observeDoubleClick } from "./MouseHandler/observeDoubleClick"
import PencilMouseHandler from "./MouseHandler/PencilMouseHandler"
import SelectionMouseHandler from "./MouseHandler/SelectionMouseHandler"
import PianoKeys from "./PianoKeys"
import { PianoRollRenderer } from "./PianoRollRenderer/PianoRollRenderer"
import { PianoSelectionContextMenu } from "./PianoSelectionContextMenu"

export interface PianoRollStageProps {
  width: number
  height: number
}

export interface PianoNotesMouseEvent {
  nativeEvent: MouseEvent
  tick: number
  noteNumber: number
  local: IPoint
  transform: NoteCoordTransform
  item: PianoNoteItem | null
}

const Container = styled.div``

const ContentPosition = styled.div`
  position: absolute;
  left: ${Layout.keyWidth}px;
`

const RulerPosition = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  padding-left: ${Layout.keyWidth}px;
  height: ${Layout.rulerHeight}px;
`

const PianoKeyPosition = styled.div`
  position: absolute;
  left: 0;
  top: 0;
`

export const PianoRollStage: FC<PianoRollStageProps> = ({ width, height }) => {
  const rootStore = useStores()
  const {
    trackId,
    track,
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
      track: rootStore.song.selectedTrack,
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

  const startTick = scrollLeft / transform.pixelsPerTick

  const mouseHandler =
    mouseMode === "pencil" ? pencilMouseHandler : selectionMouseHandler

  const [notes, ghostNotes] = useNotes(trackId, width, false)

  const { onContextMenu, menuProps } = useContextMenu()

  // MouseHandler で利用する追加情報をイベントに付加する
  const extendEvent = useCallback(
    (e: MouseEvent): PianoNotesMouseEvent => {
      const local = {
        x: e.offsetX + scrollLeft,
        y: e.offsetY + scrollTop,
      }
      return {
        nativeEvent: e,
        local,
        tick: transform.getTicks(local.x),
        noteNumber: Math.ceil(transform.getNoteNumber(local.y)),
        transform,
        item: notes.find((n) => containsPoint(n, local)) ?? null,
      }
    },
    [transform, notes, scrollLeft, scrollTop]
  )

  const handleMouseDown: MouseEventHandler<HTMLCanvasElement> = useCallback(
    (e) => {
      const ev = extendEvent(e.nativeEvent)
      if (e.buttons === 2) {
        if (
          ev.item !== null &&
          rootStore.pianoRollStore.mouseMode == "pencil"
        ) {
          removeEvent(rootStore)(ev.item.id)
        }
        if (rootStore.pianoRollStore.mouseMode === "selection") {
          e.stopPropagation()
          onContextMenu(e)
        }
        return
      }
      if (ev.item !== null) {
        const { item } = ev
        observeDoubleClick(() => {
          removeEvent(rootStore)(item.id)
        })
      }

      mouseHandler.onMouseDown(ev)
    },
    [mouseHandler, extendEvent, onContextMenu]
  )

  const handleMouseMove: MouseEventHandler<HTMLCanvasElement> = useCallback(
    (e) => {
      const ev = extendEvent(e.nativeEvent)
      if (mouseMode === "pencil" && e.buttons === 2 && ev.item !== null) {
        removeEvent(rootStore)(ev.item.id)
      }
      mouseHandler.onMouseMove(extendEvent(e.nativeEvent))
    },
    [mouseHandler, extendEvent]
  )

  const handleMouseUp: MouseEventHandler<HTMLCanvasElement> = useCallback(
    (e) => {
      mouseHandler.onMouseUp(extendEvent(e.nativeEvent))
    },
    [mouseHandler, extendEvent]
  )

  const mappedBeats = useMemo(
    () =>
      createBeatsInRange(
        measures,
        transform.pixelsPerTick,
        timebase,
        startTick,
        width
      ),
    [measures, transform, timebase, startTick, width]
  )

  const cursorPositionX = transform.getX(playerPosition)
  const contentHeight = transform.getMaxY()

  const ref = useRef<HTMLCanvasElement>(null)
  const [renderer, setRenderer] = useState<PianoRollRenderer | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (canvas === null) {
      throw new Error("canvas is not mounted")
    }
    // GL コンテキストを初期化する
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      desynchronized: true,
      powerPreference: "high-performance",
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
    })

    // WebGL が使用可能で動作している場合にのみ続行します
    if (gl === null) {
      alert(
        "WebGL を初期化できません。ブラウザーまたはマシンがサポートしていない可能性があります。"
      )
      return
    }

    setRenderer(new PianoRollRenderer(gl))
  }, [])

  useEffect(() => {
    if (renderer === null) {
      return
    }
    const canvas = ref.current
    if (canvas === null) {
      throw new Error("canvas is not mounted")
    }
    const selectionBounds = getSelectionBounds(selection, transform)
    const [selectedNotes, nonSelectedNotes] = partition(
      notes,
      (n) => n.isSelected
    )
    const [highlightedBeats, nonHighlightedBeats] = partition(
      mappedBeats,
      (b) => b.beat === 0
    )
    renderer.theme = theme
    renderer.render(
      nonSelectedNotes,
      selectedNotes,
      ghostNotes,
      selectionBounds,
      nonHighlightedBeats.map((b) => b.x),
      highlightedBeats.map((b) => b.x),
      cursorPositionX,
      { x: scrollLeft, y: scrollTop }
    )
  }, [
    renderer,
    selection,
    transform,
    notes,
    ghostNotes,
    mappedBeats,
    cursorPositionX,
    theme,
    scrollLeft,
    scrollTop,
  ])

  settings.ROUND_PIXELS = true

  // const canvasScale =
  //   window.devicePixelRatio > 1 && width * window.devicePixelRatio > 4096
  //     ? 1
  //     : window.devicePixelRatio
  const canvasScale = window.devicePixelRatio

  return (
    <Container>
      <ContentPosition style={{ top: -scrollTop + Layout.rulerHeight }}>
        <PianoLines
          theme={theme}
          width={width}
          pixelsPerKey={transform.pixelsPerKey}
          numberOfKeys={transform.numberOfKeys}
        />
      </ContentPosition>
      <ContentPosition style={{ top: Layout.rulerHeight }}>
        <canvas
          width={width * canvasScale}
          height={height * canvasScale}
          style={{ width, height }}
          onContextMenu={useCallback((e) => e.preventDefault(), [])}
          ref={ref}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        ></canvas>
      </ContentPosition>
      <PianoKeyPosition style={{ top: -scrollTop + Layout.rulerHeight }}>
        <PianoKeys
          keyHeight={transform.pixelsPerKey}
          numberOfKeys={transform.numberOfKeys}
        />
      </PianoKeyPosition>
      <RulerPosition
        style={{
          background: theme.backgroundColor,
          borderBottom: `1px solid ${theme.dividerColor}`,
        }}
      >
        <CanvasPianoRuler
          width={width}
          beats={mappedBeats}
          scrollLeft={scrollLeft}
          pixelsPerTick={transform.pixelsPerTick}
        />
      </RulerPosition>
      <PianoSelectionContextMenu {...menuProps} />
    </Container>
  )
}

import { partition } from "lodash"
import { observer } from "mobx-react-lite"
import {
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useTheme } from "styled-components"
import { containsPoint } from "../../../common/geometry"
import { createBeatsInRange } from "../../../common/helpers/mapBeats"
import { getSelectionBounds } from "../../../common/selection/Selection"
import { removeEvent } from "../../actions"
import { useContextMenu } from "../../hooks/useContextMenu"
import { useStores } from "../../hooks/useStores"
import { GLCanvas } from "../GLCanvas/GLCanvas"
import { observeDoubleClick } from "./MouseHandler/observeDoubleClick"
import PencilMouseHandler from "./MouseHandler/PencilMouseHandler"
import SelectionMouseHandler from "./MouseHandler/SelectionMouseHandler"
import { PianoRollRenderer } from "./PianoRollRenderer/PianoRollRenderer"
import { PianoNotesMouseEvent, PianoRollStageProps } from "./PianoRollStage"
import { PianoSelectionContextMenu } from "./PianoSelectionContextMenu"

export const PianoNotes: FC<PianoRollStageProps> = observer(
  ({ width, height }) => {
    const rootStore = useStores()

    const {
      scrollLeft,
      scrollTop,
      mouseMode,
      notesCursor,
      selection,
      transform,
      notes: [notes, ghostNotes],
    } = rootStore.pianoRollStore

    const { position: playerPosition, timebase } = rootStore.services.player
    const { measures } = rootStore.song

    const theme = useTheme()

    const [pencilMouseHandler] = useState(new PencilMouseHandler(rootStore))
    const [selectionMouseHandler] = useState(
      new SelectionMouseHandler(rootStore)
    )

    const startTick = scrollLeft / transform.pixelsPerTick

    const mouseHandler =
      mouseMode === "pencil" ? pencilMouseHandler : selectionMouseHandler

    const { onContextMenu, menuProps } = useContextMenu()

    // MouseHandler で利用する追加情報をイベントに付加する
    const extendEvent = useCallback(
      (e: MouseEvent): PianoNotesMouseEvent => {
        const { scrollTop, scrollLeft } = rootStore.pianoRollStore
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
      [transform, notes, rootStore]
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

    const ref = useRef<HTMLCanvasElement>(null)
    const [renderer, setRenderer] = useState<PianoRollRenderer | null>(null)

    useEffect(() => {
      rootStore.pianoRollStore.canvasWidth = width
    }, [width])

    useEffect(() => {
      if (renderer === null) {
        return
      }
      const selectionBounds = getSelectionBounds(selection, transform)

      const [highlightedBeats, nonHighlightedBeats] = partition(
        mappedBeats,
        (b) => b.beat === 0
      )

      renderer.theme = theme
      renderer.render(
        notes,
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

    const canvasScale = window.devicePixelRatio

    return (
      <>
        <GLCanvas
          width={width * canvasScale}
          height={height * canvasScale}
          style={{ width, height, cursor: notesCursor }}
          onContextMenu={useCallback((e) => e.preventDefault(), [])}
          onCreateContext={useCallback(
            (gl) => setRenderer(new PianoRollRenderer(gl)),
            []
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
        <PianoSelectionContextMenu {...menuProps} />
      </>
    )
  }
)

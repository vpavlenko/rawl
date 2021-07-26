import { partition } from "lodash"
import { observer } from "mobx-react-lite"
import { FC, MouseEventHandler, useCallback, useEffect, useState } from "react"
import { useTheme } from "styled-components"
import { containsPoint, zeroRect } from "../../../common/geometry"
import { getSelectionBounds } from "../../../common/selection/Selection"
import { useContextMenu } from "../../hooks/useContextMenu"
import { useStores } from "../../hooks/useStores"
import { GLCanvas } from "../GLCanvas/GLCanvas"
import { usePianoNotesKeyboardShortcut } from "../KeyboardShortcut/usePianoNotesKeyboardShortcut"
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
      mappedBeats,
      cursorX,
    } = rootStore.pianoRollStore

    const theme = useTheme()

    const [pencilMouseHandler] = useState(new PencilMouseHandler(rootStore))
    const [selectionMouseHandler] = useState(
      new SelectionMouseHandler(rootStore)
    )

    const mouseHandler =
      mouseMode === "pencil" ? pencilMouseHandler : selectionMouseHandler

    const { onContextMenu, menuProps } = useContextMenu()

    // MouseHandler で利用する追加情報をイベントに付加する
    // Add additional information used by MouseHandler to an event
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
          item: notes.find((n) => containsPoint(n, local)) ?? null,
        }
      },
      [transform, notes, rootStore]
    )

    const handleMouseDown: MouseEventHandler<HTMLCanvasElement> = useCallback(
      (e) => {
        const ev = extendEvent(e.nativeEvent)
        if (
          e.buttons === 2 &&
          rootStore.pianoRollStore.mouseMode === "selection"
        ) {
          e.stopPropagation()
          onContextMenu(e)
          return
        }
        mouseHandler.onMouseDown(ev)
      },
      [mouseHandler, extendEvent, onContextMenu]
    )

    const handleMouseMove: MouseEventHandler<HTMLCanvasElement> = useCallback(
      (e) => mouseHandler.onMouseMove(extendEvent(e.nativeEvent)),
      [mouseHandler, extendEvent]
    )

    const handleMouseUp: MouseEventHandler<HTMLCanvasElement> = useCallback(
      (e) => mouseHandler.onMouseUp(extendEvent(e.nativeEvent)),
      [mouseHandler, extendEvent]
    )

    const [renderer, setRenderer] = useState<PianoRollRenderer | null>(null)

    useEffect(() => {
      rootStore.pianoRollStore.canvasWidth = width
    }, [width])

    useEffect(() => {
      rootStore.pianoRollStore.canvasHeight = height
    }, [height])

    useEffect(() => {
      if (renderer === null) {
        return
      }
      const selectionBounds =
        selection !== null ? getSelectionBounds(selection, transform) : zeroRect

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
        cursorX,
        { x: scrollLeft, y: scrollTop }
      )
    }, [
      renderer,
      selection,
      transform,
      notes,
      ghostNotes,
      mappedBeats,
      cursorX,
      theme,
      scrollLeft,
      scrollTop,
    ])

    const onBlur: React.FocusEventHandler = useCallback(
      () => (rootStore.pianoRollStore.selection = null),
      [rootStore]
    )

    const onKeyDown = usePianoNotesKeyboardShortcut()

    return (
      <>
        <GLCanvas
          width={width}
          height={height}
          style={{ cursor: notesCursor }}
          onBlur={onBlur}
          tabIndex={-1}
          onKeyDown={onKeyDown}
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

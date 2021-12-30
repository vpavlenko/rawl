import { partition } from "lodash"
import { observer } from "mobx-react-lite"
import { FC, MouseEventHandler, useCallback, useEffect, useState } from "react"
import { useTheme } from "styled-components"
import { zeroRect } from "../../../common/geometry"
import { getSelectionBounds } from "../../../common/selection/Selection"
import { useContextMenu } from "../../hooks/useContextMenu"
import { useStores } from "../../hooks/useStores"
import { GLCanvas } from "../GLCanvas/GLCanvas"
import PencilMouseHandler from "./MouseHandler/PencilMouseHandler"
import SelectionMouseHandler from "./MouseHandler/SelectionMouseHandler"
import { PianoRollRenderer } from "./PianoRollRenderer/PianoRollRenderer"
import { PianoRollStageProps } from "./PianoRollStage"
import { PianoSelectionContextMenu } from "./PianoSelectionContextMenu"

export const PianoNotes: FC<PianoRollStageProps> = observer(
  ({ width, height }) => {
    const rootStore = useStores()

    const {
      scrollLeft,
      scrollTop,
      scaleX,
      scaleY,
      mouseMode,
      notesCursor,
      selection,
      transform,
      notes: [notes, ghostNotes],
      cursorX,
    } = rootStore.pianoRollStore
    const { beats } = rootStore.pianoRollStore.rulerStore

    const theme = useTheme()

    const [pencilMouseHandler] = useState(new PencilMouseHandler(rootStore))
    const [selectionMouseHandler] = useState(
      new SelectionMouseHandler(rootStore)
    )

    const mouseHandler =
      mouseMode === "pencil" ? pencilMouseHandler : selectionMouseHandler

    const { onContextMenu, menuProps } = useContextMenu()

    const handleMouseDown: MouseEventHandler<HTMLCanvasElement> = useCallback(
      (e) => {
        if (
          e.buttons === 2 &&
          rootStore.pianoRollStore.mouseMode === "selection"
        ) {
          e.stopPropagation()
          onContextMenu(e)
          return
        }
        mouseHandler.onMouseDown(e.nativeEvent)
      },
      [mouseHandler, onContextMenu]
    )

    const handleMouseMove: MouseEventHandler<HTMLCanvasElement> = useCallback(
      (e) => mouseHandler.onMouseMove(e.nativeEvent),
      [mouseHandler]
    )

    const handleMouseUp: MouseEventHandler<HTMLCanvasElement> = useCallback(
      (e) => mouseHandler.onMouseUp(),
      [mouseHandler]
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
        beats,
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
        { x: scrollLeft, y: scrollTop },
        { x: scaleX, y: scaleY }
      )
    }, [
      renderer,
      selection,
      transform,
      notes,
      ghostNotes,
      beats,
      cursorX,
      theme,
      scrollLeft,
      scrollTop,
      width,
      height,
    ])

    return (
      <>
        <GLCanvas
          width={width}
          height={height}
          style={{ cursor: notesCursor }}
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

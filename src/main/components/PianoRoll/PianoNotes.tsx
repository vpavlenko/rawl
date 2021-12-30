import { partition } from "lodash"
import { observer } from "mobx-react-lite"
import { FC, MouseEventHandler, useCallback, useEffect, useState } from "react"
import { useTheme } from "styled-components"
import { zeroRect } from "../../../common/geometry"
import { useContextMenu } from "../../hooks/useContextMenu"
import { useStores } from "../../hooks/useStores"
import { GLCanvas } from "../GLCanvas/GLCanvas"
import NoteMouseHandler from "./MouseHandler/NoteMouseHandler"
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
      notesCursor,
      selectionBounds,
      transform,
      notes,
      ghostNotes,
      cursorX,
    } = rootStore.pianoRollStore
    const { beats } = rootStore.pianoRollStore.rulerStore

    const theme = useTheme()

    const [mouseHandler] = useState(new NoteMouseHandler(rootStore))

    const { onContextMenu, menuProps } = useContextMenu()

    const handleContextMenu: MouseEventHandler = useCallback((e) => {
      if (rootStore.pianoRollStore.mouseMode === "selection") {
        e.stopPropagation()
        onContextMenu(e)
        return
      }
    }, [])

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

      const [highlightedBeats, nonHighlightedBeats] = partition(
        beats,
        (b) => b.beat === 0
      )

      renderer.theme = theme
      renderer.render(
        notes,
        ghostNotes,
        selectionBounds ?? zeroRect,
        nonHighlightedBeats.map((b) => b.x),
        highlightedBeats.map((b) => b.x),
        cursorX,
        { x: scrollLeft, y: scrollTop },
        { x: scaleX, y: scaleY }
      )
    }, [
      renderer,
      selectionBounds,
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
          onContextMenu={handleContextMenu}
          onCreateContext={useCallback(
            (gl) => setRenderer(new PianoRollRenderer(gl)),
            []
          )}
          onMouseDown={mouseHandler.onMouseDown}
          onMouseMove={mouseHandler.onMouseMove}
          onMouseUp={mouseHandler.onMouseUp}
        />
        <PianoSelectionContextMenu {...menuProps} />
      </>
    )
  }
)

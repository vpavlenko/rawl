import { observer } from "mobx-react-lite"
import {
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
  VFC,
} from "react"
import { matrixFromTranslation } from "../../../helpers/matrix"
import { useContextMenu } from "../../../hooks/useContextMenu"
import { useStores } from "../../../hooks/useStores"
import { Beats } from "../../GLSurface/common/Beats"
import { Cursor } from "../../GLSurface/common/Cursor"
import { Selection } from "../../GLSurface/common/Selection"
import { GLSurface } from "../../GLSurface/GLSurface"
import { Transform } from "../../GLSurface/Transform"
import NoteMouseHandler from "../MouseHandler/NoteMouseHandler"
import { PianoRollStageProps } from "../PianoRollStage"
import { PianoSelectionContextMenu } from "../PianoSelectionContextMenu"
import { GhostNotes } from "./GhostNotes"
import { Lines } from "./Lines"
import { Notes } from "./Notes"

export const PianoRollCanvas: FC<PianoRollStageProps> = observer(
  ({ width, height }) => {
    const rootStore = useStores()
    const { notesCursor, scrollLeft, scrollTop } = rootStore.pianoRollStore

    const [mouseHandler] = useState(new NoteMouseHandler(rootStore))

    const { onContextMenu, menuProps } = useContextMenu()

    const handleContextMenu: MouseEventHandler = useCallback((e) => {
      if (rootStore.pianoRollStore.mouseMode === "selection") {
        e.stopPropagation()
        onContextMenu(e)
        return
      }
    }, [])

    useEffect(() => {
      rootStore.pianoRollStore.canvasWidth = width
    }, [width])

    useEffect(() => {
      rootStore.pianoRollStore.canvasHeight = height
    }, [height])

    const scrollXMatrix = useMemo(
      () => matrixFromTranslation(-scrollLeft, 0),
      [scrollLeft]
    )

    const scrollYMatrix = useMemo(
      () => matrixFromTranslation(0, -scrollTop),
      [scrollLeft, scrollTop]
    )

    const scrollXYMatrix = useMemo(
      () => matrixFromTranslation(-scrollLeft, -scrollTop),
      [scrollLeft, scrollTop]
    )

    return (
      <>
        <GLSurface
          width={width}
          height={height}
          style={{ cursor: notesCursor }}
          onContextMenu={handleContextMenu}
          onMouseDown={mouseHandler.onMouseDown}
          onMouseMove={mouseHandler.onMouseMove}
          onMouseUp={mouseHandler.onMouseUp}
        >
          <Transform matrix={scrollYMatrix}>
            <Lines zIndex={0} />
          </Transform>
          <Transform matrix={scrollXMatrix}>
            <_Beats height={height} zIndex={1} />
            <_Cursor height={height} zIndex={5} />
          </Transform>
          <Transform matrix={scrollXYMatrix}>
            <GhostNotes zIndex={2} />
            <Notes zIndex={3} />
            <_Selection zIndex={4} />
          </Transform>
        </GLSurface>
        <PianoSelectionContextMenu {...menuProps} />
      </>
    )
  }
)

const _Beats: VFC<{ height: number; zIndex: number }> = observer(
  ({ height, zIndex }) => {
    const rootStore = useStores()
    const {
      rulerStore: { beats },
    } = rootStore.pianoRollStore
    return <Beats height={height} beats={beats} zIndex={zIndex} />
  }
)

const _Cursor: VFC<{ height: number; zIndex: number }> = observer(
  ({ height, zIndex }) => {
    const rootStore = useStores()
    const { cursorX } = rootStore.pianoRollStore
    return <Cursor x={cursorX} height={height} zIndex={zIndex} />
  }
)

const _Selection: VFC<{ zIndex: number }> = observer(({ zIndex }) => {
  const rootStore = useStores()
  const { selectionBounds } = rootStore.pianoRollStore
  return <Selection rect={selectionBounds} zIndex={zIndex} />
})

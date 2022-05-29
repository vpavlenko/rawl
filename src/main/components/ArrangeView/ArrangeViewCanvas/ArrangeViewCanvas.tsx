import { observer } from "mobx-react-lite"
import { useMemo, useRef, VFC } from "react"
import { matrixFromTranslation } from "../../../helpers/matrix"
import { useStores } from "../../../hooks/useStores"
import { Beats } from "../../GLSurface/common/Beats"
import { Cursor } from "../../GLSurface/common/Cursor"
import { Selection } from "../../GLSurface/common/Selection"
import { GLSurface } from "../../GLSurface/GLSurface"
import { Transform } from "../../GLSurface/Transform"
import { Lines } from "./Lines"
import { Notes } from "./Notes"

export interface ArrangeViewCanvasProps {
  width: number
}

export const ArrangeViewCanvas: VFC<ArrangeViewCanvasProps> = observer(
  ({ width }) => {
    const rootStore = useStores()
    const tracks = rootStore.song.tracks
    const { trackHeight, scrollLeft, scrollTop } = rootStore.arrangeViewStore
    const ref = useRef<HTMLCanvasElement>(null)

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

    const height = trackHeight * tracks.length

    return (
      <GLSurface
        ref={ref}
        style={{ pointerEvents: "none" }}
        width={width}
        height={height}
      >
        <Transform matrix={scrollYMatrix}>
          <Lines width={width} zIndex={0} />
        </Transform>
        <Transform matrix={scrollXMatrix}>
          <_Beats height={height} zIndex={1} />
          <_Cursor height={height} zIndex={4} />
        </Transform>
        <Transform matrix={scrollXYMatrix}>
          <Notes zIndex={2} />
          <_Selection zIndex={3} />
        </Transform>
      </GLSurface>
    )
  }
)

const _Beats: VFC<{ height: number; zIndex: number }> = observer(
  ({ height, zIndex }) => {
    const rootStore = useStores()
    const {
      rulerStore: { beats },
    } = rootStore.arrangeViewStore
    return <Beats height={height} beats={beats} zIndex={zIndex} />
  }
)

const _Cursor: VFC<{ height: number; zIndex: number }> = observer(
  ({ height, zIndex }) => {
    const rootStore = useStores()
    const { cursorX } = rootStore.arrangeViewStore
    return <Cursor x={cursorX} height={height} zIndex={zIndex} />
  }
)

const _Selection: VFC<{ zIndex: number }> = observer(({ zIndex }) => {
  const rootStore = useStores()
  const { selectionRect } = rootStore.arrangeViewStore
  return <Selection rect={selectionRect} zIndex={zIndex} />
})

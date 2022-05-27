import { observer } from "mobx-react-lite"
import { useMemo, useRef, VFC } from "react"
import { matrixFromTranslation } from "../../../helpers/matrix"
import { useStores } from "../../../hooks/useStores"
import { GLSurface } from "../../GLSurface/GLSurface"
import { Transform } from "../../GLSurface/Transform"
import { Beats } from "./Beats"
import { Cursor } from "./Cursor"
import { Lines } from "./Lines"
import { Notes } from "./Notes"
import { Selection } from "./Selection"

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
          <Lines width={width} />
        </Transform>
        <Transform matrix={scrollXMatrix}>
          <Beats height={height} />
          <Cursor height={height} />
        </Transform>
        <Transform matrix={scrollXYMatrix}>
          <Notes />
          <Selection />
        </Transform>
      </GLSurface>
    )
  }
)

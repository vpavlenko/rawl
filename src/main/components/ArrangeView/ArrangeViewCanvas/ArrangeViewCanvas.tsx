import { GLCanvas, Transform } from "@ryohey/webgl-react"
import { observer } from "mobx-react-lite"
import { ComponentProps, FC, useMemo } from "react"
import { matrixFromTranslation } from "../../../helpers/matrix"
import { useStores } from "../../../hooks/useStores"
import { Beats } from "../../GLNodes/Beats"
import { Cursor } from "../../GLNodes/Cursor"
import { Selection } from "../../GLNodes/Selection"
import { Lines } from "./Lines"
import { Notes } from "./Notes"

export type ArrangeViewCanvasProps = Omit<
  ComponentProps<typeof GLCanvas>,
  "height"
>

export const ArrangeViewCanvas: FC<ArrangeViewCanvasProps> = observer(
  ({ width, ...props }) => {
    const rootStore = useStores()
    const tracks = rootStore.song.tracks
    const {
      trackHeight,
      scrollLeft,
      scrollTop,
      rulerStore: { beats },
      cursorX,
      selectionRect,
    } = rootStore.arrangeViewStore
    const scrollXMatrix = useMemo(
      () => matrixFromTranslation(-scrollLeft, 0),
      [scrollLeft],
    )

    const scrollYMatrix = useMemo(
      () => matrixFromTranslation(0, -scrollTop),
      [scrollLeft, scrollTop],
    )

    const scrollXYMatrix = useMemo(
      () => matrixFromTranslation(-scrollLeft, -scrollTop),
      [scrollLeft, scrollTop],
    )

    const height = trackHeight * tracks.length

    return (
      <GLCanvas {...props} width={width} height={height}>
        <Transform matrix={scrollYMatrix}>
          <Lines width={width} zIndex={0} />
        </Transform>
        <Transform matrix={scrollXMatrix}>
          <Beats height={height} beats={beats} zIndex={1} />
          <Cursor x={cursorX} height={height} zIndex={4} />
        </Transform>
        <Transform matrix={scrollXYMatrix}>
          <Notes zIndex={2} />
          <Selection rect={selectionRect} zIndex={3} />
        </Transform>
      </GLCanvas>
    )
  },
)

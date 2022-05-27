import { useTheme } from "@emotion/react"
import Color from "color"
import { mat4 } from "gl-matrix"
import { partition } from "lodash"
import { observer } from "mobx-react-lite"
import { VFC } from "react"
import { IRect } from "../../../../common/geometry"
import { colorToVec4 } from "../../../gl/color"
import { useStores } from "../../../hooks/useStores"
import { Rectangles } from "../../GLSurface/Rectangles"

export const Beats: VFC<{ projectionMatrix: mat4; height: number }> = observer(
  ({ projectionMatrix, height }) => {
    const rootStore = useStores()
    const theme = useTheme()
    const {
      rulerStore: { beats },
    } = rootStore.arrangeViewStore

    const vline = (x: number): IRect => ({
      x,
      y: 0,
      width: 1,
      height,
    })

    const [highlightedBeats, nonHighlightedBeats] = partition(
      beats,
      (b) => b.beat === 0
    )

    const lines = nonHighlightedBeats.map((b) => vline(b.x))
    const highlightedLines = highlightedBeats.map((b) => vline(b.x))

    const color = colorToVec4(Color(theme.dividerColor).alpha(0.2))
    const highlightedColor = colorToVec4(Color(theme.dividerColor).alpha(0.5))

    return (
      <>
        <Rectangles
          rects={lines}
          projectionMatrix={projectionMatrix}
          color={color}
        />
        <Rectangles
          rects={highlightedLines}
          projectionMatrix={projectionMatrix}
          color={highlightedColor}
        />
      </>
    )
  }
)

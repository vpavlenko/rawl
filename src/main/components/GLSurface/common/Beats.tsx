import { useTheme } from "@emotion/react"
import Color from "color"
import { partition } from "lodash"
import { VFC } from "react"
import { IRect } from "../../../../common/geometry"
import { BeatWithX } from "../../../../common/helpers/mapBeats"
import { colorToVec4 } from "../../../gl/color"
import { Rectangles } from "../shapes/Rectangles"

export const Beats: VFC<{ height: number; beats: BeatWithX[] }> = ({
  height,
  beats,
}) => {
  const theme = useTheme()

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
      <Rectangles rects={lines} color={color} zIndex={2} />
      <Rectangles
        rects={highlightedLines}
        color={highlightedColor}
        zIndex={3}
      />
    </>
  )
}

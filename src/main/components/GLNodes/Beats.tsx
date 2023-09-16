import { Rectangles } from "@ryohey/webgl-react"
import Color from "color"
import { partition } from "lodash"
import { FC } from "react"
import { IRect } from "../../../common/geometry"
import { BeatWithX } from "../../../common/helpers/mapBeats"
import { colorToVec4 } from "../../gl/color"
import { useTheme } from "../../hooks/useTheme"

export const Beats: FC<{
  height: number
  beats: BeatWithX[]
  zIndex: number
}> = ({ height, beats, zIndex }) => {
  const theme = useTheme()

  const vline = (x: number): IRect => ({
    x,
    y: 0,
    width: 1,
    height,
  })

  const [highlightedBeats, nonHighlightedBeats] = partition(
    beats,
    (b) => b.beat === 0,
  )

  const lines = nonHighlightedBeats.map((b) => vline(b.x))
  const highlightedLines = highlightedBeats.map((b) => vline(b.x))

  const color = colorToVec4(Color(theme.dividerColor).alpha(0.2))
  const highlightedColor = colorToVec4(Color(theme.dividerColor).alpha(0.5))

  return (
    <>
      <Rectangles rects={lines} color={color} zIndex={zIndex} />
      <Rectangles
        rects={highlightedLines}
        color={highlightedColor}
        zIndex={zIndex + 0.1}
      />
    </>
  )
}

import { useTheme } from "@emotion/react"
import { Rectangles } from "@ryohey/webgl-react"
import Color from "color"
import { observer } from "mobx-react-lite"
import { useMemo, VFC } from "react"
import { IRect } from "../../../../common/geometry"
import { colorToVec4 } from "../../../gl/color"
import { useStores } from "../../../hooks/useStores"

export const Lines: VFC<{ width: number; zIndex: number }> = observer(
  ({ width, zIndex }) => {
    const rootStore = useStores()
    const theme = useTheme()

    const { trackHeight } = rootStore.arrangeViewStore

    const tracks = rootStore.song.tracks

    const hline = (y: number): IRect => ({
      x: 0,
      y,
      width,
      height: 1,
    })

    const rects = useMemo(
      () => tracks.map((_, i) => trackHeight * (i + 1) - 1).map(hline),
      [tracks, width]
    )

    const color = colorToVec4(Color(theme.dividerColor))

    return <Rectangles rects={rects} color={color} zIndex={zIndex} />
  }
)

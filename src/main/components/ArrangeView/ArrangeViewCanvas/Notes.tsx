import { Rectangles } from "@ryohey/webgl-react"
import Color from "color"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { colorToVec4 } from "../../../gl/color"
import { useStores } from "../../../hooks/useStores"
import { useTheme } from "../../../hooks/useTheme"

export const Notes: FC<{ zIndex: number }> = observer(({ zIndex }) => {
  const {
    arrangeViewStore: { notes },
  } = useStores()
  const theme = useTheme()

  return (
    <Rectangles
      rects={notes}
      color={colorToVec4(Color(theme.themeColor))}
      zIndex={zIndex}
    />
  )
})

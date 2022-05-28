import { useTheme } from "@emotion/react"
import Color from "color"
import { observer } from "mobx-react-lite"
import { VFC } from "react"
import { colorToVec4 } from "../../../gl/color"
import { useStores } from "../../../hooks/useStores"
import { Rectangles } from "../../GLSurface/shapes/Rectangles"

export const Notes: VFC = observer(() => {
  const rootStore = useStores()
  const theme = useTheme()
  const { notes } = rootStore.arrangeViewStore

  return (
    <Rectangles
      rects={notes}
      color={colorToVec4(Color(theme.themeColor))}
      zIndex={4}
    />
  )
})

import { useTheme } from "@emotion/react"
import Color from "color"
import { vec4 } from "gl-matrix"
import { observer } from "mobx-react-lite"
import { VFC } from "react"
import { colorToVec4 } from "../../../gl/color"
import { useStores } from "../../../hooks/useStores"
import { BordererdRectangles } from "../../GLSurface/BordererdRectangles"

export const Selection: VFC = observer(() => {
  const rootStore = useStores()
  const theme = useTheme()
  const { selectionRect } = rootStore.arrangeViewStore

  if (selectionRect === null) {
    return <></>
  }

  return (
    <BordererdRectangles
      rects={[selectionRect]}
      fillColor={vec4.create()}
      strokeColor={colorToVec4(Color(theme.themeColor))}
    />
  )
})

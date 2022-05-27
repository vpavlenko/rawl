import { useTheme } from "@emotion/react"
import Color from "color"
import { mat4, vec4 } from "gl-matrix"
import { observer } from "mobx-react-lite"
import { VFC } from "react"
import { colorToVec4 } from "../../../gl/color"
import { useStores } from "../../../hooks/useStores"
import { BordererdRectangles } from "../../GLSurface/BordererdRectangles"

export const Selection: VFC<{ projectionMatrix: mat4 }> = observer(
  ({ projectionMatrix }) => {
    const rootStore = useStores()
    const theme = useTheme()
    const { selectionRect } = rootStore.arrangeViewStore

    return (
      <>
        {selectionRect && (
          <BordererdRectangles
            rects={[selectionRect]}
            projectionMatrix={projectionMatrix}
            fillColor={vec4.create()}
            strokeColor={colorToVec4(Color(theme.themeColor))}
          />
        )}
      </>
    )
  }
)

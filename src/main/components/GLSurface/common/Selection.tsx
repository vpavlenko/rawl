import { useTheme } from "@emotion/react"
import Color from "color"
import { vec4 } from "gl-matrix"
import { VFC } from "react"
import { IRect } from "../../../../common/geometry"
import { colorToVec4 } from "../../../gl/color"
import { BordererdRectangles } from "../shapes/BordererdRectangles"

export const Selection: VFC<{ rect: IRect | null; zIndex: number }> = ({
  rect,
  zIndex,
}) => {
  const theme = useTheme()

  if (rect === null) {
    return <></>
  }

  return (
    <BordererdRectangles
      rects={[rect]}
      fillColor={vec4.create()}
      strokeColor={colorToVec4(Color(theme.themeColor))}
      zIndex={zIndex}
    />
  )
}

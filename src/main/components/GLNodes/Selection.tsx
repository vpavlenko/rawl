import { BorderedRectangles } from "@ryohey/webgl-react"
import Color from "color"
import { vec4 } from "gl-matrix"
import { FC } from "react"
import { IRect } from "../../../common/geometry"
import { colorToVec4 } from "../../gl/color"
import { useTheme } from "../../hooks/useTheme"

export const Selection: FC<{ rect: IRect | null; zIndex: number }> = ({
  rect,
  zIndex,
}) => {
  const theme = useTheme()

  if (rect === null) {
    return <></>
  }

  return (
    <BorderedRectangles
      rects={[rect]}
      fillColor={vec4.create()}
      strokeColor={colorToVec4(Color(theme.themeColor))}
      zIndex={zIndex}
    />
  )
}

import { Rectangles } from "@ryohey/webgl-react"
import Color from "color"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { IRect } from "../../../../common/geometry"
import { colorToVec4 } from "../../../gl/color"
import { useTheme } from "../../../hooks/useTheme"

export const VelocityItems: FC<{ rects: IRect[] }> = observer(({ rects }) => {
  const theme = useTheme()
  const color = colorToVec4(Color(theme.themeColor))
  return <Rectangles rects={rects} color={color} />
})

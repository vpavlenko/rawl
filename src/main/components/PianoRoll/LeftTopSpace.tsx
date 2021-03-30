import { Graphics } from "@inlet/react-pixi"
import Color from "color"
import React, { FC } from "react"
import { Layout } from "../../Constants"
import { useTheme } from "../../hooks/useTheme"

const areEquals = (props: LeftTopSpaceProps, nextProps: LeftTopSpaceProps) =>
  props.width === nextProps.width

export interface LeftTopSpaceProps {
  width: number
}

export const LeftTopSpace: FC<LeftTopSpaceProps> = React.memo(({ width }) => {
  const theme = useTheme()
  return (
    <Graphics
      draw={(g) => {
        g.clear()
          .lineStyle()
          .beginFill(Color(theme.backgroundColor).rgbNumber())
          .drawRect(0, 0, Layout.keyWidth, Layout.rulerHeight)
        g.lineStyle(1, Color(theme.dividerColor).rgbNumber())
          .moveTo(Layout.keyWidth, 0)
          .lineTo(Layout.keyWidth, Layout.rulerHeight)
          .moveTo(0, Layout.rulerHeight)
          .lineTo(width, Layout.rulerHeight)
      }}
    />
  )
}, areEquals)

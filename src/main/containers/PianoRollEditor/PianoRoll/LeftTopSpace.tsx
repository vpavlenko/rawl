import React, { FC } from "react"
import { useTheme } from "main/hooks/useTheme"
import { Graphics } from "@inlet/react-pixi"
import Color from "color"

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
          .drawRect(0, 0, theme.keyWidth, theme.rulerHeight)
        g.lineStyle(1, Color(theme.dividerColor).rgbNumber())
          .moveTo(theme.keyWidth, 0)
          .lineTo(theme.keyWidth, theme.rulerHeight)
          .moveTo(0, theme.rulerHeight)
          .lineTo(width, theme.rulerHeight)
      }}
    />
  )
}, areEquals)

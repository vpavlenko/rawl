import { PixiComponent } from "@inlet/react-pixi"
import Color from "color"
import isEqual from "lodash/isEqual"
import { Graphics as PIXIGraphics, InteractionEvent, Rectangle } from "pixi.js"
import React, { FC } from "react"
import { IRect } from "../../../common/geometry"
import { useTheme } from "../../hooks/useTheme"

const LINE_WIDTH = 2

interface RectProps {
  color: number
  bounds: IRect
  rightclick: (e: InteractionEvent) => void
}

const Rect = PixiComponent<RectProps, PIXIGraphics>("Rectangle", {
  create: (props) => {
    const g = new PIXIGraphics()
    g.addListener("rightclick", props.rightclick)
    g.interactive = true
    g.lineStyle(LINE_WIDTH, props.color, 1, 0).drawRect(0, 0, 1, 1)
    return g
  },
  applyProps: (g, _, { bounds }) => {
    g.x = bounds.x
    g.y = bounds.y
    g.width = bounds.width / 2
    g.height = bounds.height / 2
    g.hitArea = new Rectangle(0, 0, bounds.width, bounds.height)
  },
})

export interface PianoSelectionProps {
  bounds: IRect
  onRightClick: (e: InteractionEvent) => void
}

const PianoSelection: FC<PianoSelectionProps> = ({ bounds, onRightClick }) => {
  const theme = useTheme()
  const color = Color(theme.themeColor).rgbNumber()

  return <Rect color={color} bounds={bounds} rightclick={onRightClick} />
}

function areEqual(props: PianoSelectionProps, nextProps: PianoSelectionProps) {
  return isEqual(props.bounds, nextProps.bounds)
}

export default React.memo(PianoSelection, areEqual)

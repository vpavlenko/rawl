import React, { SFC } from "react"
import { Graphics as PIXIGraphics, interaction, Rectangle } from "pixi.js"
import Item from "components/Stage/Item"
import { IRect } from "common/geometry"
import { Graphics } from "@inlet/react-pixi"

export interface VelocityItemProps {
  id: number
  bounds: IRect
  selected: boolean
  fillColor: number
  itemHeight: number
  onMouseDown: (e: VelocityItemEvent) => void
}

export interface VelocityItemEvent {
  originalEvent: interaction.InteractionEvent
  item: VelocityItemProps
}

const VelocityItem: SFC<VelocityItemProps> = (props) => {
  const { bounds, selected, fillColor, itemHeight, onMouseDown } = props

  const draw = (g: PIXIGraphics) => {
    const strokeColor = 0x000000
    const color = selected ? strokeColor : fillColor
    const y = bounds.height - itemHeight

    g.clear()
      .beginFill(color)
      .lineStyle(1, strokeColor)
      .drawRect(0, y, bounds.width, itemHeight)
      .endFill()
  }

  return (
    <Graphics
      draw={draw}
      hitArea={new Rectangle(0, 0, bounds.width, bounds.height)}
      interactive={true}
      x={bounds.x}
      y={bounds.y}
      mousedown={(e) => onMouseDown({ originalEvent: e, item: props })}
    />
  )
}

export default VelocityItem

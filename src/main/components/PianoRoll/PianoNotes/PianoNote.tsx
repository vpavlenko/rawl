import React from "react"
import { Graphics as PIXIGraphics } from "pixi.js"
import { IRect } from "src/common/geometry"
import { useState } from "react"
import { Graphics } from "@inlet/react-pixi"

export type PianoNoteProps = IRect & {
  id: number
  velocity: number
  isSelected: boolean
  color: number
  borderColor: number
  selectedColor: number
  selectedBorderColor: number
  pointerdown?: (e: PIXI.interaction.InteractionEvent) => void
  pointermove?: (e: PIXI.interaction.InteractionEvent) => void
  pointerdrag?: (e: PIXI.interaction.InteractionEvent) => void
  pointerhover?: (e: PIXI.interaction.InteractionEvent) => void
  pointerup?: (e: PIXI.interaction.InteractionEvent) => void
}

export const PianoNote = (props: PianoNoteProps) => {
  const render = (g: PIXIGraphics) => {
    const alpha = props.velocity / 127
    const noteColor = props.isSelected ? props.selectedColor : props.color
    let { width, height } = props

    width = Math.round(width - 1) // 次のノートと被らないように小さくする
    height = Math.round(height)

    g.alpha = alpha
    g.lineStyle(
      1,
      props.isSelected ? props.selectedBorderColor : props.borderColor
    )
    g.beginFill(noteColor)
    g.drawRect(0, 0, width, height)
    g.endFill()
  }
  const [dragging, setDragging] = useState(false)
  const [hovering, setHover] = useState(false)

  return (
    <Graphics
      draw={render}
      x={Math.round(props.x)}
      y={Math.round(props.y)}
      interactive={true}
      pointerover={(e) => {
        setHover(true)
      }}
      pointerout={(e) => {
        setHover(false)
      }}
      pointerdown={(e) => {
        setDragging(true)
        props.pointerdown?.(e)
        console.log("down!", e.data.getLocalPosition(e.target))
      }}
      pointermove={(e) => {
        if (dragging) {
          props.pointerdrag?.(e)
        } else if (hovering) {
          props.pointerhover?.(e)
        }
        props.pointermove?.(e)
      }}
      pointerupoutside={(e) => {
        setDragging(false)
      }}
      pointerup={(e) => {
        setDragging(false)
        props.pointerup?.(e)
      }}
    />
  )
}
/*
function getPositionType({ local, item }: PianoNotesMouseEvent<MouseEvent>) {
  if (item.isDrum) {
    return "center"
  }
  const localX = local.x - item.bounds.x
  const edgeSize = Math.min(item.bounds.width / 3, 8)
  if (localX <= edgeSize) {
    return "left"
  }
  if (item.bounds.width - localX <= edgeSize) {
    return "right"
  }
  return "center"
}

*/

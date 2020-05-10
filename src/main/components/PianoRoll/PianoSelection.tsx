import React, { StatelessComponent } from "react"
import _ from "lodash"

import DrawCanvas from "components/DrawCanvas"
import { IRect } from "common/geometry"

const LINE_WIDTH = 2

function drawSelection(
  ctx: CanvasRenderingContext2D,
  { x, y, width, height }: IRect,
  color: string
) {
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = LINE_WIDTH
  ctx.rect(
    x + LINE_WIDTH / 2,
    y + LINE_WIDTH / 2,
    width - LINE_WIDTH,
    height - LINE_WIDTH
  )
  ctx.stroke()
}

export interface PianoSelectionProps {
  scrollLeft: number
  selectionBounds: IRect | null
  color: string
  width: number
  height: number
}

const PianoSelection: StatelessComponent<PianoSelectionProps> = ({
  scrollLeft,
  selectionBounds,
  color,
  width,
  height,
}) => {
  function draw(ctx: CanvasRenderingContext2D): void {
    const { width, height } = ctx.canvas
    ctx.save()
    ctx.clearRect(0, 0, width, height)
    ctx.translate(-scrollLeft, 0)
    if (selectionBounds) {
      drawSelection(ctx, selectionBounds, color)
    }
    ctx.restore()
  }

  return (
    <DrawCanvas
      draw={draw}
      className="PianoSelection"
      width={width}
      height={height}
    />
  )
}

PianoSelection.defaultProps = {
  scrollLeft: 0,
}

function areEqual(props: PianoSelectionProps, nextProps: PianoSelectionProps) {
  return (
    props.color === nextProps.color &&
    _.isEqual(props.selectionBounds, nextProps.selectionBounds) &&
    props.width === nextProps.width &&
    props.height === nextProps.height &&
    props.scrollLeft === nextProps.scrollLeft
  )
}

export default React.memo(PianoSelection, areEqual)

import React, { StatelessComponent, CSSProperties } from "react"

import DrawCanvas from "components/DrawCanvas"
import Item from "./Item"
import {
  IPoint,
  containsPoint as rectContainsPoint,
  intersects as rectIntersects
} from "common/geometry"

export interface StageMouseEvent<E> {
  nativeEvent: E
  items: Item[]
  local: IPoint
}

interface PointerEvent {
  offsetX: number
  offsetY: number
}

export interface StageProps {
  items: Item[]
  onMouseDown?: (e: StageMouseEvent<MouseEvent>) => void
  onMouseMove?: (e: StageMouseEvent<MouseEvent>) => void
  onMouseUp?: (e: StageMouseEvent<MouseEvent>) => void
  onWheel?: (e: StageMouseEvent<WheelEvent>) => void
  onDoubleClick?: (e: StageMouseEvent<MouseEvent>) => void
  onContextMenu?: (e: StageMouseEvent<MouseEvent>) => void
  width: number
  height: number
  scrollLeft?: number
  scrollTop?: number
  className?: string
  style?: CSSProperties
}

/**
 * Item の描画、マウスイベントのハンドリングを実装した Canvas
 */
const Stage: StatelessComponent<StageProps> = ({
  items,
  onMouseDown: _onMouseDown = () => {},
  onMouseMove: _onMouseMove = () => {},
  onMouseUp: _onMouseUp = () => {},
  onWheel: _onWheel = () => {},
  onDoubleClick: _onDoubleClick = () => {},
  onContextMenu: _onContextMenu = () => {},
  width,
  height,
  scrollLeft = 0,
  scrollTop = 0,
  className = "",
  style = {}
}) => {
  const draw = (ctx: CanvasRenderingContext2D) => {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    ctx.save()
    ctx.translate(0.5 - Math.round(scrollLeft), 0.5 - Math.round(scrollTop))
    drawItems(ctx)
    ctx.restore()
  }

  const drawItems = (ctx: CanvasRenderingContext2D) => {
    const viewRect = { x: scrollLeft, y: scrollTop, width, height }
    const displayedItems = items.filter(item =>
      rectIntersects(viewRect, item.bounds)
    )
    displayedItems.forEach(item => item.render(ctx))
  }

  const extendEvent = <T extends PointerEvent>(e: T): StageMouseEvent<T> => {
    const local = {
      x: e.offsetX + scrollLeft,
      y: e.offsetY + scrollTop
    }
    const hitItems = items.filter(item => rectContainsPoint(item.bounds, local))
    return {
      nativeEvent: e,
      items: hitItems,
      local
    }
  }

  let isMouseDown = false

  const onMouseDown = (e: React.MouseEvent) => {
    e.nativeEvent.preventDefault()
    isMouseDown = true

    let { left, top } = e.currentTarget.getBoundingClientRect()
    left -= scrollLeft
    top -= scrollTop
    const startPos = {
      x: e.nativeEvent.offsetX + scrollLeft,
      y: e.nativeEvent.offsetY + scrollTop
    }
    const clickedItems = items.filter(item =>
      rectContainsPoint(item.bounds, startPos)
    )

    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      const local = { x: e.clientX - left, y: e.clientY - top }
      _onMouseMove({
        nativeEvent: e,
        items: clickedItems,
        local
      })
    }

    const onMouseUp = (e: MouseEvent) => {
      e.preventDefault()
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)

      const local = { x: e.clientX - left, y: e.clientY - top }
      _onMouseUp({
        nativeEvent: e,
        items: clickedItems,
        local
      })
      isMouseDown = false
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)

    _onMouseDown({
      nativeEvent: e.nativeEvent,
      items: clickedItems,
      local: startPos
    })
  }

  const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) =>
    _onWheel(extendEvent(e.nativeEvent))

  const onMouseMoveCanvas = (e: React.MouseEvent) => {
    // ドラッグ中はウィンドウ外も扱うため document の eventListener から呼ぶが、
    // そうでないときはここから呼ぶ
    if (!isMouseDown) {
      _onMouseMove(extendEvent(e.nativeEvent))
    }
  }

  const onDoubleClick = (e: React.MouseEvent) =>
    _onDoubleClick(extendEvent(e.nativeEvent))

  const onContextMenu = (e: React.MouseEvent) =>
    _onContextMenu(extendEvent(e.nativeEvent))

  return (
    <DrawCanvas
      className={`Stage ${className}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMoveCanvas}
      onDoubleClick={onDoubleClick}
      onWheel={onWheel}
      onContextMenu={onContextMenu}
      draw={draw}
      width={width}
      height={height}
      style={style}
    />
  )
}

export default Stage

import React, { StatelessComponent, CSSProperties } from "react"

import DrawCanvas from "components/DrawCanvas"
import Item from "./Item"
import {
  IPoint,
  containsPoint as rectContainsPoint,
  intersects as rectIntersects
} from "common/geometry"

type ReactMouseEvent = React.MouseEvent<HTMLElement>

export interface ItemEvent {
  items: Item[]
  local: IPoint
}

export interface StageProps {
  items: Item[]
  onMouseDown?: (e: ItemEvent & ReactMouseEvent) => void
  onMouseMove?: (e: ItemEvent & (MouseEvent | ReactMouseEvent)) => void
  onMouseUp?: (e: ItemEvent & MouseEvent) => void
  onWheel?: (e: ItemEvent & React.WheelEvent<HTMLCanvasElement>) => void
  onDoubleClick?: (e: ItemEvent & ReactMouseEvent) => void
  onContextMenu?: (e: ItemEvent & ReactMouseEvent) => void
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
  onMouseDown: _onMouseDown,
  onMouseMove: _onMouseMove,
  onMouseUp: _onMouseUp,
  onWheel: _onWheel,
  onDoubleClick: _onDoubleClick,
  onContextMenu: _onContextMenu,
  width,
  height,
  scrollLeft,
  scrollTop,
  className,
  style
}) => {
  function draw(ctx: CanvasRenderingContext2D): void {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    ctx.save()
    ctx.translate(0.5 - Math.round(scrollLeft), 0.5 - Math.round(scrollTop))
    drawItems(ctx)
    ctx.restore()
  }

  function drawItems(ctx: CanvasRenderingContext2D): void {
    const viewRect = { x: scrollLeft, y: scrollTop, width, height }
    const displayedItems = items.filter(item =>
      rectIntersects(viewRect, item.bounds)
    )
    displayedItems.forEach(item => item.render(ctx))
  }

  let isMouseDown = false

  function onMouseDown(e: ReactMouseEvent): void {
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

    function onMouseMove(e: MouseEvent): void {
      e.preventDefault()
      const local = { x: e.clientX - left, y: e.clientY - top }
      _onMouseMove({
        ...e,
        items: clickedItems,
        local
      })
    }

    function onMouseUp(e: MouseEvent): void {
      e.preventDefault()
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)

      const local = { x: e.clientX - left, y: e.clientY - top }
      _onMouseUp({
        ...e,
        items: clickedItems,
        local
      })
      isMouseDown = false
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)

    _onMouseDown({
      ...e,
      items: clickedItems,
      local: startPos
    })
  }

  function onWheel(e: React.WheelEvent<HTMLCanvasElement>) {
    _onWheel(extendEvent(e))
  }

  function onMouseMoveCanvas(e: ReactMouseEvent) {
    // ドラッグ中はウィンドウ外も扱うため document の eventListener から呼ぶが、
    // そうでないときはここから呼ぶ
    if (!isMouseDown) {
      _onMouseMove(extendEvent(e))
    }
  }

  function onDoubleClick(e: ReactMouseEvent) {
    _onDoubleClick(extendEvent(e))
  }

  function onContextMenu(e: ReactMouseEvent) {
    _onContextMenu(extendEvent(e))
  }

  function extendEvent<T extends ReactMouseEvent>(e: T): T & ItemEvent {
    const local = {
      x: e.nativeEvent.offsetX + scrollLeft,
      y: e.nativeEvent.offsetY + scrollTop
    }
    const hitItems = items.filter(item => rectContainsPoint(item.bounds, local))
    return Object.assign({}, e, {
      items: hitItems,
      local
    })
  }

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

Stage.defaultProps = {
  onMouseDown: () => {},
  onMouseMove: () => {},
  onMouseUp: () => {},
  onWheel: () => {},
  onDoubleClick: () => {},
  onContextMenu: () => {},
  scrollLeft: 0,
  scrollTop: 0,
  className: "",
  style: {}
}

export default Stage

import React, { MouseEvent } from "react"

import DrawCanvas from "components/DrawCanvas.tsx"
import { IRect, containsPoint as rectContainsPoint, intersects as rectIntersects } from "model/Rect"
import Item from "./Item"
import { IPoint } from "model/Point"

interface ItemEvent extends MouseEvent<HTMLElement> {
  items: Item[]
  local: IPoint
}

export interface StageProps {
  items: Item[]
  onMouseDown: (ItemEvent) => void
  onMouseMove: (ItemEvent) => void
  onMouseUp: (ItemEvent) => void
  onWheel: (ItemEvent) => void
  onDoubleClick: (ItemEvent) => void
  onContextMenu: (ItemEvent) => void
  width: number
  height: number
  scrollLeft: number
  scrollTop: number
  className: string
  style: any
}

/**
 * Item の描画、マウスイベントのハンドリングを実装した Canvas
 */
export default function Stage({
  items = [],
  onMouseDown: _onMouseDown = () => { },
  onMouseMove: _onMouseMove = () => { },
  onMouseUp: _onMouseUp = () => { },
  onWheel: _onWheel = () => { },
  onDoubleClick = () => { },
  onContextMenu = () => { },
  width,
  height,
  scrollLeft = 0,
  scrollTop = 0,
  className = "",
  style
}: StageProps) {
  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    ctx.save()
    ctx.translate(0.5 - Math.round(scrollLeft), 0.5 - Math.round(scrollTop))
    drawItems(ctx)
    ctx.restore()
  }

  function drawItems(ctx) {
    const viewRect = { x: scrollLeft, y: scrollTop, width, height }
    const displayedItems = items.filter(item => rectIntersects(viewRect, item.bounds))
    displayedItems.forEach(item => item.render(ctx))
  }

  let isMouseDown = false

  function onMouseDown(e: MouseEvent<HTMLElement>) {
    e.nativeEvent.preventDefault()
    isMouseDown = true

    let { left, top } = e.currentTarget.getBoundingClientRect()
    left -= scrollLeft
    top -= scrollTop
    const startPos = {
      x: e.nativeEvent.offsetX + scrollLeft,
      y: e.nativeEvent.offsetY + scrollTop
    }
    const clickedItems = items.filter(item => rectContainsPoint(item.bounds, startPos))

    function onMouseMove(e) {
      e.preventDefault()
      const local = { x: e.clientX - left, y: e.clientY - top }
      _onMouseMove({
        ...e, 
        items: clickedItems, 
        local
      })
    }

    function onMouseUp(e) {
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

  function onWheel(e) {
    _onWheel(extendEvent(e))
  }

  function onMouseMoveCanvas(e: MouseEvent<HTMLElement>) {
    // ドラッグ中はウィンドウ外も扱うため document の eventListener から呼ぶが、
    // そうでないときはここから呼ぶ
    if (!isMouseDown) {
      _onMouseMove(extendEvent(e))
    }
  }

  function extendEvent(e: MouseEvent<HTMLElement>): ItemEvent {
    const local = {
      x: e.nativeEvent.offsetX + scrollLeft,
      y: e.nativeEvent.offsetY + scrollTop
    }
    const hitItems = items.filter(item => rectContainsPoint(item.bounds, local))
    return {
      ...e,
      items: hitItems, 
      local
    }
  }

  return <DrawCanvas
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
}

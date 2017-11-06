import React from "react"

import DrawCanvas from "components/DrawCanvas"
import Rect from "model/Rect"

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
  scaleX = 1,
  scaleY = 1,
  className = "",
  style
}) {
  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    ctx.save()
    ctx.translate(0.5 - Math.round(scrollLeft), 0.5 - Math.round(scrollTop))
    drawItems(ctx)
    ctx.restore()
  }

  function drawItems(ctx) {
    const viewRect = new Rect(scrollLeft, scrollTop, width, height)
    const displayedItems = items.filter(item => viewRect.intersects(item.bounds))
    displayedItems.forEach(item => item.render(ctx))
  }

  function onMouseDown(e) {
    e.nativeEvent.preventDefault()

    let { left, top } = e.target.getBoundingClientRect()
    left -= scrollLeft
    top -= scrollTop
    const startPos = {
      x: e.nativeEvent.offsetX + scrollLeft,
      y: e.nativeEvent.offsetY + scrollTop
    }
    const clickedItems = items.filter(item => item.bounds.containsPoint(startPos))

    function onMouseMove(e) {
      e.preventDefault()
      const local = { x: e.clientX - left, y: e.clientY - top }
      _onMouseMove(Object.assign(e, { items: clickedItems, local }))
    }

    function onMouseUp(e) {
      e.preventDefault()
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)

      const local = { x: e.clientX - left, y: e.clientY - top }
      _onMouseUp(Object.assign(e, { items: clickedItems, local }))
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)

    _onMouseDown(Object.assign(e, { items: clickedItems, local: startPos }))
  }

  function onWheel(e) {
    const local = {
      x: e.nativeEvent.offsetX + scrollLeft,
      y: e.nativeEvent.offsetY + scrollTop
    }
    const hitItems = items.filter(item => item.bounds.containsPoint(local))
    _onWheel(Object.assign(e, { items: hitItems, local }))
  }

  return <DrawCanvas
    className={`Stage ${className}`}
    onMouseDown={onMouseDown}
    onDoubleClick={onDoubleClick}
    onWheel={onWheel}
    onContextMenu={onContextMenu}
    draw={draw}
    width={width}
    height={height}
    style={style}
  />
}

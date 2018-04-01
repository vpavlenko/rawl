import React from "react"

import DrawCanvas from "components/DrawCanvas.tsx"

import Rect from "model/Rect"
import { pointSub } from "helpers/point"

import "./Stage.css"

const LINE_WIDTH = 2

function drawSelection(ctx, { x, y, width, height }, color, lineWidth) {
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.rect(
    x + LINE_WIDTH / 2,
    y + LINE_WIDTH / 2,
    width - LINE_WIDTH,
    height - LINE_WIDTH)
  ctx.stroke()
}

/**
 * id を持つ複数のアイテムを描画、範囲選択、右クリックメニューなどを実装した Stage
 */
export default function Stage({
  items = [],
  selectedItemIDs = [],
  selection,
  onMouseDown: _onMouseDown = () => { },
  onMouseMove: _onMouseMove = () => { },
  onMouseUp: _onMouseUp = () => { },
  onChangeSelection = () => { },
  onClickItem = () => { },
  onMoveItems = () => { },
  onContextMenu = () => { },
  width,
  height,
  scrollLeft = 0,
  scrollTop = 0,
  style
}) {
  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)

    ctx.save()
    ctx.translate(0.5 - Math.round(scrollLeft), 0.5 - Math.round(scrollTop))
    drawItems(ctx)
    drawSelections(ctx)
    ctx.restore()
  }

  function drawItems(ctx) {
    const viewRect = new Rect(scrollLeft, scrollTop, width + scrollLeft, height + scrollTop)
    const displayedItems = items.filter(item => viewRect.intersects(item.bounds))
    displayedItems.forEach(item => item.render(ctx))
  }

  function drawSelections(ctx) {
    if (selection) {
      drawSelection(ctx, selection, "blue", LINE_WIDTH)
    }
  }

  function handleCreateSelection(e, startPos, onMouseMove, onMouseUp) {
    onChangeSelection(null)

    onMouseMove((e, pos) => {
      onChangeSelection(Rect.fromPoints(startPos, pos))
    })

    onMouseUp((e, pos) => {
      const rect = Rect.fromPoints(startPos, pos)
      const valid = rect.width > 3 && rect.height > 3
      onChangeSelection(valid ? rect : null)
    })
  }

  function handleMoveSelection(e, startPos, selectedItems, onMouseMove, onMouseUp) {
    let isMoved = false

    onMouseMove((e, pos) => {
      const delta = pointSub(pos, startPos)
      if (delta.x > 0 || delta.y > 0) {
        isMoved = true
      }
      const rect = { ...selection }
      rect.x += delta.x
      rect.y += delta.y
      onChangeSelection(rect)

      const movedItems = selectedItems.map(item => ({
        ...item.bounds,
        x: item.x + delta.x,
        y: item.y + delta.y
      }))
      onMoveItems(movedItems)
    })

    onMouseUp((e, pos) => {
      if (!isMoved) {
        // 移動していなかったら選択範囲を削除
        onChangeSelection(null)
      }
    })
  }

  function handleMoveItem(e, startPos, selectedItem, onMouseMove, onMouseUp) {
    onChangeSelection(null)

    let isMoved = false

    onMouseMove((e, pos) => {
      const delta = pointSub(pos, startPos)
      if (delta.x > 0 || delta.y > 0) {
        isMoved = true
      }
      const item = { ...selectedItem.bounds }
      item.x += delta.x
      item.y += delta.y
      onMoveItems([item])
    })

    onMouseUp((e, pos) => {
      if (!isMoved) {
        // 移動していなかったらクリック
        onClickItem(selectedItem)
      }
    })
  }

  function onMouseDown(e) {
    const { left, top } = e.target.getBoundingClientRect()
    const startPos = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }

    let mouseMove = () => { }
    let mouseUp = () => { }
    const registerMouseMove = f => mouseMove = f
    const registerMouseUp = f => mouseUp = f

    const clickedItems = items.filter(item => item.bounds.containsPoint(startPos))
    const selectedItems = items.filter(item => selectedItemIDs.includes(item.id))
    const isItemClicked = clickedItems.length > 0
    const isSelectionClicked = selection && new Rect(selection).containsPoint(startPos)

    switch (e.button) {
      case 0: {
        if (isSelectionClicked) {
          // 選択範囲内をドラッグした場合
          handleMoveSelection(e, startPos, selectedItems, registerMouseMove, registerMouseUp)
        } else if (isItemClicked) {
          // アイテムをドラッグした場合
          const item = clickedItems[clickedItems.length - 1]
          handleMoveItem(e, startPos, item, registerMouseMove, registerMouseUp)
        } else {
          // 何も無いところをドラッグした場合
          handleCreateSelection(e, startPos, registerMouseMove, registerMouseUp)
        }
        break
      }
      case 2: {
        // 右クリックした場合
        const items = isSelectionClicked ? selectedItems :
          isItemClicked ? [clickedItems[clickedItems.length - 1]] : []

        onContextMenu({ ...e, local: startPos, items })
      }
    }

    function onMouseMove(e) {
      const pos = { x: e.clientX - left, y: e.clientY - top }
      mouseMove(e, pos)

      _onMouseMove(e)
    }

    function onMouseUp(e) {
      const pos = { x: e.clientX - left, y: e.clientY - top }
      mouseUp(e, pos)
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)

      _onMouseUp(e)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)

    _onMouseDown(e)
  }

  return <Stage
    draw={draw}
    width={width}
    height={height}
    style={style}
  />
}

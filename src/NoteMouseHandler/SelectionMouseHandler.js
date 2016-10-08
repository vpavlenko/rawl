import _ from "lodash"
import MouseHandler, { defaultActionFactory } from "./NoteMouseHandler"
import { createNoteAction } from "./PencilMouseHandler"
import Rect from "../model/Rect"
import { pointSub } from "../helpers/point"

export default class SelectionMouseHandler extends MouseHandler {
  constructor() {
    super([defaultActionFactory, actionFactory], getCursor)
  }
}

function actionFactory(local, ctx, e) {
  if (e.relatedTarget) {
    return null
  }

  const { selection, transform } = ctx
  if (selection && selection.enabled) {
    const selectionRect = selection.getBounds(transform)
    const clicked = selectionRect.contains(local.x, local.y)
    if (clicked) {
      const type = getDragPositionType(local.x - selectionRect.x, selectionRect.width)
      switch (type) {
        case "center": return moveSelectionAction(ctx)
        case "right": return dragSelectionRightEdgeAction(ctx)
        case "left": return dragSelectionLeftEdgeAction(ctx)
      }
    }
  }

  if (e.nativeEvent.detail == 2) {
    return createNoteAction(ctx)
  }
  return createSelectionAction(ctx)
}

function getCursor(local, ctx) {
  const selectionRect = ctx.selection.getBounds(ctx.transform)
  const hover = selectionRect && selectionRect.contains(local.x, local.y)
  if (hover) {
    const type = getDragPositionType(local.x - selectionRect.x, selectionRect.width)
    return cursorForPositionType(type)
  }
  return "crosshair"
}

const createSelectionAction = ctx => (onMouseDown, onMouseMove, onMouseUp) => {
  const { selection, quantizer, transform } = ctx
  let startPosition

  // 選択範囲外でクリックした場合は選択範囲をリセット
  onMouseDown(local => {
    startPosition = local
    selection.reset()
    // TODO: カーソルを移動
  })

  onMouseMove(local => {
    const rect = Rect.fromPoints(startPosition, local)
    selection.resize(rect, quantizer, transform)
  })

  onMouseUp(local => {
    const rect = Rect.fromPoints(startPosition, local)
    const events = ctx.getEventsInRect(rect)
    selection.setNotes(events)
  })
}

const moveSelectionAction = ctx => (onMouseDown, onMouseMove) => {
  const { selection, transform, quantizer, track } = ctx
  const originalSelection = _.clone(ctx.selection)
  let startPosition

  onMouseDown(local => {
    startPosition = local
  })

  onMouseMove(local => {
    const movement = pointSub(local, startPosition)

    const dt = quantizer.round(transform.getTicks(movement.x))
    const dn = Math.round(transform.getDeltaNoteNumber(movement.y))

    // 確定済みの選択範囲をドラッグした場合はノートと選択範囲を移動
    selection.moveTo(
      originalSelection.fromTick + dt,
      originalSelection.fromNoteNumber + dn)

    track.transaction(it => {
      selection.notes.forEach(n => {
        it.updateEvent(n.id, {
          tick: n.tick + dt,
          noteNumber: n.noteNumber + dn
        })
      })
    })
  })
}

const dragSelectionLeftEdgeAction = (ctx) => (onMouseDown, onMouseMove) => {
  const { selection, transform, quantizer, track } = ctx
  const originalFromTick = ctx.selection.fromTick
  let startPosition

  onMouseDown(local => { startPosition = local })

  onMouseMove(local => {
    const movement = pointSub(local, startPosition)
    const dt = quantizer.floor(transform.getTicks(movement.x))
    const fromTick = originalFromTick + dt

    // 選択領域のサイズがゼロになるときは終了
    if (selection.toTick - fromTick <= 0) {
      return
    }

    const notes = selection.notes.map(n => { return {
      id: n.id,
      tick: n.tick + dt,
      duration: n.duration - dt
    }})

    // 幅がゼロになるノートがあるときは変形しない
    if (!_.every(notes, r => r.duration > 0)) {
      return
    }

    // 右端を固定して長さを変更
    selection.setFromTick(fromTick)
    track.transaction(it => {
      notes.forEach(n => it.updateEvent(n.id, n))
    })
  })
}

const dragSelectionRightEdgeAction = (ctx) => (onMouseDown, onMouseMove) => {
  const { selection, transform, quantizer, track } = ctx
  const originalToTick = ctx.selection.toTick
  let startPosition

  onMouseDown(local => { startPosition = local })

  onMouseMove(local => {
    const movement = pointSub(local, startPosition)
    const dt = quantizer.floor(transform.getTicks(movement.x))
    const toTick = originalToTick + dt

    // 選択領域のサイズがゼロになるときは終了
    if (toTick - selection.fromTick <= 0) {
      return
    }

    // 右端を固定して長さを変更
    selection.setToTick(toTick)

    const notes = selection.notes.map(n => { return {
      id: n.id,
      duration: Math.max(quantizer.unit, n.duration + dt)
    }})
    track.transaction(it => {
      notes.forEach(n => it.updateEvent(n.id, n))
    })
  })
}

// helpers

function getDragPositionType(localX, targetWidth) {
  const edgeSize = Math.min(targetWidth / 3, 8)
  if (localX <= edgeSize) { return "left" }
  if (targetWidth - localX <= edgeSize) { return "right" }
  return "center"
}

function cursorForPositionType(type) {
  switch(type) {
    case "left":
    case "right":
      return "w-resize"
    default: return "move"
  }
}

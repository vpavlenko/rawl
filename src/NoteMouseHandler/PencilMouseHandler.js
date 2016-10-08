import _ from "lodash"
import SharedService from "../services/SharedService"
import MouseHandler, { defaultActionFactory } from "./NoteMouseHandler"
import { pointSub } from "../helpers/point"

const defaultCursor = `url("./images/iconmonstr-pencil-14-16.png") 0 16, default`

export default class PencilMouseHandler extends MouseHandler {
  constructor() {
    super([defaultActionFactory, actionFactory], getCursor, defaultCursor)
  }
}

function actionFactory(local, ctx, e) {
  const rects = ctx.getEventsUnderPoint(local.x, local.y)

  if (e.nativeEvent.button != 0) {
    return null
  }

  if (rects.length > 0) {
    const note = rects[0]
    if (e.nativeEvent.detail == 2) {
      return removeNoteAction(ctx, note)
    } else {
      const offset = pointSub(local, note)
      const type = getDragPositionType(offset.x, note.width)
      switch(type) {
        case "center": return moveNoteAction(ctx, note)
        case "left": return dragLeftNoteAction(ctx, note)
        case "right": return dragRightNoteAction(ctx, note)
      }
    }
  } else if (!e.relatedTarget) {
    return createNoteAction(ctx)
  }
  return null
}

function getCursor(local, ctx) {
  const rects = ctx.getEventsUnderPoint(local.x, local.y)
  if (rects.length > 0) {
    const rect = rects[0]
    const pos = pointSub(local, rect)
    const type = getDragPositionType(pos.x, rect.width)
    return cursorForPositionType(type)
  }

  return defaultCursor
}

function onNoteMouseMove(ctx, local, startPosition, note) {
  const { track, transform, quantizer } = ctx

  const movement = {
    x: local.x - startPosition.x,
    y: local.y - startPosition.y
  }

  // 移動
  const dt = transform.getTicks(movement.x)
  const tick = quantizer.round(note.tick + dt)
  const dn = Math.round(transform.getDeltaNoteNumber(movement.y))
  const noteNumber = note.noteNumber + dn

  const pitchChanged = noteNumber != track.getEventById(note.id).noteNumber

  const n = track.updateEvent(note.id, {
    tick: tick,
    noteNumber: noteNumber
  })

  if (pitchChanged) {
    SharedService.player.playNote(n)
  }
}

export const createNoteAction = ctx => (onMouseDown, onMouseMove) => {
  const { track, transform, quantizer } = ctx
  let startPosition
  let startNote

  onMouseDown(local => {
    startPosition = local

    const note = createNote(
      quantizer.floor(transform.getTicks(local.x)),
      Math.ceil(transform.getNoteNumber(local.y)),
      quantizer.unit
    )
    track.addEvent(note)
    SharedService.player.playNote(note)
    startNote = _.clone(note)
  })

  onMouseMove(local => { onNoteMouseMove(ctx, local, startPosition, startNote) })
}

const removeNoteAction = (ctx, note) => (onMouseDown) => {
  const { track, } = ctx
  onMouseDown(() => { track.removeEvent(note.id) })
}

const moveNoteAction = (ctx, note) => (onMouseDown, onMouseMove) => {
  let startPosition
  let startNote = _.clone(note)
  onMouseDown(local => { startPosition = local })
  onMouseMove(local => { onNoteMouseMove(ctx, local, startPosition, startNote) })
}

const dragLeftNoteAction = (ctx, note) => (onMouseDown, onMouseMove) => {
  const { track, transform, quantizer } = ctx
  let startPosition

  onMouseDown(local => { startPosition = local })

  onMouseMove(local => {
    const movement = pointSub(local, startPosition)

    // 右端を固定して長さを変更
    const dt = transform.getTicks(movement.x)
    const tick = quantizer.round(note.tick + dt)
    if (note.tick < tick) {
      return
    }

    track.updateEvent(note.id, {
      tick: tick,
      duration: note.duration + (note.tick - tick)
    })
  })
}

const dragRightNoteAction = (ctx, note) => (onMouseDown, onMouseMove) => {
  const { track, transform, quantizer } = ctx
  let startPosition

  onMouseDown(local => { startPosition = local })

  onMouseMove(local => {
    const movement = pointSub(local, startPosition)

    // 長さを変更
    const dt = transform.getTicks(movement.x)
    const duration = Math.max(quantizer.unit,
      quantizer.round(dt + note.duration))
    if (note.duration == duration) {
      return
    }

    track.updateEvent(note.id, {duration: duration})
  })
}

// helpers

function createNote(tick = 0, noteNumber = 48, duration = 240, velocity = 127, channel) {
  return {
    type: "channel",
    subtype: "note",
    noteNumber: noteNumber || 48,
    tick: tick || 0,
    velocity: velocity || 127,
    duration: duration || 240,
    channel: channel
  }
}

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

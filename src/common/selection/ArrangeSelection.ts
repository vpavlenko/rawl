import Quantizer from "../quantizer"
import { ArrangePoint } from "../transform/ArrangePoint"

export interface ArrangeSelection {
  fromTick: number
  fromTrackIndex: number
  toTick: number
  toTrackIndex: number
}

export function arrangeSelectionFromPoints(
  start: ArrangePoint,
  end: ArrangePoint,
  quantizer: Quantizer,
  maxTrackIndex: number,
): ArrangeSelection {
  const startSelection = selectionForPoint(start, quantizer)
  const endSelection = selectionForPoint(end, quantizer)
  return clampSelection(
    unionSelections(startSelection, endSelection),
    maxTrackIndex,
  )
}

export const selectionForPoint = (
  point: ArrangePoint,
  quantizer: Quantizer,
): ArrangeSelection => {
  const fromTick = quantizer.floor(point.tick)
  const toTick = quantizer.ceil(point.tick)
  return {
    fromTick,
    toTick,
    fromTrackIndex: Math.floor(point.trackIndex),
    toTrackIndex: Math.floor(point.trackIndex) + 1,
  }
}

export const unionSelections = (
  a: ArrangeSelection,
  b: ArrangeSelection,
): ArrangeSelection => {
  return {
    fromTick: Math.min(a.fromTick, b.fromTick),
    toTick: Math.max(a.toTick, b.toTick),
    fromTrackIndex: Math.min(a.fromTrackIndex, b.fromTrackIndex),
    toTrackIndex: Math.max(a.toTrackIndex, b.toTrackIndex),
  }
}

export const clampSelection = (
  selection: ArrangeSelection,
  maxTrackIndex: number,
): ArrangeSelection => ({
  fromTick: Math.max(0, selection.fromTick),
  toTick: Math.max(0, selection.toTick),
  fromTrackIndex: Math.min(
    maxTrackIndex,
    Math.max(0, selection.fromTrackIndex),
  ),
  toTrackIndex: Math.min(maxTrackIndex, Math.max(0, selection.toTrackIndex)),
})

export const movedSelection = (
  selection: ArrangeSelection,
  delta: ArrangePoint,
): ArrangeSelection => ({
  fromTick: selection.fromTick + delta.tick,
  toTick: selection.toTick + delta.tick,
  fromTrackIndex: selection.fromTrackIndex + delta.trackIndex,
  toTrackIndex: selection.toTrackIndex + delta.trackIndex,
})

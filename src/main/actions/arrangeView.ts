import mapValues from "lodash/mapValues"
import {
  fromPoints as rectFromPoints,
  IPoint,
  IRect,
} from "../../common/geometry"
import { isNotUndefined } from "../../common/helpers/array"
import Quantizer from "../../common/quantizer"
import Track, { isNoteEvent, NoteEvent } from "../../common/track"
import clipboard from "../services/Clipboard"
import RootStore from "../stores/RootStore"

const createRect = (tracks: Track[], from: IPoint, to: IPoint) => {
  const rect = rectFromPoints(from, to)
  rect.height = Math.min(
    tracks.length - rect.y,
    Math.max(from.y, to.y) - rect.y
  )

  if (rect.y < 0) {
    // Ruler をドラッグしている場合は全てのトラックを選択する
    rect.y = 0
    rect.height = tracks.length
  }
  if (rect.height <= 0 || rect.width < 3) {
    return null
  }
  return rect
}

const quantizeRect = (quantizer: Quantizer, rect: IRect | null) => {
  if (rect === null) {
    return null
  }
  return {
    x: quantizer.round(rect.x),
    y: Math.floor(rect.y),
    width: quantizer.round(rect.width),
    height: Math.ceil(rect.height),
  }
}

export const arrangeStartSelection = (rootStore: RootStore) => (
  pos: IPoint
) => {
  const { arrangeViewStore: s } = rootStore

  s.selection = null
  s.selectedEventIds = {}
}

export const arrangeResizeSelection = (rootStore: RootStore) => (
  start: IPoint,
  end: IPoint
) => {
  const {
    arrangeViewStore: s,
    song: { tracks },
    services: { quantizer },
  } = rootStore
  // 選択範囲作成時 (確定前) のドラッグ中
  s.selection = quantizeRect(quantizer, createRect(tracks, start, end))
}

export const arrangeEndSelection = (rootStore: RootStore) => (
  start: IPoint,
  end: IPoint
) => {
  const {
    arrangeViewStore: s,
    song: { tracks },
    services: { quantizer },
  } = rootStore

  const selection = quantizeRect(quantizer, createRect(tracks, start, end))
  if (selection) {
    s.selection = selection
    s.selectedEventIds = getNotesInSelection(tracks, selection)
  }
}

export const arrangeMoveSelection = (rootStore: RootStore) => (pos: IPoint) => {
  const {
    arrangeViewStore: s,
    song,
    services: { quantizer },
  } = rootStore

  if (s.selection === null) {
    return
  }
  const { tracks } = song
  // 選択範囲を移動
  const selection = quantizeRect(quantizer, {
    x: Math.max(pos.x, 0),
    y: Math.min(Math.max(pos.y, 0), tracks.length - s.selection.height),
    width: s.selection.width,
    height: s.selection.height,
  })

  if (!selection) {
    return
  }

  const dt = selection.x - s.selection.x
  const di = selection.y - s.selection.y
  s.selection = selection

  if (dt === 0 && di === 0) {
    return
  }

  // ノートを移動

  const updates = []
  for (const [trackIndex, selectedEvents] of Object.entries(
    s.selectedEventIds
  )) {
    const trackId = parseInt(trackIndex, 10)
    const track = tracks[trackId]
    const events = s.selectedEventIds[trackId]
      .map((id) => track.getEventById(id))
      .filter(isNotUndefined)

    if (di === 0) {
      track.updateEvents(
        events.map((e) => ({
          id: e.id,
          tick: e.tick + dt,
        }))
      )
    } else {
      updates.push({
        sourceTrackId: trackId,
        destinationTrackId: trackId + di,
        events: events.map((e) => ({
          ...e,
          tick: e.tick + dt,
        })),
      })
    }
  }
  if (di !== 0) {
    const ids: { [key: number]: number[] } = {}
    for (const u of updates) {
      tracks[u.sourceTrackId].removeEvents(u.events.map((e) => e.id))
      const events = tracks[u.destinationTrackId].addEvents(u.events)
      ids[u.destinationTrackId] = events.map((e) => e.id)
    }
    s.selectedEventIds = ids
  }
}

export const arrangeCopySelection = (rootStore: RootStore) => () => {
  const {
    arrangeViewStore: s,
    song: { tracks },
  } = rootStore

  const selection = s.selection
  if (selection === null) {
    return
  }
  // 選択されたノートをコピー
  const notes = mapValues(s.selectedEventIds, (ids, trackId) => {
    const track = tracks[parseInt(trackId, 10)]
    return ids
      .map((id) => track.getEventById(id))
      .filter(isNotUndefined)
      .map((note) => ({
        ...note,
        tick: note.tick - selection.x, // 選択範囲からの相対位置にする
      }))
  })
  clipboard.writeText(
    JSON.stringify({
      type: "arrange_notes",
      notes,
    })
  )
}

export const arrangePasteSelection = (rootStore: RootStore) => () => {
  const {
    song: { tracks },
    services: { player },
  } = rootStore

  // 現在位置にコピーしたノートをペースト
  const text = clipboard.readText()
  if (!text || text.length === 0) {
    return
  }
  const obj = JSON.parse(text)
  if (obj.type !== "arrange_notes") {
    return
  }
  for (const trackId in obj.notes) {
    const notes = obj.notes[trackId].map((note: NoteEvent) => ({
      ...note,
      tick: note.tick + player.position,
    }))
    tracks[parseInt(trackId)].addEvents(notes)
  }
}

export const arrangeDeleteSelection = (rootStore: RootStore) => () => {
  const {
    arrangeViewStore: s,
    song: { tracks },
  } = rootStore

  // 選択範囲と選択されたノートを削除
  for (const trackId in s.selectedEventIds) {
    tracks[trackId].removeEvents(s.selectedEventIds[trackId])
  }
  s.selection = null
  s.selectedEventIds = []
}

// returns { trackId: [eventId] }
function getNotesInSelection(tracks: Track[], selection: IRect) {
  const startTick = selection.x
  const endTick = selection.x + selection.width
  const ids: { [key: number]: number[] } = {}
  for (
    let trackIndex = selection.y;
    trackIndex < selection.y + selection.height;
    trackIndex++
  ) {
    const track = tracks[trackIndex]
    const events = track.events
      .filter(isNoteEvent)
      .filter((e) => e.tick >= startTick && e.tick <= endTick)
    ids[trackIndex] = events.map((e) => e.id)
  }
  return ids
}

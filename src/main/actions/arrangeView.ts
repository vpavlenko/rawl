import { fromPoints as rectFromPoints, IPoint, IRect } from "common/geometry"
import _ from "lodash"
import clipboard from "services/Clipboard.ts"
import RootStore from "../stores/RootStore"
import Track, { NoteEvent, isNoteEvent } from "common/track"
import { openContextMenu } from "../components/groups/ContextMenu"
import { ArrangeContextMenu } from "../menus/ArrangeContextMenu"
import { isNotUndefined } from "common/helpers/array"
import { Action, Mutator } from "../createDispatcher"
import Quantizer from "src/common/quantizer"

export interface ArrangeStartSelection {
  type: "arrangeStartSelection"
  pos: IPoint
}
export const arrangeStartSelection = (pos: IPoint): ArrangeStartSelection => ({
  type: "arrangeStartSelection",
  pos,
})

export interface ArrangeResizeSelection {
  type: "arrangeResizeSelection"
  start: IPoint
  end: IPoint
}
export const arrangeResizeSelection = (
  start: IPoint,
  end: IPoint
): ArrangeResizeSelection => ({ type: "arrangeResizeSelection", start, end })

export interface ArrangeEndSelection {
  type: "arrangeEndSelection"
  start: IPoint
  end: IPoint
}
export const arrangeEndSelection = (
  start: IPoint,
  end: IPoint
): ArrangeEndSelection => ({ type: "arrangeEndSelection", start, end })

export interface ArrangeMoveSelection {
  type: "arrangeMoveSelection"
  pos: IPoint
}
export const arrangeMoveSelection = (pos: IPoint): ArrangeMoveSelection => ({
  type: "arrangeMoveSelection",
  pos,
})

export interface ArrangeOpenContextMenu {
  type: "arrangeOpenContextMenu"
  e: React.MouseEvent
  isSelectionSelected: boolean
}
export const arrangeOpenContextMenu = (
  e: React.MouseEvent,
  isSelectionSelected: boolean
): ArrangeOpenContextMenu => ({
  type: "arrangeOpenContextMenu",
  e,
  isSelectionSelected,
})

export interface ArrangeCopySelection {
  type: "arrangeCopySelection"
}
export const arrangeCopySelection = (): ArrangeCopySelection => ({
  type: "arrangeCopySelection",
})

export interface ArrangePasteSelection {
  type: "arrangePasteSelection"
}
export const arrangePasteSelection = (): ArrangePasteSelection => ({
  type: "arrangePasteSelection",
})

export interface ArrangeDeleteSelection {
  type: "arrangeDeleteSelection"
}
export const arrangeDeleteSelection = (): ArrangeDeleteSelection => ({
  type: "arrangeDeleteSelection",
})

export type ArrangeViewAction =
  | ArrangeStartSelection
  | ArrangeResizeSelection
  | ArrangeEndSelection
  | ArrangeMoveSelection
  | ArrangeOpenContextMenu
  | ArrangeCopySelection
  | ArrangePasteSelection
  | ArrangeDeleteSelection

export default (action: Action): Mutator | null => {
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
  switch (action.type) {
    case "arrangeStartSelection":
      return ({ arrangeViewStore: s }) => {
        s.selection = null
        s.selectedEventIds = {}
      }
    case "arrangeResizeSelection":
      return ({
        arrangeViewStore: s,
        song: { tracks },
        services: { quantizer },
      }) => {
        // 選択範囲作成時 (確定前) のドラッグ中
        s.selection = quantizeRect(
          quantizer,
          createRect(tracks, action.start, action.end)
        )
      }
    case "arrangeEndSelection":
      return ({
        arrangeViewStore: s,
        song: { tracks },
        services: { quantizer },
      }) => {
        const selection = quantizeRect(
          quantizer,
          createRect(tracks, action.start, action.end)
        )
        if (selection) {
          s.selection = selection
          s.selectedEventIds = getNotesInSelection(tracks, selection)
        }
      }
    case "arrangeMoveSelection":
      return ({ arrangeViewStore: s, song, services: { quantizer } }) => {
        if (s.selection === null) {
          return
        }
        const { tracks } = song
        const { pos } = action
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
        for (let [trackIndex, selectedEvents] of Object.entries(
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
          for (let u of updates) {
            tracks[u.sourceTrackId].removeEvents(u.events.map((e) => e.id))
            const events = tracks[u.destinationTrackId].addEvents(u.events)
            ids[u.destinationTrackId] = events.map((e) => e.id)
          }
          s.selectedEventIds = ids
        }
      }
    case "arrangeOpenContextMenu":
      return (store) => {
        openContextMenu(
          action.e,
          ArrangeContextMenu(store.dispatch2, action.isSelectionSelected)
        )
      }
    case "arrangeCopySelection":
      return ({ arrangeViewStore: s, song: { tracks } }) => {
        const selection = s.selection
        if (selection === null) {
          return
        }
        // 選択されたノートをコピー
        const notes = _.mapValues(s.selectedEventIds, (ids, trackId) => {
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
    case "arrangePasteSelection":
      return ({ song: { tracks }, services: { player } }) => {
        // 現在位置にコピーしたノートをペースト
        const text = clipboard.readText()
        if (!text || text.length === 0) {
          return
        }
        const obj = JSON.parse(text)
        if (obj.type !== "arrange_notes") {
          return
        }
        for (let trackId in obj.notes) {
          const notes = obj.notes[trackId].map((note: NoteEvent) => ({
            ...note,
            tick: note.tick + player.position,
          }))
          tracks[parseInt(trackId)].addEvents(notes)
        }
      }
    case "arrangeDeleteSelection":
      return ({ arrangeViewStore: s, song: { tracks } }) => {
        // 選択範囲と選択されたノートを削除
        for (let trackId in s.selectedEventIds) {
          tracks[trackId].removeEvents(s.selectedEventIds[trackId])
        }
        s.selection = null
        s.selectedEventIds = []
      }
  }
  return null
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

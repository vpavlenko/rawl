import { fromPoints as rectFromPoints, IPoint, IRect } from "common/geometry"
import _ from "lodash"
import clipboard from "services/Clipboard.ts"
import { open as openContextMenu } from "components/ArrangeView/ArrangeContextMenu"
import RootStore from "../stores/RootStore"
import Track, { NoteEvent, isNoteEvent } from "common/track"

export const ARRANGE_START_SELECTION = Symbol()
export const ARRANGE_RESIZE_SELECTION = Symbol()
export const ARRANGE_END_SELECTION = Symbol()
export const ARRANGE_MOVE_SELECTION = Symbol()
export const ARRANGE_OPEN_CONTEXT_MENU = Symbol()
export const ARRANGE_COPY_SELECTION = Symbol()
export const ARRANGE_PASTE_SELECTION = Symbol()
export const ARRANGE_DELETE_SELECTION = Symbol()

export default ({
  dispatch,
  song: { tracks },
  arrangeViewStore: s,
  services: { quantizer, player }
}: RootStore) => {
  const createRect = (from: IPoint, to: IPoint) => {
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

  const quantizeRect = (rect: IRect) => {
    if (!rect) {
      return null
    }
    return {
      x: quantizer.round(rect.x),
      y: Math.floor(rect.y),
      width: quantizer.round(rect.width),
      height: Math.ceil(rect.height)
    }
  }

  return {
    [ARRANGE_START_SELECTION]: (pos: IPoint) => {
      s.selection = null
      s.selectedEventIds = {}
    },

    [ARRANGE_RESIZE_SELECTION]: ({
      start,
      end
    }: {
      start: IPoint
      end: IPoint
    }) => {
      // 選択範囲作成時 (確定前) のドラッグ中
      s.selection = quantizeRect(createRect(start, end))
    },

    [ARRANGE_END_SELECTION]: ({
      start,
      end
    }: {
      start: IPoint
      end: IPoint
    }) => {
      const selection = quantizeRect(createRect(start, end))
      if (selection) {
        s.selection = selection
        s.selectedEventIds = getNotesInSelection(tracks, selection)
      }
    },

    [ARRANGE_MOVE_SELECTION]: (pos: IPoint) => {
      // 選択範囲を移動
      const selection = quantizeRect({
        x: Math.max(pos.x, 0),
        y: Math.min(Math.max(pos.y, 0), tracks.length - s.selection.height),
        width: s.selection.width,
        height: s.selection.height
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
          .map(id => track.getEventById(id))
          .filter(e => e)

        if (di === 0) {
          track.updateEvents(
            events.map(e => ({
              id: e.id,
              tick: e.tick + dt
            }))
          )
        } else {
          updates.push({
            sourceTrackId: trackId,
            destinationTrackId: trackId + di,
            events: events.map(e => ({
              ...e,
              tick: e.tick + dt
            }))
          })
        }
      }
      if (di !== 0) {
        const ids: { [key: number]: number[] } = {}
        for (let u of updates) {
          tracks[u.sourceTrackId].removeEvents(u.events.map(e => e.id))
          const events = tracks[u.destinationTrackId].addEvents(u.events)
          ids[u.destinationTrackId] = events.map(e => e.id)
        }
        s.selectedEventIds = ids
      }
    },

    [ARRANGE_OPEN_CONTEXT_MENU]: (
      e: React.MouseEvent,
      isSelectionSelected: boolean
    ) => {
      openContextMenu(dispatch, e, isSelectionSelected)
    },

    [ARRANGE_COPY_SELECTION]: () => {
      // 選択されたノートをコピー
      const notes = _.mapValues(s.selectedEventIds, (ids, trackId) =>
        ids.map(id => {
          const note = tracks[parseInt(trackId, 10)].getEventById(id)
          return {
            ...note,
            tick: note.tick - s.selection.x // 選択範囲からの相対位置にする
          }
        })
      )
      clipboard.writeText(
        JSON.stringify({
          type: "arrange_notes",
          notes
        })
      )
    },

    [ARRANGE_PASTE_SELECTION]: () => {
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
          tick: note.tick + player.position
        }))
        tracks[parseInt(trackId)].addEvents(notes)
      }
    },

    [ARRANGE_DELETE_SELECTION]: () => {
      // 選択範囲と選択されたノートを削除
      for (let trackId in s.selectedEventIds) {
        tracks[trackId].removeEvents(s.selectedEventIds[trackId])
      }
      s.selection = null
      s.selectedEventIds = []
    }
  }
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
      .filter(e => e.tick >= startTick && e.tick <= endTick)
    ids[trackIndex] = events.map(e => e.id)
  }
  return ids
}

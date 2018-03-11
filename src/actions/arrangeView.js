import Rect from "model/Rect"
import _ from "lodash"
import clipboard from "services/Clipboard.ts"
import { open as openContextMenu } from "containers/ArrangeView/ArrangeContextMenu"

export default ({ dispatch, song: { tracks }, arrangeViewStore: s, services: { quantizer, player } }) => {
  const createRect = (from, to) => {
    const rect = Rect.fromPoints(from, to)
    rect.height = Math.min(tracks.length - rect.y,
      Math.max(from.y, to.y) - rect.y)

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

  const quantizeRect = rect => {
    if (!rect) {
      return null
    }
    return new Rect(
      quantizer.round(rect.x),
      Math.floor(rect.y),
      quantizer.round(rect.width),
      Math.ceil(rect.height)
    )
  }

  return {
    "ARRANGE_START_SELECTION": (pos) => {
      s.selection = null
      s.selectedEventIds = {}
    },

    "ARRANGE_RESIZE_SELECTION": ({ start, end }) => {
      // 選択範囲作成時 (確定前) のドラッグ中
      s.selection = quantizeRect(createRect(start, end))
    },

    "ARRANGE_END_SELECTION": ({ start, end }) => {
      const selection = quantizeRect(createRect(start, end))
      if (selection) {
        s.selection = selection
        s.selectedEventIds = getNotesInSelection(tracks, selection)
      }
    },

    "ARRANGE_MOVE_SELECTION": (pos) => {
      // 選択範囲を移動
      const selection = quantizeRect(new Rect(
        Math.max(pos.x, 0),
        Math.min(Math.max(pos.y, 0), tracks.length - s.selection.height),
        s.selection.width,
        s.selection.height))

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
      for (let trackIndex in s.selectedEventIds) {
        trackIndex = parseInt(trackIndex, 10)
        const track = tracks[trackIndex]
        const events = s.selectedEventIds[trackIndex].map(id => track.getEventById(id)).filter(e => e)

        if (di === 0) {
          track.updateEvents(events.map(e => ({
            id: e.id, tick: e.tick + dt
          })))
        } else {
          updates.push({
            sourceTrackId: trackIndex,
            destinationTrackId: trackIndex + di,
            events: events.map(e => ({
              ...e, tick: e.tick + dt
            }))
          })
        }
      }
      if (di !== 0) {
        const ids = {}
        for (let u of updates) {
          tracks[u.sourceTrackId].removeEvents(u.events.map(e => e.id))
          const events = tracks[u.destinationTrackId].addEvents(u.events)
          ids[u.destinationTrackId] = events.map(e => e.id)
        }
        s.selectedEventIds = ids
      }
    },

    "ARRANGE_OPEN_CONTEXT_MENU": ({ position, isSelectionSelected }) => {
      openContextMenu(dispatch, { position, isSelectionSelected })
    },

    "ARRANGE_COPY_SELECTION": () => {
      // 選択されたノートをコピー
      const notes = _.mapValues(s.selectedEventIds, (ids, trackId) => ids.map(id => {
        const note = tracks[trackId].getEventById(id)
        return {
          ...note,
          tick: note.tick - s.selection.x // 選択範囲からの相対位置にする
        }
      }))
      clipboard.writeText(JSON.stringify({
        type: "arrange_notes",
        notes
      }))
    },

    "ARRANGE_PASTE_SELECTION": () => {
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
        const notes = obj.notes[trackId]
          .map(note => ({
            ...note,
            tick: note.tick + player.position
          }))
        tracks[trackId].addEvents(notes)
      }
    },

    "ARRANGE_DELETE_SELECTION": () => {
      // 選択範囲と選択されたノートを削除
      for (let trackId in s.selectedEventIds) {
        tracks[trackId].removeEvents(s.selectedEventIds[trackId])
      }
      s.selection = null
      s.selectedEventIds = []
    },
  }
}

// returns { trackId: [eventId] }
function getNotesInSelection(tracks, selection) {
  const startTick = selection.x
  const endTick = selection.x + selection.width
  const ids = {}
  for (let trackIndex = selection.y; trackIndex < selection.y + selection.height; trackIndex++) {
    const track = tracks[trackIndex]
    const events = track.events.filter(e => e.subtype === "note" && e.tick >= startTick && e.tick <= endTick)
    ids[trackIndex] = events.map(e => e.id)
  }
  return ids
}
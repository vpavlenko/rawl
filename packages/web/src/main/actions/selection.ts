import clipboard from "services/Clipboard.ts"
import SelectionModel from "common/selection"
import RootStore from "../stores/RootStore"
import { TrackEvent, NoteEvent, isNoteEvent } from "src/common/track"

export const RESIZE_SELECTION = Symbol()
export const FIX_SELECTION = Symbol()
export const MOVE_SELECTION = Symbol()
export const RESIZE_SELECTION_LEFT = Symbol()
export const RESIZE_SELECTION_RIGHT = Symbol()
export const START_SELECTION = Symbol()
export const CLONE_SELECTION = Symbol()
export const COPY_SELECTION = Symbol()
export const DELETE_SELECTION = Symbol()
export const PASTE_SELECTION = Symbol()

function eventsInSelection(events: TrackEvent[], selection: SelectionModel) {
  const s = selection
  return events.filter(isNoteEvent).filter(
    b =>
      b.tick >= s.fromTick &&
      b.tick < s.toTick && // ノートの先頭だけ範囲にはいっていればよい
      b.noteNumber <= s.fromNoteNumber &&
      b.noteNumber > s.toNoteNumber
  )
}

export default ({
  song,
  pianoRollStore,
  services: { quantizer, player }
}: RootStore) => {
  const { selectedTrack } = song
  const { selection, mouseMode } = pianoRollStore

  function updateSelection(selection) {
    pianoRollStore.selection = selection
  }

  return {
    [RESIZE_SELECTION]: ({ start, end }) => {
      updateSelection(
        selection.resize(
          quantizer.round(start.tick),
          start.noteNumber,
          quantizer.round(end.tick),
          end.noteNumber
        )
      )
    },
    [FIX_SELECTION]: () => {
      // 選択範囲を確定して選択範囲内のノートを選択状態にする
      const s = selection.clone()
      s.noteIds = eventsInSelection(selectedTrack.events, selection).map(
        e => e.id
      )
      updateSelection(s)
    },
    [MOVE_SELECTION]: ({ tick, noteNumber }) => {
      // ノートと選択範囲を移動
      tick = quantizer.round(tick)
      noteNumber = Math.round(noteNumber)

      const dt = tick - selection.fromTick
      const dn = noteNumber - selection.fromNoteNumber

      if (dt === 0 && dn === 0) {
        return
      }

      const s = selection.moveTo(tick, noteNumber)
      updateSelection(s)

      selectedTrack.updateEvents(
        s.noteIds.map(id => {
          const n = selectedTrack.getEventById(id) as NoteEvent
          return {
            id,
            tick: n.tick + dt,
            noteNumber: n.noteNumber + dn
          }
        })
      )
    },

    [RESIZE_SELECTION_LEFT]: ({ tick }) => {
      // 選択範囲とノートを左方向に伸長・縮小する
      const fromTick = quantizer.round(tick)
      const delta = fromTick - selection.fromTick

      // 変形していないときは終了
      if (delta === 0) {
        return
      }

      // 選択領域のサイズがゼロになるときは終了
      if (selection.toTick - fromTick <= 0) {
        return
      }

      // 右端を固定して長さを変更
      const s = selection.clone()
      s.fromTick = fromTick
      updateSelection(s)

      selectedTrack.updateEvents(
        selection.noteIds.map(id => {
          const n = selectedTrack.getEventById(id) as NoteEvent
          const duration = n.duration - delta
          if (duration <= 0) {
            // 幅がゼロになる場合は変形しない
            return { id }
          }
          return {
            id,
            tick: n.tick + delta,
            duration
          }
        })
      )
    },

    [RESIZE_SELECTION_RIGHT]: ({ tick }) => {
      // 選択範囲とノートを右方向に伸長・縮小する
      const toTick = quantizer.round(tick)
      const delta = toTick - selection.toTick

      // 変形していないときは終了
      if (delta === 0) {
        return
      }

      // 選択領域のサイズがゼロになるときは終了
      if (toTick - selection.fromTick <= 0) {
        return
      }

      // 右端を固定して長さを変更
      const s = selection.clone()
      s.toTick = toTick
      updateSelection(s)

      selectedTrack.updateEvents(
        selection.noteIds.map(id => {
          const n = selectedTrack.getEventById(id) as NoteEvent
          const duration = n.duration + delta
          if (duration <= 0) {
            // 幅がゼロになる場合は変形しない
            return { id }
          }
          return {
            id,
            duration
          }
        })
      )
    },
    [START_SELECTION]: ({ tick, noteNumber }) => {
      if (!player.isPlaying) {
        player.position = quantizer.round(tick)
      }

      // 選択範囲の右上を pos にして、ノートの選択状を解除する
      const s = new SelectionModel()
      s.fromTick = tick
      s.fromNoteNumber = noteNumber
      updateSelection(s)
    },
    [CLONE_SELECTION]: () => {
      // 選択範囲内のノートをコピーした選択範囲を作成
      const notes = selection.noteIds.map(id => ({
        ...selectedTrack.getEventById(id)
      }))
      selectedTrack.addEvents(notes)
      const s = selection.clone()
      s.noteIds = notes.map(e => e.id)
      updateSelection(s)
    },
    [COPY_SELECTION]: () => {
      if (mouseMode !== 1) {
        // not selection mode
        return
      }

      // 選択されたノートをコピー
      const notes = selection.noteIds.map(id => {
        const note = selectedTrack.getEventById(id)
        return {
          ...note,
          tick: note.tick - selection.fromTick // 選択範囲からの相対位置にする
        }
      })
      clipboard.writeText(
        JSON.stringify({
          type: "notes",
          notes
        })
      )
    },
    [DELETE_SELECTION]: () => {
      // 選択範囲と選択されたノートを削除
      selectedTrack.removeEvents(selection.noteIds)
      updateSelection(new SelectionModel())
    },
    [PASTE_SELECTION]: () => {
      // 現在位置にコピーしたノートをペースト
      const text = clipboard.readText()
      if (!text || text.length === 0) {
        return
      }
      const obj = JSON.parse(text)
      if (obj.type !== "notes") {
        return
      }
      const notes = obj.notes.map(note => ({
        ...note,
        tick: note.tick + player.position
      }))
      selectedTrack.addEvents(notes)
    }
  }
}

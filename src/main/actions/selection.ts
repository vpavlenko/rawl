import clipboard from "services/Clipboard.ts"
import SelectionModel from "common/selection"
import RootStore from "../stores/RootStore"
import { NotePoint } from "common/transform/NotePoint"
import { isNoteEvent, NoteEvent, TrackEvent } from "common/track"
import { isNotUndefined } from "common/helpers/array"
import { Action, Mutator } from "../createDispatcher"

export interface ResizeSelection {
  type: "resizeSelection"
  start: NotePoint
  end: NotePoint
}
export const resizeSelection = (
  start: NotePoint,
  end: NotePoint
): ResizeSelection => ({
  type: "resizeSelection",
  start,
  end,
})

export interface FixSelection {
  type: "fixSelection"
}
export const fixSelection = (): FixSelection => ({ type: "fixSelection" })

export interface MoveSelection {
  type: "moveSelection"
  point: NotePoint
}
export const moveSelection = (point: NotePoint): MoveSelection => ({
  type: "moveSelection",
  point,
})

export interface ResizeSelectionLeft {
  type: "resizeSelectionLeft"
  tick: number
}
export const resizeSelectionLeft = (tick: number): ResizeSelectionLeft => ({
  type: "resizeSelectionLeft",
  tick,
})

export interface ResizeSelectionRight {
  type: "resizeSelectionRight"
  tick: number
}
export const resizeSelectionRight = (tick: number): ResizeSelectionRight => ({
  type: "resizeSelectionRight",
  tick,
})

export interface StartSelection {
  type: "startSelection"
  point: NotePoint
}
export const startSelection = (point: NotePoint): StartSelection => ({
  type: "startSelection",
  point,
})

export interface CloneSelection {
  type: "cloneSelection"
}
export const cloneSelection = (): CloneSelection => ({ type: "cloneSelection" })

export interface CopySelection {
  type: "copySelection"
}
export const copySelection = (): CopySelection => ({ type: "copySelection" })

export interface DeleteSelection {
  type: "deleteSelection"
}
export const deleteSelection = (): DeleteSelection => ({
  type: "deleteSelection",
})

export interface PasteSelection {
  type: "pasteSelection"
}
export const pasteSelection = (): PasteSelection => ({ type: "pasteSelection" })

function eventsInSelection(events: TrackEvent[], selection: SelectionModel) {
  const s = selection
  return events.filter(isNoteEvent).filter(
    (b) =>
      b.tick >= s.fromTick &&
      b.tick < s.toTick && // ノートの先頭だけ範囲にはいっていればよい
      b.noteNumber <= s.fromNoteNumber &&
      b.noteNumber > s.toNoteNumber
  )
}

export type SelectionAction =
  | ResizeSelection
  | FixSelection
  | MoveSelection
  | ResizeSelectionLeft
  | ResizeSelectionRight
  | StartSelection
  | CloneSelection
  | CopySelection
  | DeleteSelection
  | PasteSelection

export default (action: Action): Mutator | null => {
  switch (action.type) {
    case "resizeSelection":
      return ({ pianoRollStore, services: { quantizer } }) => {
        const { selection } = pianoRollStore
        const { start, end } = action
        pianoRollStore.selection = selection.resize(
          quantizer.round(start.tick),
          start.noteNumber,
          quantizer.round(end.tick),
          end.noteNumber
        )
      }
    case "fixSelection":
      return ({ song, pianoRollStore }) => {
        const selectedTrack = song.selectedTrack
        if (selectedTrack === undefined) {
          return
        }
        const { selection } = pianoRollStore
        // 選択範囲を確定して選択範囲内のノートを選択状態にする
        const s = selection.clone()
        s.noteIds = eventsInSelection(selectedTrack.events, selection).map(
          (e) => e.id
        )
        pianoRollStore.selection = s
      }
    case "moveSelection":
      return ({ song, pianoRollStore, services: { quantizer } }) => {
        const selectedTrack = song.selectedTrack
        if (selectedTrack === undefined) {
          return
        }
        const { selection } = pianoRollStore
        const { point } = action
        // ノートと選択範囲を移動
        const tick = quantizer.round(point.tick)
        const noteNumber = Math.round(point.noteNumber)

        const dt = tick - selection.fromTick
        const dn = noteNumber - selection.fromNoteNumber

        if (dt === 0 && dn === 0) {
          return
        }

        const s = selection.moveTo(tick, noteNumber)
        pianoRollStore.selection = s

        selectedTrack.updateEvents(
          s.noteIds.map((id) => {
            const n = selectedTrack.getEventById(id) as NoteEvent
            return {
              id,
              tick: n.tick + dt,
              noteNumber: n.noteNumber + dn,
            }
          })
        )
      }
    case "resizeSelectionLeft":
      return ({ song, pianoRollStore, services: { quantizer } }) => {
        const selectedTrack = song.selectedTrack
        if (selectedTrack === undefined) {
          return
        }
        const { selection } = pianoRollStore
        // 選択範囲とノートを左方向に伸長・縮小する
        const fromTick = quantizer.round(action.tick)
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
        pianoRollStore.selection = s

        selectedTrack.updateEvents(
          selection.noteIds.map((id) => {
            const n = selectedTrack.getEventById(id) as NoteEvent
            const duration = n.duration - delta
            if (duration <= 0) {
              // 幅がゼロになる場合は変形しない
              return { id }
            }
            return {
              id,
              tick: n.tick + delta,
              duration,
            }
          })
        )
      }
    case "resizeSelectionRight":
      return ({ song, pianoRollStore, services: { quantizer } }) => {
        const selectedTrack = song.selectedTrack
        if (selectedTrack === undefined) {
          return
        }
        const { selection } = pianoRollStore
        // 選択範囲とノートを右方向に伸長・縮小する
        const toTick = quantizer.round(action.tick)
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
        pianoRollStore.selection = s

        selectedTrack.updateEvents(
          selection.noteIds.map((id) => {
            const n = selectedTrack.getEventById(id) as NoteEvent
            const duration = n.duration + delta
            if (duration <= 0) {
              // 幅がゼロになる場合は変形しない
              return { id }
            }
            return {
              id,
              duration,
            }
          })
        )
      }
    case "startSelection":
      return ({ pianoRollStore, services: { quantizer, player } }) => {
        const { point } = action
        if (!player.isPlaying) {
          player.position = quantizer.round(point.tick)
        }

        // 選択範囲の右上を pos にして、ノートの選択状を解除する
        const s = new SelectionModel()
        s.fromTick = point.tick
        s.fromNoteNumber = point.noteNumber
        pianoRollStore.selection = s
      }
    case "cloneSelection":
      return ({ song, pianoRollStore }) => {
        const selectedTrack = song.selectedTrack
        if (selectedTrack === undefined) {
          return
        }
        const { selection } = pianoRollStore
        // 選択範囲内のノートをコピーした選択範囲を作成
        const notes = selection.noteIds
          .map((id) => selectedTrack.getEventById(id))
          .filter(isNotUndefined)
          .map((note) => ({
            ...note, // copy
          }))
        selectedTrack.addEvents(notes)
        const s = selection.clone()
        s.noteIds = notes.map((e) => e.id)
        pianoRollStore.selection = s
      }
    case "copySelection":
      return ({ song, pianoRollStore }) => {
        const selectedTrack = song.selectedTrack
        if (selectedTrack === undefined) {
          return
        }
        const { selection, mouseMode } = pianoRollStore
        if (mouseMode !== "selection") {
          // not selection mode
          return
        }

        // 選択されたノートをコピー
        const notes = selection.noteIds
          .map((id) => selectedTrack.getEventById(id))
          .filter(isNotUndefined)
          .map((note) => {
            return {
              ...note,
              tick: note.tick - selection.fromTick, // 選択範囲からの相対位置にする
            }
          })
        clipboard.writeText(
          JSON.stringify({
            type: "notes",
            notes,
          })
        )
      }
    case "deleteSelection":
      return ({ song, pianoRollStore }) => {
        const selectedTrack = song.selectedTrack
        if (selectedTrack === undefined) {
          return
        }
        const { selection } = pianoRollStore
        // 選択範囲と選択されたノートを削除
        selectedTrack.removeEvents(selection.noteIds)
        pianoRollStore.selection = new SelectionModel()
      }
    case "pasteSelection":
      return ({ song, services: { player } }) => {
        const selectedTrack = song.selectedTrack
        if (selectedTrack === undefined) {
          return
        }
        // 現在位置にコピーしたノートをペースト
        const text = clipboard.readText()
        if (!text || text.length === 0) {
          return
        }
        const obj = JSON.parse(text)
        if (obj.type !== "notes") {
          return
        }
        const notes = (obj.notes as NoteEvent[]).map((note) => ({
          ...note,
          tick: note.tick + player.position,
        }))
        selectedTrack.addEvents(notes)
      }
  }

  return null
}

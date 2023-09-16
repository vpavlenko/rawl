import { min } from "lodash"
import cloneDeep from "lodash/cloneDeep"
import { intersects } from "../../common/geometry"
import { isNotNull, isNotUndefined } from "../../common/helpers/array"
import {
  Selection,
  clampSelection,
  movedSelection,
  regularizedSelection,
} from "../../common/selection/Selection"
import { NoteEvent, TrackEvent, isNoteEvent } from "../../common/track"
import { NotePoint, clampNotePoint } from "../../common/transform/NotePoint"
import {
  PianoNotesClipboardData,
  isPianoNotesClipboardData,
} from "../clipboard/clipboardTypes"
import clipboard from "../services/Clipboard"
import RootStore from "../stores/RootStore"
import { pushHistory } from "./history"
import { transposeNotes } from "./song"

function eventsInSelection(events: TrackEvent[], selection: Selection) {
  const selectionRect = {
    x: selection.from.tick,
    width: selection.to.tick - selection.from.tick,
    y: selection.to.noteNumber,
    height: selection.from.noteNumber - selection.to.noteNumber,
  }
  return events.filter(isNoteEvent).filter((b) =>
    intersects(
      {
        x: b.tick,
        width: b.duration,
        y: b.noteNumber - 1, // Subtract 1 since the pitch is the lower end of the rectangle
        height: 1,
      },
      selectionRect,
    ),
  )
}

export const resizeSelection =
  ({ pianoRollStore }: RootStore) =>
  (start: NotePoint, end: NotePoint) => {
    const selection = regularizedSelection(
      start.tick,
      start.noteNumber,
      end.tick,
      end.noteNumber,
    )

    // integer containing the original coordinates.
    selection.from.noteNumber = Math.ceil(selection.from.noteNumber)
    selection.to.noteNumber = Math.floor(selection.to.noteNumber)

    pianoRollStore.selection = clampSelection(selection)
  }

export const fixSelection =
  ({
    pianoRollStore,
    pianoRollStore: { selectedTrack, selection },
  }: RootStore) =>
  (clearRect: boolean = false) => {
    if (selectedTrack === undefined || selection === null) {
      return
    }

    // 選択範囲を確定して選択範囲内のノートを選択状態にする
    // Confirm the selection and select the notes in the selection state
    pianoRollStore.selectedNoteIds = eventsInSelection(
      selectedTrack.events,
      selection,
    ).map((e) => e.id)

    if (clearRect) {
      pianoRollStore.selection = null
    }
  }

export const transposeSelection =
  (rootStore: RootStore) => (deltaPitch: number) => {
    const {
      pianoRollStore,
      pianoRollStore: { selectedTrackId, selection, selectedNoteIds },
    } = rootStore

    pushHistory(rootStore)()

    if (selection !== null) {
      const s = movedSelection(selection, 0, deltaPitch)
      pianoRollStore.selection = s
    }

    transposeNotes(rootStore)(deltaPitch, {
      [selectedTrackId]: selectedNoteIds,
    })
  }

export const moveSelection = (rootStore: RootStore) => (point: NotePoint) => {
  const {
    pianoRollStore: { selectedTrack, selection, quantizer },
  } = rootStore

  if (selectedTrack === undefined || selection === null) {
    return
  }

  // ノートと選択範囲を移動
  // Move notes and selection
  const quantized = clampNotePoint({
    tick: quantizer.round(point.tick),
    noteNumber: Math.round(point.noteNumber),
  })

  const dt = quantized.tick - selection.from.tick
  const dn = quantized.noteNumber - selection.from.noteNumber

  const to = {
    tick: selection.to.tick + dt,
    noteNumber: selection.to.noteNumber + dn,
  }

  const clampedTo = clampNotePoint(to)
  const limit = {
    tick: to.tick - clampedTo.tick,
    noteNumber: to.noteNumber - clampedTo.noteNumber,
  }

  moveSelectionBy(rootStore)({
    tick: dt - limit.tick,
    noteNumber: dn - limit.noteNumber,
  })
}

export const moveSelectionBy =
  ({
    pianoRollStore,
    pianoRollStore: { selectedTrack, selection, selectedNoteIds },
    pushHistory,
  }: RootStore) =>
  (delta: NotePoint) => {
    if (delta.tick === 0 && delta.noteNumber === 0) {
      return
    }

    if (selectedTrack === undefined) {
      return
    }

    pushHistory()

    if (selection !== null) {
      const s = movedSelection(selection, delta.tick, delta.noteNumber)
      pianoRollStore.selection = s
    }

    selectedTrack.updateEvents(
      selectedNoteIds
        .map((id) => {
          const n = selectedTrack.getEventById(id)
          if (n == undefined || !isNoteEvent(n)) {
            return null
          }
          const pos = clampNotePoint({
            tick: n.tick + delta.tick,
            noteNumber: n.noteNumber + delta.noteNumber,
          })
          return {
            id,
            ...pos,
          }
        })
        .filter(isNotNull),
    )
  }

export const resizeSelectionLeft = (rootStore: RootStore) => (tick: number) => {
  const {
    pianoRollStore,
    pianoRollStore: { selection, quantizer },
  } = rootStore

  if (selection === null) {
    return
  }

  // 選択範囲とノートを左方向に伸長・縮小する
  // Level and reduce the selection and notes in the left direction
  const fromTick = quantizer.round(tick)
  const delta = fromTick - selection.from.tick

  // 変形していないときは終了
  // End when not deformed
  if (delta === 0) {
    return
  }

  // 選択領域のサイズがゼロになるときは終了
  // End when the size of selection area becomes zero
  if (selection.to.tick - fromTick <= 0 || fromTick < 0) {
    return
  }

  // 右端を固定して長さを変更
  // Fix the right end and change the length
  const s = cloneDeep(selection)
  s.from.tick = fromTick
  pianoRollStore.selection = s

  resizeNotesInSelectionLeftBy(rootStore)(delta)
}

export const resizeNotesInSelectionLeftBy =
  ({
    pianoRollStore: { selectedNoteIds, selectedTrack },
    pushHistory,
  }: RootStore) =>
  (deltaTick: number) => {
    if (selectedTrack === undefined || selectedNoteIds.length === 0) {
      return
    }

    pushHistory()

    selectedTrack.updateEvents(
      selectedNoteIds
        .map((id) => {
          const n = selectedTrack.getEventById(id)
          if (n == undefined || !isNoteEvent(n)) {
            return null
          }
          const duration = n.duration - deltaTick
          const tick = n.tick + deltaTick
          if (duration <= 0 || tick < 0) {
            // 幅がゼロになる場合は変形しない
            // Do not deform if the width is zero
            return { id }
          }
          return {
            id,
            tick,
            duration,
          }
        })
        .filter(isNotNull),
    )
  }

export const resizeSelectionRight =
  (rootStore: RootStore) => (tick: number) => {
    const {
      pianoRollStore,
      pianoRollStore: { selection, quantizer },
    } = rootStore

    if (selection === null) {
      return
    }

    // 選択範囲とノートを右方向に伸長・縮小する
    // Return and reduce the selection and note in the right direction
    const toTick = quantizer.round(tick)
    const delta = toTick - selection.to.tick

    // 変形していないときは終了
    // End when not deformed
    if (delta === 0) {
      return
    }

    // 選択領域のサイズがゼロになるときは終了
    // End when the size of selection area becomes zero
    if (toTick - selection.from.tick <= 0) {
      return
    }

    // 右端を固定して長さを変更
    // Fix the right end and change the length
    const s = cloneDeep(selection)
    s.to.tick = toTick
    pianoRollStore.selection = s

    resizeNotesInSelectionRightBy(rootStore)(delta)
  }

export const resizeNotesInSelectionRightBy =
  ({
    pianoRollStore: { selectedTrack, selectedNoteIds },
    pushHistory,
  }: RootStore) =>
  (deltaDuration: number) => {
    if (selectedTrack === undefined || selectedNoteIds.length === 0) {
      return
    }

    pushHistory()

    selectedTrack.updateEvents(
      selectedNoteIds
        .map((id) => {
          const n = selectedTrack.getEventById(id)
          if (n == undefined || !isNoteEvent(n)) {
            return null
          }
          const duration = n.duration + deltaDuration
          if (duration <= 0) {
            // 幅がゼロになる場合は変形しない
            // Do not deform if the width is zero
            return { id }
          }
          return {
            id,
            duration,
          }
        })
        .filter(isNotNull),
    )
  }

export const startSelection =
  ({
    pianoRollStore,
    controlStore,
    player,
    controlStore: { quantizer },
  }: RootStore) =>
  (point: NotePoint, keepSelectedNoteIds: boolean = false) => {
    if (!player.isPlaying) {
      player.position = quantizer.round(point.tick)
    }

    controlStore.selectedEventIds = []

    if (!keepSelectedNoteIds) {
      // deselect the notes
      pianoRollStore.selectedNoteIds = []
    }

    // 選択範囲の右上を pos にする
    // Set the upper right corner of the selection to POS
    pianoRollStore.selection = {
      from: point,
      to: point,
    }
  }

export const resetSelection =
  ({ pianoRollStore }: RootStore) =>
  () => {
    pianoRollStore.selection = null
    pianoRollStore.selectedNoteIds = []
  }

export const cloneSelection =
  ({
    pianoRollStore,
    pianoRollStore: { selection, selectedNoteIds, selectedTrack },
  }: RootStore) =>
  () => {
    if (selectedTrack === undefined || selection === null) {
      return
    }

    // 選択範囲内のノートをコピーした選択範囲を作成
    // Create a selection that copies notes within selection
    const notes = selectedNoteIds
      .map((id) => selectedTrack.getEventById(id))
      .filter(isNotUndefined)
      .map((note) => ({
        ...note, // copy
      }))
    selectedTrack.addEvents(notes)
    pianoRollStore.selectedNoteIds = notes.map((e) => e.id)
  }

export const copySelection =
  ({
    pianoRollStore: { selection, selectedNoteIds, selectedTrack },
  }: RootStore) =>
  () => {
    if (selectedTrack === undefined || selectedNoteIds.length === 0) {
      return
    }

    const selectedNotes = selectedNoteIds
      .map((id) => selectedTrack.getEventById(id))
      .filter(isNotUndefined)
      .filter(isNoteEvent)

    const startTick =
      selection?.from.tick ?? min(selectedNotes.map((note) => note.tick))!

    // 選択されたノートをコピー
    // Copy selected note
    const notes = selectedNotes.map((note) => ({
      ...note,
      tick: note.tick - startTick, // 選択範囲からの相対位置にする
    }))

    const data: PianoNotesClipboardData = {
      type: "piano_notes",
      notes,
    }

    clipboard.writeText(JSON.stringify(data))
  }

export const deleteSelection =
  ({
    pianoRollStore,
    pianoRollStore: { selection, selectedNoteIds, selectedTrack },
    pushHistory,
  }: RootStore) =>
  () => {
    if (
      selectedTrack === undefined ||
      (selectedNoteIds.length === 0 && selection === null)
    ) {
      return
    }

    pushHistory()

    // 選択範囲と選択されたノートを削除
    // Remove selected notes and selected notes
    selectedTrack.removeEvents(selectedNoteIds)
    pianoRollStore.selection = null
    pianoRollStore.selectedNoteIds = []
  }

export const pasteSelection =
  ({ player, pianoRollStore: { selectedTrack }, pushHistory }: RootStore) =>
  () => {
    if (selectedTrack === undefined) {
      return
    }
    // 現在位置にコピーしたノートをペースト
    // Paste notes copied to the current position
    const text = clipboard.readText()
    if (!text || text.length === 0) {
      return
    }
    const obj = JSON.parse(text)
    if (!isPianoNotesClipboardData(obj)) {
      return
    }

    pushHistory()

    const notes = obj.notes.map((note) => ({
      ...note,
      tick: note.tick + player.position,
    }))
    selectedTrack.addEvents(notes)
  }

export const duplicateSelection =
  ({
    pianoRollStore,
    pianoRollStore: { selection, selectedNoteIds, selectedTrack },
    pushHistory,
  }: RootStore) =>
  () => {
    if (
      selectedTrack === undefined ||
      selection === null ||
      selectedNoteIds.length === 0
    ) {
      return
    }

    pushHistory()

    // move to the end of selection
    let deltaTick = selection.to.tick - selection.from.tick

    const selectedNotes = selectedNoteIds
      .map((id) => selectedTrack.getEventById(id))
      .filter(isNotUndefined)
      .filter(isNoteEvent)

    if (deltaTick === 0) {
      const left = Math.min(...selectedNotes.map((n) => n.tick))
      const right = Math.max(...selectedNotes.map((n) => n.tick + n.duration))
      deltaTick = right - left
    }

    const notes = selectedNotes.map((note) => ({
      ...note,
      tick: note.tick + deltaTick,
    }))

    // select the created notes
    const addedNotes = selectedTrack.addEvents(notes)
    const s = cloneDeep(selection)
    s.from.tick += deltaTick
    s.to.tick += deltaTick
    pianoRollStore.selection = s
    pianoRollStore.selectedNoteIds = addedNotes.map((n) => n.id)
  }

export const addNoteToSelection =
  ({ pianoRollStore }: RootStore) =>
  (noteId: number) => {
    pianoRollStore.selectedNoteIds.push(noteId)
  }

export const removeNoteFromSelection =
  ({
    pianoRollStore,
    pianoRollStore: { selectedNoteIds, selectedTrack },
  }: RootStore) =>
  (noteId: number) => {
    if (selectedTrack === undefined || selectedNoteIds.length === 0) {
      return
    }

    pianoRollStore.selectedNoteIds = selectedNoteIds.filter(
      (id) => id !== noteId,
    )
  }

export const selectNote = (rootStore: RootStore) => (noteId: number) => {
  const {
    pianoRollStore,
    pianoRollStore: { selectedTrack },
    controlStore,
  } = rootStore

  if (selectedTrack === undefined) {
    return
  }

  controlStore.selectedEventIds = []
  pianoRollStore.selectedNoteIds = [noteId]
}

const sortedNotes = (notes: NoteEvent[]): NoteEvent[] =>
  notes.filter(isNoteEvent).sort((a, b) => {
    if (a.tick < b.tick) return -1
    if (a.tick > b.tick) return 1
    if (a.noteNumber < b.noteNumber) return -1
    if (a.noteNumber > b.noteNumber) return 1
    return 0
  })

const selectNeighborNote = (rootStore: RootStore) => (deltaIndex: number) => {
  const {
    pianoRollStore: { selectedTrack, selectedNoteIds },
  } = rootStore

  if (selectedTrack === undefined || selectedNoteIds.length === 0) {
    return
  }

  const allNotes = selectedTrack.events.filter(isNoteEvent)
  const selectedNotes = sortedNotes(
    selectedNoteIds
      .map((id) => allNotes.find((n) => n.id === id))
      .filter(isNotUndefined),
  )
  if (selectedNotes.length === 0) {
    return
  }
  const firstNote = sortedNotes(selectedNotes)[0]
  const notes = sortedNotes(allNotes)
  const currentIndex = notes.findIndex((n) => n.id === firstNote.id)
  const nextNote = notes[currentIndex + deltaIndex]
  if (nextNote === undefined) {
    return
  }

  selectNote(rootStore)(nextNote.id)
}

export const selectNextNote = (rootStore: RootStore) => () =>
  selectNeighborNote(rootStore)(1)

export const selectPreviousNote = (rootStore: RootStore) => () =>
  selectNeighborNote(rootStore)(-1)

export const quantizeSelectedNotes = (rootStore: RootStore) => () => {
  const {
    pianoRollStore: {
      selectedTrack,
      selectedNoteIds,
      enabledQuantizer: quantizer,
    },
  } = rootStore

  if (selectedTrack === undefined || selectedNoteIds.length === 0) {
    return
  }

  pushHistory(rootStore)()

  const notes = selectedNoteIds
    .map((id) => selectedTrack.getEventById(id))
    .filter(isNotUndefined)
    .filter(isNoteEvent)
    .map((e) => ({
      ...e,
      tick: quantizer.round(e.tick),
    }))

  selectedTrack.updateEvents(notes)
}

export const selectAllNotes =
  ({ pianoRollStore, pianoRollStore: { selectedTrack } }: RootStore) =>
  () => {
    if (selectedTrack) {
      pianoRollStore.selectedNoteIds = selectedTrack.events
        .filter(isNoteEvent)
        .map((note) => note.id)
    }
  }

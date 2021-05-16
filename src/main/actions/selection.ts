import cloneDeep from "lodash/cloneDeep"
import { isNotNull, isNotUndefined } from "../../common/helpers/array"
import {
  emptySelection,
  movedSelection,
  regularizedSelection,
  Selection,
} from "../../common/selection/Selection"
import { isNoteEvent, NoteEvent, TrackEvent } from "../../common/track"
import { NotePoint } from "../../common/transform/NotePoint"
import clipboard from "../services/Clipboard"
import RootStore from "../stores/RootStore"
import { pushHistory } from "./history"

function eventsInSelection(events: TrackEvent[], selection: Selection) {
  const s = selection
  return events.filter(isNoteEvent).filter(
    (b) =>
      b.tick >= s.from.tick &&
      b.tick < s.to.tick && // ノートの先頭だけ範囲にはいっていればよい
      b.noteNumber <= s.from.noteNumber &&
      b.noteNumber > s.to.noteNumber
  )
}

export const resizeSelection =
  (rootStore: RootStore) => (start: NotePoint, end: NotePoint) => {
    const {
      pianoRollStore,
      services: { quantizer },
    } = rootStore

    pianoRollStore.selection = regularizedSelection(
      quantizer.round(start.tick),
      start.noteNumber,
      quantizer.round(end.tick),
      end.noteNumber
    )
  }

export const fixSelection = (rootStore: RootStore) => () => {
  const { song, pianoRollStore } = rootStore

  const selectedTrack = song.selectedTrack
  if (selectedTrack === undefined) {
    return
  }
  const { selection } = pianoRollStore
  // 選択範囲を確定して選択範囲内のノートを選択状態にする
  const s = cloneDeep(selection)
  if (
    s.from.noteNumber - s.to.noteNumber === 0 ||
    s.from.tick - s.to.tick === 0
  ) {
    s.enabled = false
  } else {
    s.noteIds = eventsInSelection(selectedTrack.events, selection).map(
      (e) => e.id
    )
  }
  pianoRollStore.selection = s
}

export const transposeSelection =
  (rootStore: RootStore) => (deltaPitch: number) => {
    const { song, pianoRollStore } = rootStore

    const selectedTrack = song.selectedTrack
    if (selectedTrack === undefined) {
      return
    }
    const { selection } = pianoRollStore
    const s = movedSelection(selection, 0, deltaPitch)
    pianoRollStore.selection = s

    selectedTrack.updateEvents(
      s.noteIds
        .map((id) => {
          const n = selectedTrack.getEventById(id)
          if (n == undefined || !isNoteEvent(n)) {
            return null
          }
          return {
            id,
            noteNumber: n.noteNumber + deltaPitch,
          }
        })
        .filter(isNotNull)
    )
  }

export const moveSelection = (rootStore: RootStore) => (point: NotePoint) => {
  const {
    song,
    pianoRollStore,
    services: { quantizer },
  } = rootStore

  const selectedTrack = song.selectedTrack
  if (selectedTrack === undefined) {
    return
  }
  const { selection } = pianoRollStore
  // ノートと選択範囲を移動
  const tick = quantizer.round(point.tick)
  const noteNumber = Math.round(point.noteNumber)

  const dt = tick - selection.from.tick
  const dn = noteNumber - selection.from.noteNumber

  moveSelectionBy(rootStore)({ tick: dt, noteNumber: dn })
}

export const moveSelectionBy = (rootStore: RootStore) => (delta: NotePoint) => {
  if (delta.tick === 0 && delta.noteNumber === 0) {
    return
  }

  const { song, pianoRollStore } = rootStore

  const selectedTrack = song.selectedTrack
  if (selectedTrack === undefined) {
    return
  }
  const { selection } = pianoRollStore

  const s = movedSelection(selection, delta.tick, delta.noteNumber)
  pianoRollStore.selection = s

  pushHistory(rootStore)()

  selectedTrack.updateEvents(
    s.noteIds
      .map((id) => {
        const n = selectedTrack.getEventById(id)
        if (n == undefined || !isNoteEvent(n)) {
          return null
        }
        return {
          id,
          tick: n.tick + delta.tick,
          noteNumber: n.noteNumber + delta.noteNumber,
        }
      })
      .filter(isNotNull)
  )
}

export const resizeSelectionLeft = (rootStore: RootStore) => (tick: number) => {
  const {
    pianoRollStore,
    services: { quantizer },
  } = rootStore

  const { selection } = pianoRollStore
  // 選択範囲とノートを左方向に伸長・縮小する
  const fromTick = quantizer.round(tick)
  const delta = fromTick - selection.from.tick

  // 変形していないときは終了
  if (delta === 0) {
    return
  }

  // 選択領域のサイズがゼロになるときは終了
  if (selection.to.tick - fromTick <= 0) {
    return
  }

  // 右端を固定して長さを変更
  const s = cloneDeep(selection)
  s.from.tick = fromTick
  pianoRollStore.selection = s

  resizeNotesInSelectionLeftBy(rootStore)(delta)
}

export const resizeNotesInSelectionLeftBy =
  (rootStore: RootStore) => (deltaTick: number) => {
    const { song, pianoRollStore } = rootStore

    const selectedTrack = song.selectedTrack
    if (selectedTrack === undefined) {
      return
    }

    pushHistory(rootStore)()

    selectedTrack.updateEvents(
      pianoRollStore.selection.noteIds
        .map((id) => {
          const n = selectedTrack.getEventById(id)
          if (n == undefined || !isNoteEvent(n)) {
            return null
          }
          const duration = n.duration - deltaTick
          if (duration <= 0) {
            // 幅がゼロになる場合は変形しない
            return { id }
          }
          return {
            id,
            tick: n.tick + deltaTick,
            duration,
          }
        })
        .filter(isNotNull)
    )
  }

export const resizeSelectionRight =
  (rootStore: RootStore) => (tick: number) => {
    const {
      pianoRollStore,
      services: { quantizer },
    } = rootStore

    const { selection } = pianoRollStore
    // 選択範囲とノートを右方向に伸長・縮小する
    const toTick = quantizer.round(tick)
    const delta = toTick - selection.to.tick

    // 変形していないときは終了
    if (delta === 0) {
      return
    }

    // 選択領域のサイズがゼロになるときは終了
    if (toTick - selection.from.tick <= 0) {
      return
    }

    // 右端を固定して長さを変更
    const s = cloneDeep(selection)
    s.to.tick = toTick
    pianoRollStore.selection = s

    resizeNotesInSelectionRightBy(rootStore)(delta)
  }

export const resizeNotesInSelectionRightBy =
  (rootStore: RootStore) => (deltaDuration: number) => {
    const { song, pianoRollStore } = rootStore

    const selectedTrack = song.selectedTrack
    if (selectedTrack === undefined) {
      return
    }

    pushHistory(rootStore)()

    selectedTrack.updateEvents(
      pianoRollStore.selection.noteIds
        .map((id) => {
          const n = selectedTrack.getEventById(id)
          if (n == undefined || !isNoteEvent(n)) {
            return null
          }
          const duration = n.duration + deltaDuration
          if (duration <= 0) {
            // 幅がゼロになる場合は変形しない
            return { id }
          }
          return {
            id,
            duration,
          }
        })
        .filter(isNotNull)
    )
  }

export const startSelection = (rootStore: RootStore) => (point: NotePoint) => {
  const {
    pianoRollStore,
    services: { quantizer, player },
  } = rootStore

  if (!player.isPlaying) {
    player.position = quantizer.round(point.tick)
  }

  // 選択範囲の右上を pos にして、ノートの選択状を解除する
  const s: Selection = {
    noteIds: [],
    from: point,
    to: point,
    enabled: true,
  }
  pianoRollStore.selection = s
}

export const resetSelection = (rootStore: RootStore) => () => {
  rootStore.pianoRollStore.selection = emptySelection
}

export const cloneSelection = (rootStore: RootStore) => () => {
  const { song, pianoRollStore } = rootStore

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
  const s = cloneDeep(selection)
  s.noteIds = notes.map((e) => e.id)
  pianoRollStore.selection = s
}

export const copySelection = (rootStore: RootStore) => () => {
  const { song, pianoRollStore } = rootStore

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
    .map((note) => ({
      ...note,
      tick: note.tick - selection.from.tick, // 選択範囲からの相対位置にする
    }))
  clipboard.writeText(
    JSON.stringify({
      type: "notes",
      notes,
    })
  )
}

export const deleteSelection = (rootStore: RootStore) => () => {
  const { song, pianoRollStore } = rootStore

  const selectedTrack = song.selectedTrack
  if (selectedTrack === undefined) {
    return
  }

  pushHistory(rootStore)()

  const { selection } = pianoRollStore
  // 選択範囲と選択されたノートを削除
  selectedTrack.removeEvents(selection.noteIds)
  pianoRollStore.selection = emptySelection
}

export const pasteSelection = (rootStore: RootStore) => () => {
  const {
    song,
    services: { player },
  } = rootStore

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

  pushHistory(rootStore)()

  const notes = (obj.notes as NoteEvent[]).map((note) => ({
    ...note,
    tick: note.tick + player.position,
  }))
  selectedTrack.addEvents(notes)
}

export const duplicateSelection = (rootStore: RootStore) => () => {
  const {
    song: { selectedTrack },
    pianoRollStore,
  } = rootStore

  if (selectedTrack === undefined) {
    return
  }

  const { selection } = pianoRollStore

  if (selection.noteIds.length === 0) {
    return
  }

  pushHistory(rootStore)()

  // move to the end of selection
  const deltaTick = selection.to.tick - selection.from.tick

  const notes = selection.noteIds
    .map((id) => selectedTrack.getEventById(id))
    .filter(isNotUndefined)
    .map((note) => ({
      ...note,
      tick: note.tick + deltaTick,
    }))

  // select the created notes
  const addedNotes = selectedTrack.addEvents(notes)
  const s = cloneDeep(selection)
  s.noteIds = addedNotes.map((n) => n.id)
  s.from.tick += deltaTick
  s.to.tick += deltaTick
  pianoRollStore.selection = s
}

export const addNoteToSelection =
  (rootStore: RootStore) => (noteId: number) => {
    const { song, pianoRollStore } = rootStore

    const selectedTrack = song.selectedTrack
    if (selectedTrack === undefined) {
      return
    }
    const { selection } = pianoRollStore
    const s = cloneDeep(selection)
    s.noteIds.push(noteId)
    pianoRollStore.selection = s
  }

export const removeNoteToSelection =
  (rootStore: RootStore) => (noteId: number) => {
    const { song, pianoRollStore } = rootStore

    const selectedTrack = song.selectedTrack
    if (selectedTrack === undefined) {
      return
    }
    const { selection } = pianoRollStore
    const s = cloneDeep(selection)
    s.noteIds = s.noteIds.filter((id) => id !== noteId)
    pianoRollStore.selection = s
  }

export const selectNote = (rootStore: RootStore) => (noteId: number) => {
  const { song, pianoRollStore } = rootStore

  const selectedTrack = song.selectedTrack
  if (selectedTrack === undefined) {
    return
  }
  const { selection } = pianoRollStore
  const s = cloneDeep(selection)
  s.noteIds = [noteId]
  pianoRollStore.selection = s
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
  const { song, pianoRollStore } = rootStore

  const selectedTrack = song.selectedTrack
  if (selectedTrack === undefined) {
    return
  }

  const allNotes = selectedTrack.events.filter(isNoteEvent)
  const selectedNotes = sortedNotes(
    pianoRollStore.selection.noteIds
      .map((id) => allNotes.find((n) => n.id === id))
      .filter(isNotUndefined)
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

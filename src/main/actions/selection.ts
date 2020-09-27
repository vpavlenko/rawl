import clipboard from "services/Clipboard.ts"
import SelectionModel from "common/selection"
import RootStore from "../stores/RootStore"
import { NotePoint } from "common/transform/NotePoint"
import { isNoteEvent, NoteEvent, TrackEvent } from "common/track"
import { isNotUndefined } from "common/helpers/array"

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

export const resizeSelection = (rootStore: RootStore) => (
  start: NotePoint,
  end: NotePoint
) => {
  const {
    pianoRollStore,
    services: { quantizer },
  } = rootStore

  const { selection } = pianoRollStore
  pianoRollStore.selection = selection.resize(
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
  const s = selection.clone()
  if (s.fromNoteNumber - s.toNoteNumber === 0 || s.fromTick - s.toTick === 0) {
    s.enabled = false
  } else {
    s.noteIds = eventsInSelection(selectedTrack.events, selection).map(
      (e) => e.id
    )
  }
  pianoRollStore.selection = s
}

export const transposeSelection = (rootStore: RootStore) => (
  deltaPitch: number
) => {
  const { song, pianoRollStore } = rootStore

  const selectedTrack = song.selectedTrack
  if (selectedTrack === undefined) {
    return
  }
  const { selection } = pianoRollStore
  const s = selection.move(0, deltaPitch)
  pianoRollStore.selection = s

  selectedTrack.updateEvents(
    s.noteIds.map((id) => {
      const n = selectedTrack.getEventById(id) as NoteEvent
      return {
        id,
        noteNumber: n.noteNumber + deltaPitch,
      }
    })
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

export const resizeSelectionLeft = (rootStore: RootStore) => (tick: number) => {
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

export const resizeSelectionRight = (rootStore: RootStore) => (
  tick: number
) => {
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

export const startSelection = (rootStore: RootStore) => (point: NotePoint) => {
  const {
    pianoRollStore,
    services: { quantizer, player },
  } = rootStore

  if (!player.isPlaying) {
    player.position = quantizer.round(point.tick)
  }

  // 選択範囲の右上を pos にして、ノートの選択状を解除する
  const s = new SelectionModel()
  s.fromTick = point.tick
  s.fromNoteNumber = point.noteNumber
  pianoRollStore.selection = s
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
  const s = selection.clone()
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

export const deleteSelection = (rootStore: RootStore) => () => {
  const { song, pianoRollStore } = rootStore

  const selectedTrack = song.selectedTrack
  if (selectedTrack === undefined) {
    return
  }
  const { selection } = pianoRollStore
  // 選択範囲と選択されたノートを削除
  selectedTrack.removeEvents(selection.noteIds)
  pianoRollStore.selection = new SelectionModel()
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
  const notes = (obj.notes as NoteEvent[]).map((note) => ({
    ...note,
    tick: note.tick + player.position,
  }))
  selectedTrack.addEvents(notes)
}

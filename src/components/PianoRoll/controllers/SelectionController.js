import Rect from "../../../model/Rect"
import clipboard from "../../../services/Clipboard"

/**
 PianoRoll での選択範囲操作を行うクラス
 */
export default class SelectionController {
  constructor(selection, track, quantizer, transform, player) {
    this.selection = selection
    this.track = track
    this.quantizer = quantizer
    this.transform = transform
    this.player = player
  }

  positionType(pos) {
    const { selection, transform } = this
    const rect = selection.getBounds(transform)
    const contains =
      rect.x <= pos.x && rect.x + rect.width >= pos.x &&
      rect.y <= pos.y && rect.y + rect.height >= pos.y
    if (!contains) {
      return "outside"
    }
    const localX = pos.x - rect.x
    const edgeSize = Math.min(rect.width / 3, 8)
    if (localX <= edgeSize) { return "left" }
    if (rect.width - localX <= edgeSize) { return "right" }
    return "center"
  }

  getRect() {
    const { selection, transform } = this
    return selection.getBounds(transform)
  }

  // 選択範囲の右上を pos にして、ノートの選択状を解除する
  startAt(pos) {
    const { selection, transform } = this
    selection.reset()
    selection.fromTick = transform.getTicks(pos.x)
    selection.fromNoteNumber = transform.getNoteNumber(pos.y)
  }

  // 選択範囲の右下を pos にする
  resize(pos) {
    const { selection, quantizer, transform } = this
    const startPosition = {
      x: transform.getX(selection.fromTick),
      y: transform.getY(selection.fromNoteNumber)
    }
    const rect = Rect.fromPoints(startPosition, pos)
    selection.resize(rect, quantizer, transform)
  }

  // 選択範囲を確定して選択範囲内のノートを選択状態にする
  fix() {
    const { selection, track } = this
    const events = eventsInSelection(track.getEvents(), selection)
    selection.setNoteIds(events.map(e => e.id))
  }

  // 選択範囲とノートを左方向に伸長・縮小する
  resizeLeft(pos) {
    const { selection, transform, quantizer, track } = this
    const fromTick = quantizer.round(transform.getTicks(pos.x))
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
    selection.setFromTick(fromTick)

    track.transaction(it => {
      selection.noteIds.forEach(id => {
        const n = track.getEventById(id)
        const duration = n.duration - delta
        if (duration <= 0) {
          // 幅がゼロになる場合は変形しない
          return
        }
        it.updateEvent(id, {
          tick: n.tick + delta,
          duration
        })
      })
    })
  }

  // 選択範囲とノートを右方向に伸長・縮小する
  resizeRight(pos) {
    const { selection, transform, quantizer, track } = this
    const toTick = quantizer.round(transform.getTicks(pos.x))
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
    selection.setToTick(toTick)

    track.transaction(it => {
      selection.noteIds.forEach(id => {
        const n = track.getEventById(id)
        const duration = n.duration + delta
        if (duration <= 0) {
          // 幅がゼロになる場合は変形しない
          return
        }
        it.updateEvent(id, {
          duration
        })
      })
    })
  }

  // ノートと選択範囲を移動
  moveTo(pos) {
    const { selection, transform, quantizer, track } = this

    const tick = quantizer.round(transform.getTicks(pos.x))
    const noteNumber = Math.round(transform.getNoteNumber(pos.y))

    const dt = tick - selection.fromTick
    const dn = noteNumber - selection.fromNoteNumber

    if (dt === 0 && dn === 0) {
      return
    }

    selection.moveTo(tick, noteNumber)

    track.transaction(it => {
      selection.noteIds.forEach(id => {
        const n = track.getEventById(id)
        it.updateEvent(id, {
          tick: n.tick + dt,
          noteNumber: n.noteNumber + dn
        })
      })
    })
  }

  // 選択範囲と選択されたノートを削除
  deleteSelection() {
    const { selection, track } = this
    track.transaction(it =>
      selection.noteIds.forEach(id =>
        it.removeEvent(id)
      )
    )
    selection.reset()
  }

  // 選択されたノートをコピー
  copySelection() {
    const { selection, track } = this
    const notes = selection.noteIds
      .map(id => {
        const note = track.getEventById(id)
        return {
          ...note,
          tick: note.tick - selection.fromTick // 選択範囲からの相対位置にする
        }
      })
    clipboard.writeText(JSON.stringify({
      type: "notes",
      notes
    }))
  }

  // 現在位置にコピーしたノートをペースト
  pasteSelection() {
    const { player, track } = this
    const obj = JSON.parse(clipboard.readText())
    if (obj.type !== "notes") {
      return
    }
    const notes = obj.notes
      .map(note => ({
        ...note,
        tick: note.tick + player.position
      }))
    track.transaction(it => {
      notes.forEach(note => it.addEvent(note))
    })
  }

  setPlayerCursor(pos) {
    const { player, transform, quantizer } = this
    const tick = quantizer.round(transform.getTicks(pos.x))
    player.position = tick
  }
}

function eventsInSelection(events, selection) {
  const s = selection
  return events
    .filter(b =>
      b.tick >= s.fromTick
        && b.tick <= s.toTick // ノートの先頭だけ範囲にはいっていればよい
        && b.noteNumber <= s.fromNoteNumber
        && b.noteNumber >= s.toNoteNumber
    )
}

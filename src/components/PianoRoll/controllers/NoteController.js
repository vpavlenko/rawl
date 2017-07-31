/**
 PianoRoll でのノート操作を行うクラス
 Transform, Track, Quantizer, Player に依存
 */
export default class NoteController {
  constructor(track, quantizer, transform, player) {
    this.track = track
    this.quantizer = quantizer
    this.transform = transform
    this.player = player
  }

  // ノート作成時のマウス座標に対するノート位置
  _createdNoteLocation(pos) {
    const { quantizer, transform } = this
    return {
      tick: quantizer.floor(transform.getTicks(pos.x)),
      noteNumber: Math.ceil(transform.getNoteNumber(pos.y)),
    }
  }
  
  // 右端を固定して長さを変更
  resizeLeft(id, pos) {
    const { track, quantizer, transform } = this
    const note = track.getEventById(id)
    const tick = quantizer.round(transform.getTicks(pos.x))
    if (note.tick === tick) {
      return
    }
    const duration = note.duration + (note.tick - tick)
    if (duration < quantizer.unit) {
      return
    }

    track.updateEvent(note.id, {
      tick: tick,
      duration: note.duration + (note.tick - tick)
    })
  }

  // 長さを変更
  resizeRight(id, pos) {
    const { track, quantizer, transform } = this
    const note = track.getEventById(id)
    const right = transform.getTicks(pos.x)
    const duration = Math.max(quantizer.unit,
      quantizer.round(right - note.tick))

    if (note.duration === duration) {
      return
    }

    track.updateEvent(id, {duration: duration})
  }

  _move(id, tick, noteNumber) {
    const { track, player } = this
    const note = track.getEventById(id)
    const pitchChanged = noteNumber !== note.noteNumber
    const n = track.updateEvent(note.id, {
      tick: tick,
      noteNumber: noteNumber
    })

    if (pitchChanged) {
      player.playNote(n)
    }
  }

  // 作成時のノート移動
  moveTo(id, pos) {
    const loc = this._createdNoteLocation(pos)
    this._move(id, loc.tick, loc.noteNumber)
  }

  // ノートのドラッグによる移動
  moveCenter(id, pos) {
    const { quantizer, transform } = this
    const tick = quantizer.round(transform.getTicks(pos.x))
    const noteNumber = Math.round(transform.getNoteNumber(pos.y))
    this._move(id, tick, noteNumber)
  }
}

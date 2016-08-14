import _ from "lodash"
import NoteView from "../view/note-view"

export default class NoteContainer extends createjs.Container {
  constructor() {
    super()
  }

  clearNotes() {
    const children = this.children.slice() // copy
    this.removeAllChildren()
    children.filter(c => !(c instanceof NoteView)).forEach(c => {
      this.addChild(c)
    })
  }

  set transform(transform) {
    this._transform = transform
    this.children
      .filter(c => c instanceof NoteView)
      .forEach(v => v.transform = transform)
  }

  set notes(notes) {
    this._notes = notes
    const views = this.children.slice()
    this.clearNotes()

    notes.forEach(note => {
      let view = _.find(views, c => c.noteId == note.id)
      if (!view) {
        view = new NoteView
        view.noteId = note.id
        view.transform = this._transform
      }
      view.visible = true
      view.note = note
      this.addChild(view)
    })
  }

  getNotesInRect(rect) {
    return getNotesInRect(this._notes, rect, this._transform)
  }

  getNoteIdsInRect(rect) {
    return this.getNotesInRect(rect).map(c => c.noteId)
  }

  getNoteUnderPoint(x, y) {
    return getNoteUnderPoint(this._notes, x, y, this._transform)
  }

  findNoteViewById(id) {
    return _.find(this.children, c => {
      return c instanceof NoteView && c.noteId == id
    }) 
  }

  getNoteViewUnderPoint(x, y) {
    const n = this.getNoteUnderPoint(x, y)
    if (n) {
      return this.findNoteViewById(n.id)
    }
    return null
  }
}

// helper

function getNotesInRect(notes, rect, t) {
  const t1 = t.getTicks(rect.x)
  const n1 = t.getNoteNumber(rect.y)
  const t2 = t.getTicks(rect.x + rect.width)
  const n2 = t.getNoteNumber(rect.y + rect.height)
  return notes.filter(note => 
    note.tick >= t1 && note.tick < t2 &&
    note.noteNumber <= n1 && note.noteNumber > n2 
  )
}

function getNoteUnderPoint(notes, x, y, t) {
  const tick = t.getTicks(x)
  const n = Math.ceil(t.getNoteNumber(y))
  return _.find(notes, note => 
    note.noteNumber == n && note.tick <= tick && note.tick + note.duration >= tick
  )
}

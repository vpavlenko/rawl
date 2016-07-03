"use strict"
class NoteContainer extends createjs.Container {
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
    const t1 = this._transform.getTicks(rect.x)
    const n1 = this._transform.getNoteNumber(rect.y)
    const t2 = this._transform.getTicks(rect.x + rect.width)
    const n2 = this._transform.getNoteNumber(rect.y + rect.height)
    return this._notes.filter(note => 
      note.tick >= t1 && note.tick < t2 &&
      note.noteNumber <= n1 && note.noteNumber > n2 
    )
  }

  getNoteIdsInRect(rect) {
    return this.getNotesInRect(rect).map(c => c.noteId)
  }

  getNoteUnderPoint(x, y) {
    const t = this._transform.getTicks(x)
    const n = Math.ceil(this._transform.getNoteNumber(y))
    return _.find(this._notes, note => 
      note.noteNumber == n && note.tick <= t && note.tick + note.duration >= t
    )
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
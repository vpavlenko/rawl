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
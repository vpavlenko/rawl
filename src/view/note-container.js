"use strict"
class NoteContainer extends createjs.Container {
  constructor(selectedNoteStore) {
    super()
    selectedNoteStore.on("change", noteIds => {
      this.children.forEach(c => {
        if (c instanceof NoteView) {
          c.selected = noteIds.includes(c.noteId)
        }
      })
    })
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

  findNoteViewById(id) {
    return _.find(this.children, c => {
      return c instanceof NoteView && c.noteId == id
    }) 
  }

  getNoteViewsInRect(rect) {
    return this.children.filter(c => {
        if (!(c instanceof NoteView)) return
        const b = c.getBounds()
        return rect.contains(c.x, c.y, b.width, b.height)
      })
  }

  getNoteIdsInRect(rect) {
    return this.getNoteViewsInRect(rect).map(c => c.noteId)
  }

  getNoteViewUnderPoint(x, y) {
    return _.find(this.children, c => {
      if (!(c instanceof NoteView)) return false
      const b = c.getBounds()
      return new createjs.Rectangle(c.x, c.y, b.width, b.height).contains(x, y)
    })
  }
}
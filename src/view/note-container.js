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

  set noteRects(noteRects) {
    const views = this.children.slice()
    this.clearNotes()

    noteRects.forEach(note => {
      let view = _.find(views, c => c.noteId == note.id)
      if (!view) {
        view = new NoteView
        view.noteId = note.id
      }
      view.visible = true
      view.x = note.x
      view.y = note.y
      view.velocity = note.velocity
      view.selected = note.selected
      view.setSize(note.width, note.height)
      view.refresh()
      this.addChild(view)
    })
  }
}
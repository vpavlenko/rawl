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

  set notes(notes) {
    const views = this.children.slice()
    this.clearNotes()

    notes.forEach(note => {
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
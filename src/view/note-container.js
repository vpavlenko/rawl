import _ from "lodash"
import observable from "riot-observable"
import NoteView from "../view/note-view"
import SelectionView from "../view/selection-view"

export default class NoteContainer extends createjs.Container {
  constructor() {
    super()
    observable(this)

    this.selectionView = new SelectionView
    this.selectionView.setSize(0, 0)
    this.addChild(this.selectionView)
  }

  // use stagemousedown
  onMouseDown(e) {
    const loc = this.globalToLocal(e.stageX, e.stageY)
    this.mouseHandler.onMouseDown(this, e, loc)
  }

  // use stagemousemove
  onMouseMove(e) {
    const loc = this.globalToLocal(e.stageX, e.stageY)
    this.mouseHandler.onMouseMove(this, e, loc)
  }

  // use stagemouseup
  onMouseUp(e) {
    const loc = this.globalToLocal(e.stageX, e.stageY)
    this.mouseHandler.onMouseUp(this, e, loc)
  }

  get selectionRect() {
    if (!this._selection) {
      return new createjs.Rectangle
    }
    const b = this._selection.getBounds(this._transform)
    return new createjs.Rectangle(b.x, b.y, b.width, b.height)
  }

  get selection() {
    return this._selection
  }

  set selection(selection) {
    this._selection = selection
    this.selectionView.visible = selection != null
    if (selection) {
      const b = this.selectionRect
      this.selectionView.x = b.x
      this.selectionView.y = b.y
      this.selectionView.setSize(b.width, b.height)
    } else {
      this.selectionView.setSize(0, 0)
    }
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

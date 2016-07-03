"use strict"

const MAX_NOTE_NUMBER = 127
const RULER_HEIGHT = 22
const KEY_WIDTH = 100
const KEY_HEIGHT = 14
const CONTROL_HEIGHT = 200
const PIXELS_PER_TICK = 0.1
const TIME_BASE = 480

function createNote(tick = 0, noteNumber = 48, duration = 240, velocity = 127, channel) {
  return {
    type: "channel",
    subtype: "note",
    noteNumber: noteNumber || 48,
    tick: tick || 0,
    velocity: velocity || 127,
    duration: duration || 240,
    channel: channel,
    track: channel
  }
}

class PianoRollController {
  constructor(canvas) {
    this.emitter = {}
    riot.observable(this.emitter)

    this.quantizationDenominator = 4

    this.showNotes = this.showNotes.bind(this)
    this.onScroll = this.onScroll.bind(this)

    this.loadView(canvas)
  }

  set ticksPerBeat(ticksPerBeat) {
    this._ticksPerBeat = ticksPerBeat
    this.grid.ticksPerBeat = ticksPerBeat
  }

  set transform(t) {
    this._transform = t
    this.grid.transform = t
    this.noteContainer.transform = t
    this.keys.transform = t

    this.calcContentSize()
    this.selection = this._selection
  }

  get quantizer() {
    return SharedService.quantizer
  }

  get player() {
    return SharedService.player
  }

  set track(track) {
    if (this._track) {
      this._track.off("change", this.showNotes)
    }
    this._track = track
    this._track.on("change", this.showNotes)

    this.calcContentSize()
    this.showNotes()
  }

  set mouseMode(mode) {
    switch(mode) {
    case 0:
      this.bindMouseHandler(new PencilMouseHandler(this.noteContainer))
      break
    case 1:
      this.bindMouseHandler(new SelectionMouseHandler(this.noteContainer, this.selectionView))
      break
    }
  }

  set selection(selection) {
    this._selection = selection
    this.selectionView.visible = selection != null
    if (selection) {
      const left = this._transform.getX(selection.fromTick)
      const right = this._transform.getX(selection.toTick)
      const top = this._transform.getY(selection.fromNoteNumber)
      const bottom = this._transform.getY(selection.toNoteNumber)
      this.selectionView.x = left
      this.selectionView.y = top
      this.selectionView.setSize(right - left, bottom - top)
    } else {
      this.selectionView.setSize(0, 0)
    }
    this.stage.update()
    this.showNotes()
  }

  loadView(canvas) {
    this.canvas = canvas
    this.stage = new createjs.Stage(canvas)
    this.stage.enableMouseOver()

    this.scrollContainer = new createjs.ScrollContainer(canvas)
    this.stage.addChild(this.scrollContainer)

    this.grid = new PianoGridView(RULER_HEIGHT)
    this.scrollContainer.addChild(this.grid)

    this.noteContainer = new NoteContainer()
    this.scrollContainer.addChild(this.noteContainer)

    this.controlContainer = new VelocityControlView(this.coordConverter)
    this.scrollContainer.addChild(this.controlContainer)

    this.selectionView = new SelectionView
    this.selectionView.setSize(0, 0)
    this.noteContainer.addChild(this.selectionView)

    this.keys = new PianoKeysView(KEY_WIDTH)
    this.keys.y = RULER_HEIGHT
    this.scrollContainer.addChild(this.keys)

    this.scrollContainer.addChild(this.grid.ruler)

    this.viewDidLoad()

    const resizeFunc = () => {
      const rect = canvas.getBoundingClientRect()
      this.resizeView(rect.width, rect.height)
    }
    window.onresize = resizeFunc
    resizeFunc()
  }

  viewDidLoad() {
    this.transform = new NoteCoordTransform(PIXELS_PER_TICK, KEY_HEIGHT, MAX_NOTE_NUMBER)
    this.ticksPerBeat = TIME_BASE
    this.mouseMode = 0

    this.stage.on("stagemousedown", e => {
      this.mouseHandler.onMouseDown(e)
    })
    this.stage.on("stagemouseup", e => {
      this.mouseHandler.onMouseUp(e)
    })
    this.stage.on("stagemousemove", e => {
      this.mouseHandler.onMouseMove(e)
    })

    this.controlContainer.on("change", e => {
      this._track.updateEvent(e.noteId, {velocity: e.velocity})
    })

    this.grid.ruler.on("click", e => {
      const tick = this.coordConverter.getTicksForPixels(this.quantizer.roundX(e.localX))
      opts.onMoveCursor(tick)
    })

    this.scrollContainer.on("scroll", this.onScroll)

    setInterval(() => {
      const tick = this.player.position
      this.grid.cursorPosition = this._transform.getX(tick)
      this.stage.update()
    }, 66)
  }

  getNotes() {
    return this._track.getEvents()
      .filter(e => e.subtype == "note")
  }

  calcContentSize() {
    const noteEnds = this._track ? this.getNotes().map(n => n.tick + n.duration) : [0]
    const maxTick = Math.max.apply(null, noteEnds)
    const maxX = this._transform.getX(maxTick)
    this.contentWidth = Math.ceil(maxX + KEY_WIDTH)
    this.contentHeight = this._transform.getY(0) + RULER_HEIGHT
    this.layoutSubviews()
  }

  showNotes() {
    if (!this._track) {
      return
    }
    const tickStart = this._transform.getTicks(-this.scrollContainer.scrollX)
    const tickEnd = this._transform.getTicks(-this.scrollContainer.scrollX + this.scrollContainer.getBounds().width)
    const notes = this.getNotes()
      .filter(note => note.tick >= tickStart && note.tick <= tickEnd)
      .map(note => {
        if (this._selection) {
          note.selected = this._selection.noteIds.includes(note.id)
        } else {
          note.selected = false
        }
        return note
      })

    this.noteContainer.notes = notes
    this.controlContainer.notes = notes
    this.grid.endTick = Math.max(100000, tickEnd)

    this._notes = notes
    this.stage.update()
  }

  layoutSubviews() {
    this.scrollContainer.setBounds(0, 0, this.canvas.width, this.canvas.height)
    this.scrollContainer.contentSize = {
      width: this.contentWidth, 
      height: this.contentHeight
    }

    this.grid.x = KEY_WIDTH
    this.grid.redraw()
    this.grid.ruler.x = KEY_WIDTH

    this.noteContainer.x = KEY_WIDTH
    this.noteContainer.y = RULER_HEIGHT

    this.controlContainer.x = KEY_WIDTH
    this.controlContainer.setBounds(0, 0, this.contentWidth, CONTROL_HEIGHT)

    this.onScroll()
  }

  resizeView(width, height) {
    this.canvas.width = width
    this.canvas.height = height
    this.layoutSubviews()
  }

  onScroll() {
    this.keys.x = -this.scrollContainer.scrollX
    this.grid.rulerY = -this.scrollContainer.scrollY
    this.controlContainer.y = 
      this.scrollContainer.getBounds().height - 
      this.controlContainer.getBounds().height - 
      this.scrollContainer.scrollY - 17
    this.showNotes()
  }

  bindMouseHandler(handler) {
    if (this.mouseHandler) {
      this.mouseHandler.off("*")
    }
    this.mouseHandler = handler

    handler.on("add-note", e => {
      this._track.addEvent(createNote(
        Math.floor(this._transform.getTicks(e.x)),
        Math.ceil(this._transform.getNoteNumber(e.y))
      ))
    })

    handler.on("remove-note", id => this._track.removeEvent(id))

    handler.on("drag-note-left-edge", e => {
      // 右端を固定して長さを変更
      const dt = this._transform.getTicks(e.movement.x)
      if (dt == 0) {
        return
      }

      const n = this._track.getEventById(e.noteId)

      this._track.updateEvent(e.noteId, {
        tick: n.tick + dt,
        duration: n.duration - dt
      })

      e.changed(this._transform.getX(dt))
    })

    handler.on("drag-note-right-edge", e => {
      // 長さを変更
      const dt = this._transform.getTicks(e.movement.x)
      if (dt == 0) {
        return
      }

      const n = this._track.getEventById(e.noteId)
      this._track.updateEvent(e.noteId, {duration: n.duration + dt})
      e.changed(this._transform.getX(dt))
    })

    handler.on("drag-note-center", e => {
      // 移動
      const dt = this._transform.getTicks(e.movement.x)
      const dn = Math.round(this._transform.getDeltaNoteNumber(e.movement.y))
      if (dt == 0 && dn == 0) {
        return
      }

      const n = this._track.getEventById(e.noteId)
      this._track.updateEvent(e.noteId, {
        tick: n.tick + dt,
        noteNumber: n.noteNumber + dn
      })
      e.changed(this._transform.getX(dt), this._transform.getDeltaY(dn))
    })

    handler.on("change-cursor", cursor => {
      const style = this.canvas.parentNode.style
      if (style.cursor != cursor) {
        style.cursor = cursor
      }
    })

    handler.on("clear-selection", () => {
      // 選択範囲外でクリックした場合は選択範囲をリセット
      this.selection = null
    })

    handler.on("resize-selection", rect => {
      this.selection = new Selection(
        this._transform.getTicks(rect.x), 
        Math.ceil(this._transform.getNoteNumber(rect.y)), 
        this._transform.getTicks(rect.x + rect.width), 
        Math.ceil(this._transform.getNoteNumber(rect.y + rect.height)),
        []
      )
    })

    handler.on("select-notes", ids => {
      if (!this._selection) {
        return
      }
      this.selection = new Selection(
        this._selection.fromTick,
        this._selection.fromNoteNumber,
        this._selection.toTick,
        this._selection.toNoteNumber,
        ids
      )
      this.emitter.trigger("select-notes", ids.map(i => this._track.getEventById(i)))
    })

    handler.on("drag-selection-center", e => {
      if (!this._selection) {
        return
      }
      const dt = this._transform.getTicks(e.movement.x)
      const dn = Math.round(this._transform.getDeltaNoteNumber(e.movement.y))

      if (dt == 0 && dn == 0) {
        return
      }

      // 確定済みの選択範囲をドラッグした場合はノートと選択範囲を移動
      this.selection = this._selection.getMoved(dt, dn)

      this._selection.noteIds
        .map(id => this._track.getEventById(id))
        .forEach(e => {
          if (!e) {
            return
          }
          this._track.updateEvent(e.id, {
            tick: e.tick + dt,
            noteNumber: e.noteNumber + dn
          })
        })

      e.changed(this._transform.getX(dt), this._transform.getDeltaY(dn))
    })

    handler.on("drag-selection-left-edge", e => {
      if (!this._selection) {
        return
      }
      const dt = this._transform.getTicks(e.movement.x)
      if (dt == 0) {
        return
      }

      const notes = this._selection.noteIds
        .map(id => this._track.getEventById(id))
        .filter(e => e != null)
        .map(e => { return {
          id: e.id,
          tick: e.tick + dt,
          duration: e.duration - dt
        }})

      // 幅がゼロになるノートがあるときは変形しない
      if (!_.every(notes, r => r.duration > 0)) {
        return
      }

      // 右端を固定して長さを変更
      this.selection = new Selection(
        this._selection.fromTick + dt,
        this._selection.fromNoteNumber,
        this._selection.toTick,
        this._selection.toNoteNumber,
        this._selection.noteIds
      )

      notes.forEach(e => this._track.updateEvent(e.id, e))
      e.changed(this._transform.getX(dt))
    })

    handler.on("drag-selection-right-edge", e => {
      if (!this._selection) {
        return
      }
      const dt = this._transform.getTicks(e.movement.x)
      if (dt == 0) {
        return
      }

      const notes = this._selection.noteIds
        .map(id => this._track.getEventById(id))
        .filter(e => e != null)
        .map(e => { return {
          id: e.id,
          duration: e.duration + dt
        }})

      // 幅がゼロになるノートがあるときは変形しない
      if (!_.every(notes, r => r.duration > 0)) {
        return
      }

      // 左端を固定して長さを変更
      this.selection = new Selection(
        this._selection.fromTick,
        this._selection.fromNoteNumber,
        this._selection.toTick + dt,
        this._selection.toNoteNumber,
        this._selection.noteIds
      )

      notes.forEach(e => this._track.updateEvent(e.id, e))
      e.changed(this._transform.getX(dt))
    })
  }

}
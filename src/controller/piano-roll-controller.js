"use strict"

const MAX_NOTE_NUMBER = 127
const PIXELS_PER_TICK = 0.1
const TIME_BASE = 480
const KEY_HEIGHT = 14

const RULER_HEIGHT = 22
const KEY_WIDTH = 100
const CONTROL_HEIGHT = 200

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

function recursiveNumChildren(obj) {
  let count = 0
  if (obj.children) {
    obj.children.forEach(c => {
      count += recursiveNumChildren(c)
    })
  } else {
    count++
  }
  return count
}

class PianoRollController {
  constructor(canvas) {
    this.emitter = {}
    riot.observable(this.emitter)

    this.showNotes = this.showNotes.bind(this)
    this.onScroll = this.onScroll.bind(this)

    this.loadView(canvas)

    this.noteScale = {x: 1, y: 1}
  }

  set noteScale(scale) {
    this._noteScale = scale
    this.transform = new NoteCoordTransform(PIXELS_PER_TICK * scale.x, KEY_HEIGHT * scale.y, MAX_NOTE_NUMBER)
  }

  get noteScale() {
    return this._noteScale
  }

  set ticksPerBeat(ticksPerBeat) {
    this._ticksPerBeat = ticksPerBeat
    this.grid.ticksPerBeat = ticksPerBeat
    this.controlView.ticksPerBeat = ticksPerBeat
    this._quantizer = new Quantizer(ticksPerBeat)
  }

  set transform(t) {
    this._transform = t
    this.grid.transform = t
    this.noteContainer.transform = t
    this.keys.transform = t
    this.controlView.transform = t

    this.calcContentSize()
    this.selection = this._selection
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

  set quantizeDenominator(val) {
    this._quantizer.denominator = val
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

    this.controlView = new VelocityControlView(this.coordConverter)
    this.scrollContainer.addChild(this.controlView)

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

    this.controlView.on("change", e => {
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

      console.log(recursiveNumChildren(this.stage))
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
    this.controlView.notes = notes
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

    this.controlView.x = KEY_WIDTH
    this.controlView.setBounds(0, 0, this.contentWidth, CONTROL_HEIGHT)

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
    this.controlView.y = 
      this.scrollContainer.getBounds().height - 
      this.controlView.getBounds().height - 
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
        this._quantizer.floor(this._transform.getTicks(e.x)),
        Math.ceil(this._transform.getNoteNumber(e.y))
      ))
    })

    handler.on("remove-note", id => this._track.removeEvent(id))

    handler.on("drag-note-left-edge", e => {
      // 右端を固定して長さを変更
      const dt = this._transform.getTicks(e.movement.x)
      const tick = this._quantizer.round(e.note.tick + dt)
      if (e.note.tick < tick) {
        return
      }

      this._track.updateEvent(e.note.id, {
        tick: tick,
        duration: e.note.duration + (e.note.tick - tick)
      })
    })

    handler.on("drag-note-right-edge", e => {
      // 長さを変更
      const dt = this._transform.getTicks(e.movement.x)
      const duration = Math.max(this._quantizer.unit, 
        this._quantizer.round(dt + e.note.duration))
      if (e.note.duration == duration) {
        return
      }

      this._track.updateEvent(e.note.id, {duration: duration})
    })

    handler.on("drag-note-center", e => {
      // 移動
      const dt = this._transform.getTicks(e.movement.x)
      const tick = this._quantizer.round(e.note.tick + dt)
      const dn = Math.round(this._transform.getDeltaNoteNumber(e.movement.y))
      const noteNumber = e.note.noteNumber + dn
      if (e.note.tick == tick && dn == 0) {
        return
      }

      this._track.updateEvent(e.note.id, {
        tick: tick,
        noteNumber: noteNumber
      })
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
        this._quantizer.round(this._transform.getTicks(rect.x)), 
        Math.ceil(this._transform.getNoteNumber(rect.y)), 
        this._quantizer.round(this._transform.getTicks(rect.x + rect.width)), 
        Math.ceil(this._transform.getNoteNumber(rect.y + rect.height)),
        []
      )
    })

    handler.on("select-notes", notes => {
      if (!this._selection) {
        return
      }
      this.selection = new Selection(
        this._selection.fromTick,
        this._selection.fromNoteNumber,
        this._selection.toTick,
        this._selection.toNoteNumber,
        notes
      )
      this.emitter.trigger("select-notes", notes)
    })

    handler.on("drag-selection-center", e => {
      if (!this._selection) {
        return
      }
      const dt = this._quantizer.round(this._transform.getTicks(e.movement.x))
      const dn = Math.round(this._transform.getDeltaNoteNumber(e.movement.y))

      // 確定済みの選択範囲をドラッグした場合はノートと選択範囲を移動
      this.selection = this._selection.original.copyMoved(dt, dn)

      this._selection.notes.forEach(e => {
        this._track.updateEvent(e.id, {
          tick: e.tick + dt,
          noteNumber: e.noteNumber + dn
        })
      })
    })

    handler.on("end-dragging", ids => {
      if (!this._selection) {
        return
      }
      // reset selection
      const notes = this._selection.noteIds.map(i => this._track.getEventById(i))
      this.selection = this._selection.copyUpdated(notes)
    })

    handler.on("drag-selection-left-edge", e => {
      if (!this._selection) {
        return
      }
      const dt = this._quantizer.floor(this._transform.getTicks(e.movement.x))
      if (dt > 0) {
        return
      }

      const notes = this._selection.notes.map(e => { return {
        id: e.id,
        tick: e.tick + dt,
        duration: e.duration - dt
      }})

      // 幅がゼロになるノートがあるときは変形しない
      if (!_.every(notes, r => r.duration > 0)) {
        return
      }

      // 右端を固定して長さを変更
      this.selection = this._selection.original.copyMoved(dt, 0, -dt)
      notes.forEach(e => this._track.updateEvent(e.id, e))
    })

    handler.on("drag-selection-right-edge", e => {
      if (!this._selection) {
        return
      }
      const dt = this._quantizer.floor(this._transform.getTicks(e.movement.x))
      if (dt == 0) {
        return
      }

      const notes = this._selection.notes.map(e => { return {
        id: e.id,
        duration: Math.max(this._quantizer.unit, e.duration + dt)
      }})

      // 左端を固定して長さを変更
      this.selection = this._selection.original.copyMoved(0, 0, dt)
      notes.forEach(e => this._track.updateEvent(e.id, e))
    })
  }

}
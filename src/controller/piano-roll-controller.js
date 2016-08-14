import _ from "lodash"
import SharedService from "../shared-service"
import PianoKeysView from "../view/piano-keys-view"
import NoteContainer from "../view/note-container"
import SelectionView from "../view/selection-view"
import PianoGridView from "../view/piano-grid-view"
import VelocityControlView from "../view/velocity-control-view"
import NoteCoordTransform from "../model/note-coord-transform"
import { PencilMouseHandler, SelectionMouseHandler } from "../note-mouse-handler"
import Config from "../config.js"

const MAX_NOTE_NUMBER = 127
const PIXELS_PER_TICK = 0.1
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
    channel: channel
  }
}

export default class PianoRollController {
  constructor(canvas) {
    this.emitter = {}
    riot.observable(this.emitter)

    this.showNotes = this.showNotes.bind(this)
    this.onScroll = this.onScroll.bind(this)

    this.loadView(canvas)

    this.noteScale = {x: 1, y: 1}
    this.autoScroll = true
  }

  set noteScale(scale) {
    this._noteScale = scale
    this.transform = new NoteCoordTransform(PIXELS_PER_TICK * scale.x, KEY_HEIGHT * scale.y, MAX_NOTE_NUMBER)
  }

  get noteScale() {
    return this._noteScale
  }

  get _quantizer() {
    return SharedService.quantizer
  }

  set ticksPerBeat(ticksPerBeat) {
    this._ticksPerBeat = ticksPerBeat
    this.grid.ticksPerBeat = ticksPerBeat
    this.controlView.ticksPerBeat = ticksPerBeat
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

  get mouseMode() {
    return this._mouseMode
  }

  set mouseMode(mode) {
    this._mouseMode = mode
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
      const b = selection.getBounds(this._transform)
      this.selectionView.x = b.x
      this.selectionView.y = b.y
      this.selectionView.setSize(b.width, b.height)
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

    this.selectionView = new SelectionView
    this.selectionView.setSize(0, 0)
    this.noteContainer.addChild(this.selectionView)

    this.keys = new PianoKeysView(KEY_WIDTH)
    this.keys.y = RULER_HEIGHT
    this.scrollContainer.addChild(this.keys)

    this.controlView = new VelocityControlView(KEY_WIDTH)
    this.scrollContainer.addChild(this.controlView)

    this.scrollContainer.addChild(this.grid.ruler)

    this.viewDidLoad()

    const resizeFunc = () => {
      const rect = canvas.parentNode.getBoundingClientRect()
      this.resizeView(rect.width, rect.height)
    }
    window.onresize = resizeFunc
    resizeFunc()
  }

  viewDidLoad() {
    this.ticksPerBeat = Config.TIME_BASE
    this.mouseMode = 0

    this.stage.on("stagemousedown", e => {
      const loc = this.noteContainer.globalToLocal(e.stageX, e.stageY)
      this.mouseHandler.onMouseDown(e, loc)
    })
    this.stage.on("stagemouseup", e => {
      const loc = this.noteContainer.globalToLocal(e.stageX, e.stageY)
      this.mouseHandler.onMouseUp(e, loc)
    })
    this.stage.on("stagemousemove", e => {
      const loc = this.noteContainer.globalToLocal(e.stageX, e.stageY)
      this.mouseHandler.onMouseMove(e, loc)
    })

    this.controlView.on("change", e => {
      this._track.updateEvent(e.noteId, {velocity: e.velocity})
    })

    this.grid.ruler.on("click", e => {
      const tick = this._transform.getTicks(e.localX)
      this.emitter.trigger("move-cursor", tick)
    })

    this.scrollContainer.on("scroll", this.onScroll)

    this.player.on("change-position", tick => {
      const x = this._transform.getX(tick)
      this.grid.cursorPosition = x
      this.stage.update()

      // keep scroll position to cursor 
      if (this.autoScroll && this.player.isPlaying) {
        const screenX = x + this.scrollContainer.scrollX
        if (screenX > this.canvas.width * 0.7 || screenX < 0) {
          this.scrollContainer.scrollX = -x
        }
      }
    })
  }

  getNotes() {
    return this._track.getEvents()
      .filter(e => e.subtype == "note")
  }

  calcContentSize() {
    const noteEnds = this._track ? this.getNotes().map(n => n.tick + n.duration) : [0]
    const maxTick = Math.max.apply(null, noteEnds)
    const maxX = Math.max(this._transform.getX(maxTick), this.canvas.width - KEY_WIDTH)
    this.contentWidth = Math.ceil(maxX + KEY_WIDTH)
    this.contentHeight = this._transform.getMaxY() + RULER_HEIGHT + CONTROL_HEIGHT
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
    this.controlView.endTick = Math.max(100000, tickEnd)

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
    this.grid.ruler.x = KEY_WIDTH + 0.5

    this.noteContainer.x = KEY_WIDTH
    this.noteContainer.y = RULER_HEIGHT

    this.controlView.setBounds(0, 0, this.contentWidth + KEY_WIDTH, CONTROL_HEIGHT)

    this.onScroll()
  }

  resizeView(width, height) {
    this.canvas.width = width
    this.canvas.height = height
    this.layoutSubviews()
  }

  onScroll() {
    const x = this.scrollContainer.scrollX
    const y = this.scrollContainer.scrollY
    this.keys.onScroll(x, y)
    this.grid.onScroll(x, y)
    this.controlView.y = 
      this.scrollContainer.getBounds().height - 
      this.controlView.getBounds().height - 
      y - 17
    this.controlView.onScroll(x, y)
    this.showNotes()
  }

  bindMouseHandler(handler) {
    if (this.mouseHandler) {
      this.mouseHandler.off("*")
    }
    this.mouseHandler = handler

    handler.on("add-note", e => {
      const note = createNote(
        this._quantizer.floor(this._transform.getTicks(e.x)),
        Math.ceil(this._transform.getNoteNumber(e.y)),
        this._quantizer.unit
      )
      this._track.addEvent(note)
      this._draggingNote = _.cloneDeep(note)
      
      SharedService.player.playNote(note)
    })

    handler.on("start-note-dragging", note => {
      this._draggingNote = _.cloneDeep(note)
    })

    handler.on("remove-note", id => this._track.removeEvent(id))

    handler.on("drag-note-left-edge", e => {
      const note = this._draggingNote

      // 右端を固定して長さを変更
      const dt = this._transform.getTicks(e.movement.x)
      const tick = this._quantizer.round(note.tick + dt)
      if (note.tick < tick) {
        return
      }

      this._track.updateEvent(note.id, {
        tick: tick,
        duration: note.duration + (note.tick - tick)
      })
    })

    handler.on("drag-note-right-edge", e => {
      const note = this._draggingNote

      // 長さを変更
      const dt = this._transform.getTicks(e.movement.x)
      const duration = Math.max(this._quantizer.unit, 
        this._quantizer.round(dt + note.duration))
      if (note.duration == duration) {
        return
      }

      this._track.updateEvent(note.id, {duration: duration})
    })

    handler.on("drag-note-center", e => {
      const note = this._draggingNote

      // 移動
      const dt = this._transform.getTicks(e.movement.x)
      const tick = this._quantizer.round(note.tick + dt)
      const dn = Math.round(this._transform.getDeltaNoteNumber(e.movement.y))
      const noteNumber = note.noteNumber + dn

      const pitchChanged = noteNumber != this._track.getEventById(note.id).noteNumber

      const n = this._track.updateEvent(note.id, {
        tick: tick,
        noteNumber: noteNumber
      })

      if (pitchChanged) {
        SharedService.player.playNote(n)
      }
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
      this.selection = Selection.fromRect(rect, this._quantizer, this._transform)
    })

    handler.on("select-notes", rect => {
      if (!this._selection) {
        return
      }
      const s = Selection.fromRect(rect, this._quantizer, this._transform)
      const notes = this.noteContainer.getNotesInRect(s.getBounds(this._transform))
      this.selection = s.copyUpdated(notes)
      this.emitter.trigger("select-notes", notes)
    })

    handler.on("drag-selection-center", e => {
      if (!this._selection) {
        return
      }
      const dt = this._quantizer.round(this._transform.getTicks(e.movement.x))
      const dn = Math.round(this._transform.getDeltaNoteNumber(e.movement.y))

      // 確定済みの選択範囲をドラッグした場合はノートと選択範囲を移動
      this.selection = this._selection.copyMoved(dt, dn)

      this._track.transaction(it => {
        this._selection.notes.forEach(e => {
          it.updateEvent(e.id, {
            tick: e.tick + dt,
            noteNumber: e.noteNumber + dn
          })
        })
      })
    })

    handler.on("end-dragging", () => {
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
      this.selection = this._selection.copyMoved(dt, 0, -dt)
      this._track.transaction(it => {
        notes.forEach(e => it.updateEvent(e.id, e))
      })
    })

    handler.on("drag-selection-right-edge", e => {
      if (!this._selection) {
        return
      }
      const dt = this._quantizer.floor(this._transform.getTicks(e.movement.x))
      if (dt == 0) {
        return
      }
      
      // 左端を固定して長さを変更
      this.selection = this._selection.copyMoved(0, 0, dt)

      const notes = this._selection.notes.map(e => { return {
        id: e.id,
        duration: Math.max(this._quantizer.unit, e.duration + dt)
      }})

      this._track.transaction(it => {
        notes.forEach(e => it.updateEvent(e.id, e))
      })
    })

    handler.on("drag-scroll", e => {
      this.scrollContainer.scrollX += e.movement.x
      this.scrollContainer.scrollY += e.movement.y
    })

    handler.on("change-tool", () => {
      this.mouseMode = this.mouseMode == 0 ? 1 : 0 
    })

    handler.on("move-cursor", x => {
      this.emitter.trigger("move-cursor", this._transform.getTicks(x))
    })
  }
}
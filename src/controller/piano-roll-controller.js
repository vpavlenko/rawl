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
  constructor(model, canvas) {
    this.emitter = {}
    riot.observable(this.emitter)

    this.quantizationDenominator = 4

    this.mouseMode = 0
    this.selectedNoteIdStore = []
    riot.observable(this.selectedNoteIdStore)
    this.selectedNoteIdStore.on("change", ids => {
      this.emitter.trigger("select-notes", ids.map(i => this.track.getEventById(i)))
    })

    this.showNotes = this.showNotes.bind(this)
    this.onScroll = this.onScroll.bind(this)

    this.loadView(canvas)
    model.on("change-tool", i => this.setMouseMode(i))
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
  }

  get quantizer() {
    return SharedService.quantizer
  }

  get player() {
    return SharedService.player
  }

  setTrack(track) {
    if (this.track) {
      this.track.off("change", this.showNotes)
    }
    this.track = track
    this.track.on("change", this.showNotes)

    this.calcContentSize()
    this.showNotes()
  }

  loadView(canvas) {
    this.canvas = canvas
    this.stage = new createjs.Stage(canvas)
    this.stage.enableMouseOver()

    this.scrollContainer = new createjs.ScrollContainer(canvas)
    this.stage.addChild(this.scrollContainer)

    this.grid = new PianoGridView(RULER_HEIGHT)
    this.grid.endTick = 100000
    this.scrollContainer.addChild(this.grid)

    this.noteContainer = new NoteContainer(this.selectedNoteIdStore)
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
    this.setMouseMode(0)

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
      this.track.updateEvent(e.noteId, {velocity: e.velocity})
    })

    this.grid.ruler.on("click", e => {
      const tick = this.coordConverter.getTicksForPixels(this.quantizer.roundX(e.localX))
      opts.onMoveCursor(tick)
    })

    this.scrollContainer.on("scroll", this.onScroll)

    // setInterval(() => {
    //   const tick = this.player.position
    //   this.grid.cursorPosition = this.coordConverter.getPixelsAt(tick)
    //   this.stage.update()
    // }, 66)
  }

  getNotes() {
    return this.track.getEvents()
      .filter(e => e.subtype == "note")
  }

  calcContentSize() {
    const noteEnds = this.track ? this.getNotes().map(n => n.tick + n.duration) : [0]
    const maxTick = Math.max.apply(null, noteEnds)
    const maxX = this._transform.getX(maxTick)
    this.contentWidth = Math.ceil(maxX + KEY_WIDTH)
    this.contentHeight = this._transform.getY(0) + RULER_HEIGHT
    this.layoutSubviews()
  }

  showNotes() {
    if (!this.track) {
      return
    }
    const tickStart = this._transform.getTicks(-this.scrollContainer.scrollX)
    const tickEnd = this._transform.getTicks(-this.scrollContainer.scrollX + this.scrollContainer.getBounds().width)
    const notes = this.getNotes()
      .filter(note => note.tick >= tickStart && note.tick <= tickEnd)
      .map(note => {
        note.selected = this.selectedNoteIdStore.includes(note.id)
        return note
      })

    this.noteContainer.notes = notes
    this.controlContainer.notes = notes

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

  setMouseMode(mode) {
    switch(mode) {
    case 0:
      this.bindMouseHandler(new PencilMouseHandler(this.noteContainer))
      break
    case 1:
      this.bindMouseHandler(new SelectionMouseHandler(this.noteContainer, this.selectionView, this.selectedNoteIdStore))
      break
    }
  }

  bindMouseHandler(handler) {
    if (this.mouseHandler) {
      this.mouseHandler.off("*")
    }
    this.mouseHandler = handler

    handler.on("add-note", e => {
      this.track.addEvent(createNote(
        Math.floor(this._transform.getTicks(e.x)),
        Math.floor(this._transform.getNoteNumber(e.y))
      ))
    })

    handler.on("remove-note", id => this.track.removeEvent(id))

    handler.on("drag-note-left-edge", e => {
      // 右端を固定して長さを変更
      const x = this.quantizer.roundX(e.target.bounds.x + e.movement.x)
      const width = this.quantizer.roundX(e.target.bounds.width - e.movement.x)

      this.track.updateEvent(e.target.noteId, this.coordConverter.getNoteForRect({
        x: x,
        width: Math.max(this.quantizer.unitX, width)
      }))
    })

    handler.on("drag-note-right-edge", e => {
      // 長さを変更
      const width = Math.max(this.quantizer.unitX, this.quantizer.roundX(e.target.bounds.width + e.movement.x))

      this.track.updateEvent(e.target.noteId, this.coordConverter.getNoteForRect({
        width: width
      }))
    })

    handler.on("drag-note-center", e => {
      // 移動
      this.track.updateEvent(e.target.noteId, this.coordConverter.getNoteForRect({
        x: this.quantizer.roundX(e.target.bounds.x + e.movement.x),
        y: this.quantizer.roundY(e.target.bounds.y + e.movement.y)
      }))
    })

    handler.on("change-cursor", cursor => {
      const style = this.canvas.parentNode.style
      if (style.cursor != cursor) {
        style.cursor = cursor
      }
    })

    handler.on("clear-selection", () => {
      // 選択範囲外でクリックした場合は選択範囲をリセット
      this.selectedNoteIds = []
      this.selectionView.fixed = false
      this.selectionView.visible = false
    })

    handler.on("resize-selection", rect => {
      const w = this.quantizer.roundX(rect.width) || this.quantizer.unitX
      const h = this.quantizer.roundY(rect.height) || this.quantizer.unitY

      this.selectionView.visible = true
      this.selectionView.x = this.quantizer.roundX(rect.x)
      this.selectionView.y = this.quantizer.roundY(rect.y)
      this.selectionView.setSize(w, h)
    })

    handler.on("drag-selection-center", e => {
      if (e.movement.x == 0 && e.movement.y == 0) {
        return
      }

      // 確定済みの選択範囲をドラッグした場合はノートと選択範囲を移動
      this.selectionView.x += e.movement.x
      this.selectionView.y += e.movement.y

      this.selectedNoteIdStore
        .map(id => this.noteContainer.findNoteViewById(id))
        .forEach(view => {
          if (!view) {
            return
          }
          this.track.updateEvent(view.noteId, this.coordConverter.getNoteForRect({
            x: view.x + e.movement.x,
            y: view.y + e.movement.y
          }))
        })

      e.changed()
    })

    handler.on("drag-selection-left-edge", e => {
      if (e.movement.x == 0) {
        return
      }

      const rects = this.selectedNoteIdStore
        .map(id => this.noteContainer.findNoteViewById(id))
        .filter(v => v != null)
        .map(view => { return {
          noteId: view.noteId,
          x: view.x + e.movement.x,
          width: view.getBounds().width - e.movement.x
        }})

      // 幅がゼロになるノートがあるときは変形しない
      if (!_.every(rects, r => r.width > 0)) {
        return
      }

      // 右端を固定して長さを変更
      this.selectionView.x += e.movement.x
      const b = this.selectionView.getBounds()
      this.selectionView.setSize(b.width - e.movement.x, b.height)

      rects.forEach(r => 
        this.track.updateEvent(r.noteId, this.coordConverter.getNoteForRect(r))
      )

      e.changed()
    })

    handler.on("drag-selection-right-edge", e => {
      if (e.movement.x == 0) {
        return
      }

      const rects = this.selectedNoteIdStore
        .map(id => this.noteContainer.findNoteViewById(id))
        .filter(v => v != null)
        .map(view => { return {
          noteId: view.noteId,
          width: view.getBounds().width + e.movement.x
        }})

      // 幅がゼロになるノートがあるときは変形しない
      if (!_.every(rects, r => r.width > 0)) {
        return
      }

      // 左端を固定して長さを変更
      const b = this.selectionView.getBounds()
      this.selectionView.setSize(b.width + e.movement.x, b.height)

      rects.forEach(r => 
        this.track.updateEvent(r.noteId, this.coordConverter.getNoteForRect(r))
      )

      e.changed()
    })
  }
}
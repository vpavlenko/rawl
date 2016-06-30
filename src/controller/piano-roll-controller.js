"use strict"

const RULER_HEIGHT = 22
const KEY_WIDTH = 100
const CONTROL_HEIGHT = 200

class PianoRollController {
  constructor(model, canvas) {
    this.emitter = {}
    riot.observable(this.emitter)

    this.mouseMode = 0
    this.selectedNoteIdStore = []
    riot.observable(this.selectedNoteIdStore)
    this.selectedNoteIdStore.on("change", ids => {
      this.emitter.trigger("select-notes", ids.map(i => this.track.getEventById(i)))
    })

    this.showNotes = this.showNotes.bind(this)
    this.onScroll = this.onScroll.bind(this)

    this.loadView(canvas)
    model.on("change-tool", i => this.mouseMode = i)
  }

  get coordConverter() {
    return SharedService.coordConverter
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

    this.mouseHandlers.forEach(h => {
      h.setTrack(track)
    })

    this.calcContentSize()
    this.showNotes()
  }

  loadView(canvas) {
    this.canvas = canvas
    this.stage = new createjs.Stage(canvas)
    this.stage.enableMouseOver()

    this.scrollContainer = new createjs.ScrollContainer(canvas)
    this.stage.addChild(this.scrollContainer)

    this.grid = new PianoGridView(127, RULER_HEIGHT, this.coordConverter, 1000)
    this.grid.endBeat = 1000
    this.scrollContainer.addChild(this.grid)

    this.noteContainer = new NoteContainer(this.selectedNoteIdStore)
    this.scrollContainer.addChild(this.noteContainer)

    this.controlContainer = new VelocityControlView(this.coordConverter)
    this.scrollContainer.addChild(this.controlContainer)

    this.selectionView = new SelectionView
    this.selectionView.setSize(0, 0)
    this.noteContainer.addChild(this.selectionView)

    this.keys = new PianoKeysView(KEY_WIDTH, this.quantizer.unitY, 127)
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

    const listener = {
      onCursorChanged: cursor => {
        const style = this.canvas.parentNode.style
        if (style.cursor != cursor) {
          style.cursor = cursor
        }
      },
      onClickNotes: notes => {

      }
    }

    this.mouseHandlers = [
      new PencilMouseHandler(this.noteContainer, this.canvas, listener),
      new SelectionMouseHandler(this.noteContainer, this.selectionView, listener, this.selectedNoteIdStore)
    ]

    setInterval(() => {
      const tick = this.player.position
      this.grid.cursorPosition = this.coordConverter.getPixelsAt(tick)
      this.stage.update()
    }, 66)
  }

  getNoteRects() {
    return this.track.getEvents()
      .filter(e => e.subtype == "note")
      .map(this.coordConverter.eventToRect)
  }

  calcContentSize() {
    const noteRightEdges = this.getNoteRects().map(n => n.x + n.width)
    const maxNoteX = Math.max.apply(null, noteRightEdges)
    this.contentWidth = Math.ceil(maxNoteX + KEY_WIDTH)
    this.contentHeight = this.coordConverter.getPixelsForNoteNumber(0) + RULER_HEIGHT
    this.layoutSubviews()
  }

  showNotes() {
    if (!this.track) {
      return
    }
    const notes = this.getNoteRects()
      .filter(note => {
        return note.x > -this.scrollContainer.scrollX && 
          note.x < -this.scrollContainer.scrollX + this.scrollContainer.getBounds().width
      }).map(note => {
        note.selected = this.selectedNoteIdStore.includes(note.id)
        return note
      })

    this.noteContainer.notes = notes
    this.controlContainer.notes = notes

    this.notes = notes
    this.stage.update()
  }

  layoutSubviews() {
    this.scrollContainer.setBounds(0, 0, this.canvas.width, this.canvas.height)
    this.scrollContainer.contentSize = {
      width: this.contentWidth, 
      height: this.contentHeight
    }

    this.grid.x = KEY_WIDTH
    this.grid.keyHeight = this.quantizer.unitY
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

  get mouseHandler() {
    return this.mouseHandlers[this.mouseMode]
  }
}
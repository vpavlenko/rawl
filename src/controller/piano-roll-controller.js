"use strict"

const RULER_HEIGHT = 22
const KEY_WIDTH = 100
const CONTROL_HEIGHT = 200

class PianoRollController {
  constructor(shi, coordConverter, quantizer, player) {
    this.noteStore = {
      create: (obj) => {
        shi.create("/tracks/_/notes", obj)
      },
      remove: (id) => {
        shi.remove(`/tracks/_/notes/${id}`)
      },
      update: (id, prop, value) => {
        shi.update(`/tracks/_/notes/${id}/${prop}`, value)
      },
      onUpdate: (func) => {
        shi.onDown("update", "/tracks/*/notes/", () => {
          func(shi.get("/tracks/_/notes"))
        })
      },
      getAll: () => shi.get("/tracks/_/notes/")
    }

    this.coordConverter = coordConverter
    this.quantizer = quantizer
    this.player = player
    this.mouseMode = 0
    this.selectedNoteIdStore = []
    riot.observable(this.selectedNoteIdStore)
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
      this.noteStore.update(e.noteId, "velocity", e.velocity)
    })

    this.grid.ruler.on("click", e => {
      const tick = this.coordConverter.getTicksForPixels(this.quantizer.roundX(e.localX))
      opts.onMoveCursor(tick)
    })

    this.scrollContainer.on("scroll", e => {
      this.updateScroll()
    })

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
      new PencilMouseHandler(this.noteContainer, this.canvas, listener, this.quantizer, this.coordConverter, this.noteStore),
      new SelectionMouseHandler(this.noteContainer, this.selectionView, listener, this.selectedNoteIdStore, this.quantizer, this.coordConverter, this.noteStore)
    ]

    setInterval(() => {
      const tick = this.player.position
      this.grid.cursorPosition = this.coordConverter.getPixelsAt(tick)
      this.stage.update()
    }, 66)

    this.noteStore.onUpdate(() => {
      this.updateNotes()
    })
  }

  updateNotes() {
    const notes = this.noteStore.getAll()
      .map(this.coordConverter.eventToRect)
      .filter(note => {
        return note.x > -this.scrollContainer.scrollX && 
          note.x < -this.scrollContainer.scrollX + this.scrollContainer.getBounds().width
      }).map(note => {
        note.selected = this.selectedNoteIdStore.includes(note.id)
        return note
      })

    this.noteContainer.notes = notes
    this.controlContainer.notes = notes

    {
      const noteRightEdges = notes
        .map(this.coordConverter.eventToRect)
        .map(n => n.x + n.width)

      const maxNoteX = Math.max.apply(null, noteRightEdges)
      this.contentWidth = Math.ceil(maxNoteX + KEY_WIDTH)
    }

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

    this.updateScroll()
  }

  resizeView(width, height) {
    this.canvas.width = width
    this.canvas.height = height
    this.layoutSubviews()
  }

  updateScroll() {
    this.keys.x = -this.scrollContainer.scrollX
    this.grid.rulerY = -this.scrollContainer.scrollY
    this.controlContainer.y = 
      this.scrollContainer.getBounds().height - 
      this.controlContainer.getBounds().height - 
      this.scrollContainer.scrollY - 17
  }

  get mouseHandler() {
    return this.mouseHandlers[this.mouseMode]
  }
}
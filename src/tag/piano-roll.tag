<!--
opts = {
  notes: [
    {
      x: <Number> X 座標 (px)
      y: <Number> Y 座標 (px)
      width: <Number> 横幅 (px)
    }
  ],
  quantizer: <Quantizer>
  coordConverter: <NoteCoordConverter>
  mouseMode: <Number> 0: pencil, 1: selection
  onCreateNote: <Function(bounds)> 
  onResizeNote: <Function(noteId, bounds)>
  onClickNote: <Function(noteId)>
  onSelectNotes: <Function(noteIds)>
  onMoveNotes : <Function([{noteId, x, y, width, height}], movement)>
  onClickNotes: <Function(noteIds, mouseEvent)>
  onMoveCursor: <Function(tick)>
  onChangeNoteVelocity: <Function(noteId, velocity)>
}
-->
<piano-roll>
  <canvas 
    class="noteCanvas"
    name="noteCanvas"></canvas>

  <script type="text/javascript">
    "use strict"
    const RULER_HEIGHT = 22
    const KEY_WIDTH = 100
    const CONTROL_HEIGHT = 200
    
    this.notes = opts.notes
    this.mouseMode = opts.mouseMode
    this.coordConverter = opts.coordConverter
    this.quantizer = opts.quantizer

    this.contentWidth = 500 + KEY_WIDTH
    this.contentHeight = this.coordConverter.getPixelsForNoteNumber(0) + RULER_HEIGHT

    const selection = {hidden: true}
    this.selections = [selection]

    const selectedNoteIdStore = []
    riot.observable(selectedNoteIdStore)

    const mouseHandlers = []

    var stage, noteContainer, mouseHandler, selectionView, grid, keys, scrollContainer, controlContainer

    this.clearNotes = () => {
      noteContainer.clearNotes()
    }

    this.setCursorPosition = tick => {
      grid.cursorPosition = this.coordConverter.getPixelsAt(tick)
      stage.update()
    }

    this.on("mount", () => {
      stage = new createjs.Stage(this.noteCanvas)
      stage.enableMouseOver()
      document.noteStage = stage

      scrollContainer = new createjs.ScrollContainer(this.noteCanvas)
      this.scrollContainer = scrollContainer
      scrollContainer.contentSize = {
        width: this.contentWidth, 
        height: this.contentHeight
      }
      stage.addChild(scrollContainer)

      stage.on("stagemousedown", e => {
        mouseHandler.onMouseDown(e)
        stage.update()
      })
      stage.on("stagemouseup", e => {
        mouseHandler.onMouseUp(e)
        stage.update()
      })
      stage.on("stagemousemove", e => {
        mouseHandler.onMouseMove(e)
        stage.update()
      })

      grid = new PianoGridView(127, RULER_HEIGHT, this.coordConverter, 1000)
      grid.endBeat = 1000
      grid.x = KEY_WIDTH
      grid.keyHeight = this.quantizer.unitY
      scrollContainer.addChild(grid)

      noteContainer = new NoteContainer(selectedNoteIdStore)
      noteContainer.x = KEY_WIDTH
      noteContainer.y = RULER_HEIGHT
      scrollContainer.addChild(noteContainer)

      controlContainer = new VelocityControlView(this.coordConverter)
      controlContainer.x = KEY_WIDTH
      controlContainer.on("change", e => {
        opts.onChangeNoteVelocity(e.noteId, e.velocity)
      })
      scrollContainer.addChild(controlContainer)

      selectionView = new SelectionView
      selectionView.setSize(0, 0)
      noteContainer.addChild(selectionView)

      opts.onCursorChanged = cursor => {
        const style = this.noteCanvas.parentNode.style
        if (style.cursor != cursor) {
          style.cursor = cursor
        }
      }

      mouseHandlers.pushArray([
        new PencilMouseHandler(noteContainer, this.noteCanvas, opts, this.quantizer),
        new SelectionMouseHandler(noteContainer, selectionView, opts, selectedNoteIdStore, this.quantizer)
      ])
      mouseHandler = mouseHandlers[this.mouseMode]

      keys = new PianoKeysView(KEY_WIDTH, this.quantizer.unitY, 127)
      keys.y = RULER_HEIGHT
      scrollContainer.addChild(keys)

      // layout the ruler above others
      grid.ruler.x = KEY_WIDTH
      scrollContainer.addChild(grid.ruler)
      grid.ruler.on("click", e => {
        const tick = this.coordConverter.getTicksForPixels(this.quantizer.roundX(e.localX))
        opts.onMoveCursor(tick)
      })

      stage.update()

      scrollContainer.on("scroll", e => {
        keys.x = -scrollContainer.scrollX
        grid.rulerY = -scrollContainer.scrollY
        controlContainer.y = scrollContainer.getBounds().height - controlContainer.getBounds().height - scrollContainer.scrollY - 17
        stage.update()
        updateViews()
      })

      this.root.oncontextmenu = e => {
        e.preventDefault()
      }

      const resizeCanvas = () => {
        const rect = this.noteCanvas.getBoundingClientRect()
        this.noteCanvas.width = rect.width
        this.noteCanvas.height = rect.height

        scrollContainer.setBounds(0, 0, rect.width, rect.height)

        updateViews()
        stage.update()
      }

      window.onresize = (e => {
        resizeCanvas()
      }).bind(this)

      resizeCanvas()
    })

    const updateViews = () => {
      const notes = this.notes.filter(note => {
        return note.x > -scrollContainer.scrollX && 
          note.x < -scrollContainer.scrollX + scrollContainer.getBounds().width
      }).map(note => {
        note.selected = selectedNoteIdStore.includes(note.id)
        return note
      })

      noteContainer.notes = notes
      controlContainer.notes = notes
    }

    this.on("update", () => {
      if (stage == null) {
        return
      }

      mouseHandler = mouseHandlers[this.mouseMode]
      this.noteCanvas.parentNode.style.cursor = this.mouseMode == 0 ? "auto" : "crosshair"

      {
        const maxNoteX = Math.max(500, this.notes != null && this.notes.length > 0 ? 
          Math.max.apply(null, (this.notes.map(n => n.x + n.width))) : 0)

        this.contentWidth = Math.ceil(maxNoteX) + KEY_WIDTH
        scrollContainer.contentSize = {
          width: this.contentWidth, 
          height: this.contentHeight
        }
        
        controlContainer.setBounds(0, 0, this.contentWidth, CONTROL_HEIGHT)
      }

      updateViews()
      grid.redraw()

      selectionView.graphics
        .clear()
        .setStrokeStyle(1)
        .beginStroke("gray")
        .drawRect(0, 0, selection.width, selection.height)
      selectionView.x = selection.x
      selectionView.y = selection.y

      stage.update()
    })
  </script>

  <style scoped>
    .noteCanvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  </style>
</piano-roll>

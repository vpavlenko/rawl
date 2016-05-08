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
  onMoveNotes : <Function([{noteId, x, y, width, height}])>
  onClickNotes: <Function(noteIds, mouseEvent)>
  onMoveCursor: <Function(tick)>
}
-->
<piano-roll>
  <canvas 
    class="noteCanvas"
    name="noteCanvas"></canvas>

  <script type="text/javascript">
    const RULER_HEIGHT = 30
    const KEY_WIDTH = 100
    const CONTROL_HEIGHT = 200

    this.contentWidth = 500 + KEY_WIDTH
    this.contentHeight = coordConverter.getPixelsForNoteNumber(0) + RULER_HEIGHT

    selection = {hidden: true}
    this.selections = [selection]
    this.notes = opts.notes
    this.mouseMode = opts.mouseMode

    const selectedNoteIdStore = []
    riot.observable(selectedNoteIdStore)

    const mouseHandlers = []

    var stage, noteContainer, mouseHandler, selectionView, grid, keys, scrollContainer, controlContainer

    this.clearNotes = () => {
      const children = noteContainer.children.slice() // copy
      noteContainer.removeAllChildren()
      children.filter(c => !(c instanceof NoteView)).forEach(c => {
        noteContainer.addChild(c)
      })
    }

    this.setCursorPosition = tick => {
      grid.cursorPosition = coordConverter.getPixelsAt(tick)
      stage.update()
    }

    this.on("mount", () => {
      stage = new createjs.Stage(this.noteCanvas)
      stage.enableMouseOver()
      document.noteStage = stage

      scrollContainer = new createjs.ScrollContainer(this.noteCanvas)
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

      grid = new PianoGridView(quantizer.unitY, 127, RULER_HEIGHT, coordConverter, 1000)
      grid.x = KEY_WIDTH
      scrollContainer.addChild(grid)

      noteContainer = new createjs.Container
      noteContainer.x = KEY_WIDTH
      noteContainer.y = RULER_HEIGHT
      scrollContainer.addChild(noteContainer)

      controlContainer = new VelocityControlView(coordConverter)
      controlContainer.x = KEY_WIDTH
      scrollContainer.addChild(controlContainer)

      selectionView = new SelectionView
      selectionView.setSize(0, 0)
      noteContainer.addChild(selectionView)

      mouseHandlers.pushArray([
        new PencilMouseHandler(noteContainer, this.noteCanvas, opts),
        new SelectionMouseHandler(noteContainer, selectionView, opts, selectedNoteIdStore)
      ])
      mouseHandler = mouseHandlers[this.mouseMode]

      keys = new PianoKeysView(KEY_WIDTH, quantizer.unitY, 127)
      keys.y = RULER_HEIGHT
      scrollContainer.addChild(keys)

      // layout the ruler above others
      grid.ruler.x = KEY_WIDTH
      scrollContainer.addChild(grid.ruler)

      grid.ruler.on("click", e => {
        const tick = coordConverter.getTicksForPixels(quantizer.roundX(e.localX))
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

    selectedNoteIdStore.on("change", () => {
      noteContainer.children.forEach(c => {
        if (c instanceof NoteView) {
          c.selected = selectedNoteIdStore.includes(c.noteId)
        }
      })
    })

    const updateNotes = (notes) => {
      const views = noteContainer.children.slice()
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
        view.selected = selectedNoteIdStore.includes(note.id)
        view.setSize(note.width, quantizer.unitY)
        view.refresh()
        noteContainer.addChild(view)
      })
    }

    const updateViews = () => {
      const notes = this.notes.filter(note => {
        return note.x > -scrollContainer.scrollX && 
          note.x < -scrollContainer.scrollX + scrollContainer.getBounds().width
      })

      updateNotes(notes)
      controlContainer.notes = notes
    }

    this.on("update", () => {
      if (stage == null) {
        return
      }

      mouseHandler = mouseHandlers[this.mouseMode]

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

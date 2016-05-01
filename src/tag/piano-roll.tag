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

    this.containerWidth = 500 + KEY_WIDTH
    this.containerHeight = coordConverter.getPixelsForNoteNumber(0) + RULER_HEIGHT

    selection = {hidden: true}
    this.selections = [selection]
    this.notes = opts.notes
    this.mouseMode = opts.mouseMode

    const selectedNoteIdStore = []
    riot.observable(selectedNoteIdStore)

    const mouseHandlers = []

    var stage, noteContainer, mouseHandler, selectionView, grid, keys

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
      stage.addChild(grid)

      noteContainer = new createjs.Container
      noteContainer.x = KEY_WIDTH
      noteContainer.y = RULER_HEIGHT
      stage.addChild(noteContainer)

      selectionView = new SelectionView
      selectionView.setSize(0, 0)
      noteContainer.addChild(selectionView)

      mouseHandlers.pushArray([
        new PencilMouseHandler(noteContainer, opts),
        new SelectionMouseHandler(noteContainer, selectionView, opts, selectedNoteIdStore)
      ])

      keys = new PianoKeysView(KEY_WIDTH, quantizer.unitY, 127)
      keys.y = RULER_HEIGHT
      stage.addChild(keys)

      // layout the ruler above others
      grid.ruler.x = KEY_WIDTH
      stage.addChild(grid.ruler)

      grid.ruler.on("click", e => {
        const tick = coordConverter.getTicksForPixels(e.localX)
        opts.onMoveCursor(tick)
      })

      stage.update()

      this.root.onscroll = e => {
        keys.x = e.target.scrollLeft
        grid.rulerY = e.target.scrollTop
        stage.update()
      }

      this.root.oncontextmenu = e => {
        e.preventDefault()
      }
    })

    selectedNoteIdStore.on("change", () => {
      noteContainer.children.forEach(c => {
        if (c instanceof NoteView) {
          c.selected = selectedNoteIdStore.includes(c.noteId)
        }
      })
    })

    this.on("update", () => {
      if (stage == null) {
        return
      }

      mouseHandler = mouseHandlers[this.mouseMode]

      const maxNoteX = Math.max(500, this.notes != null && this.notes.length > 0 ? 
        Math.max.apply(null, (this.notes.map(n => n.x + n.width))) : 0)

      this.containerWidth = Math.ceil(maxNoteX) + KEY_WIDTH
      this.noteCanvas.width = this.containerWidth
      this.noteCanvas.height = this.containerHeight

      this.notes.forEach(note => {
        let rect = _.find(noteContainer.children, c => c.noteId == note.id)
        if (!rect) {
          rect = new NoteView()
          rect.noteId = note.id
          noteContainer.addChild(rect)
        }
        rect.x = note.x
        rect.y = note.y
        rect.selected = selectedNoteIdStore.includes(note.id)
        rect.setSize(note.width, quantizer.unitY)
      })

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
    .container {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .note {
      height: 30px;
      position: absolute;
      background: -webkit-linear-gradient(top, #5867FA, #3e4eee);
      box-sizing: border-box;
      border: 1px solid rgb(88, 103, 250);
    }

    .note.selected {
      background: rgb(0, 0, 0);
    }

    .selection {
      position: absolute;
      border: 3px solid rgb(0, 0, 0);
      box-sizing: border-box;
    }

    .noteCanvas {
      position: absolute;
      top: 0;
      left: 0;
    }

  </style>
</piano-roll>

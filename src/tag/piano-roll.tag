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
  mode: <Number> 0: 鉛筆, 1: 範囲選択
  onCreateNote: <Function(bounds)> 
  onResizeNote: <Function(noteId, bounds)>
  onClickNote: <Function(noteId)>
  onSelectNotes: <Function(noteIds)>
  onMoveNotes : <Function(noteIds, movement)>
  onClickNotes <Function(noteIds, mouseEvent)>
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

    const selectedNoteIdStore = []
    riot.observable(selectedNoteIdStore)

    var stage, noteContainer, mouseHandler, selectionView

    this.clearNotes = () => {
      const children = noteContainer.children.slice() // copy
      noteContainer.removeAllChildren()
      children.filter(c => !(c instanceof NoteView)).forEach(c => {
        noteContainer.addChild(c)
      })
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

      const grid = new PianoGridView(quantizer.unitY, 127, RULER_HEIGHT, coordConverter, 1000)
      grid.x = KEY_WIDTH
      stage.addChild(grid)

      noteContainer = new createjs.Container
      noteContainer.x = KEY_WIDTH
      noteContainer.y = RULER_HEIGHT
      stage.addChild(noteContainer)

      selectionView = new SelectionView
      selectionView.setSize(0, 0)
      noteContainer.addChild(selectionView)

      mouseHandler = [ 
        new PencilMouseHandler(noteContainer, opts),
        new SelectionMouseHandler(noteContainer, selectionView, opts, selectedNoteIdStore)
      ][opts.mode]
      this.mouseHandler = mouseHandler

      const keys = new PianoKeysView(KEY_WIDTH, quantizer.unitY, 127)
      keys.zIndex = 500
      keys.y = RULER_HEIGHT
      stage.addChild(keys)

      stage.update()

      this.root.onscroll = e => {
        keys.x = e.target.scrollLeft
        //grid.y = e.target.scrollTop
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

      const maxNoteX = Math.max(500, this.notes != null && this.notes.length > 0 ? 
        Math.max.apply(null, (this.notes.map(n => n.x + n.width))) : 0)

      this.containerWidth = Math.ceil(maxNoteX) + KEY_WIDTH
      this.noteCanvas.width = this.containerWidth
      this.noteCanvas.height = this.containerHeight

      this.notes.forEach(note => {
        let rect = _.find(noteContainer.children, c => c instanceof NoteView && c.noteId == note.id)
        if (!rect) {
          rect = new NoteView()
          rect.noteId = note.id

          rect.on("mousedown", function(e) {
            mouseHandler.onMouseDownNote(e)
            e.stopPropagation()
            stage.update()
          })

          rect.on("pressmove", function(e) {
            mouseHandler.onPressMoveNote(e)
            stage.update()
          })

          rect.on("mouseup", function(e) {
            mouseHandler.onMouseUpNote(e)
            stage.update()
          })

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

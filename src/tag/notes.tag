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
  mode: <Number> 0: 鉛筆, 1: 範囲選択
  onCreateNote: <Function(bounds)> 
  onResizeNote: <Function(noteId, bounds)>
  onClickNote: <Function(noteId)>
  onSelectNotes: <Function(notes)>
  onMoveNotes : <Function(notes, movement)>
  onClickNotes <Function(notes, mouseEvent)>
}
-->
<notes>
  <div class="container" name="container"
    style="width: { containerWidth }px;">
  <!--<div class="container" name="container"
    onmouseup={ mouseHandler.onMouseUp }
    onmousemove={ mouseHandler.onMouseMove }
    onmousedown={ mouseHandler.onMouseDown }
    style="width: { containerWidth }px;">
    <div 
      each={ notes } 
      no-reorder
      class={"note": true, "selected": selected}
      style="left: { x }px; top: { y }px; width: { width }px;" 
      onmousedown={ mouseHandler.onMouseDownNote }
      onmouseover={ mouseHandler.updateCursor }
      onmousemove={ mouseHandler.updateCursor }
      onmouseleave={ mouseHandler.resetCursor }>
      </div>
    <div
      class="selection"
      each={ selections } 
      style="left: { x }px; top: { y }px; width: { width }px; height: { height }px;"
      if={ !hidden } >
      </div>-->
    <canvas class="noteCanvas" width="10000" height="5000"></canvas>
  </div>

  <script type="text/javascript">
    selection = {hidden: true}
    this.selections = [selection]
    this.notes = opts.notes

    var mouseHandler = [ 
      new PencilMouseHandler(this.container, opts),
      new SelectionMouseHandler(this.container, opts)
    ][opts.mode]
    this.mouseHandler = mouseHandler

    var stage

    this.on("mount", () => {
      stage = new createjs.Stage(document.querySelector(".noteCanvas"))
      document.noteStage = stage
      const keys = new PianoKeysView(100, quantizer.unitY, 127)
      stage.addChild(keys)
      stage.update()
    })

    this.on("update", () => {
      this.containerWidth = Math.max(500, this.notes != null && this.notes.length > 0 ? 
        Math.max.apply(null, (this.notes.map(n => n.x + n.width))) : 0)

      if (stage == null) {
        return
      }
      this.notes.forEach(note => {
        var rect = _.find(stage.children, r => r.noteId == note.id)
        if (!rect) {
          rect = new createjs.Shape()
          rect.noteId = note.id

          rect.on("mousedown", function(e) {
            mouseHandler.onMouseDownNote(e)
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

          stage.addChild(rect)
        }
        rect.graphics.clear().beginFill("DeepSkyBlue").rect(0, 0, note.width, 30)
        rect.x = note.x
        rect.y = note.y
        rect.setBounds(note.x, note.y, note.width, quantizer.unitY)
      })
      stage.update()
    })

    this.container.oncontextmenu = e => {
      e.preventDefault()
    }
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
</notes>

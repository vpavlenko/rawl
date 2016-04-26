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
  onResizeNote: <Function(note, bounds)>
  onClickNote: <Function(note)>
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

    var stage

    this.on("mount", () => {
      stage = new createjs.Stage(document.querySelector(".noteCanvas"))
      const circle = new createjs.Shape()
      circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 50)
      circle.x = 300
      circle.y = 300
      stage.addChild(circle)
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
            this.mouseOffset = {
              x: this.x - e.stageX,
              y: this.y - e.stageY
            }
          })

          rect.on("pressmove", function(e) {
            this.dragged = true
            this.x = e.stageX + this.mouseOffset.x
            this.y = e.stageY + this.mouseOffset.y
            stage.update()
          })

          rect.on("click", function(e) {
            if (this.dragged) return
            this.dragged = false
          })

          stage.addChild(rect)
        }
        rect.graphics.clear().beginFill("DeepSkyBlue").rect(0, 0, note.width, 30)
        rect.x = note.x
        rect.y = note.y
      })
      stage.update()
    })

    class MouseHandler {
      constructor(container) {
        this.container = container
        this.startLocation = {x: undefined, y: undefined}
        this.isMouseDown = false
        this.isMouseMoved = false
      }

      getLocation(e) {
        const b = this.container.getBoundingClientRect()
        return {
          x: e.clientX - b.left,
          y: e.clientY - b.top
        }
      }

      onMouseDown(e) {
        this.startLocation = this.getLocation(e)
        this.isMouseDown = true
        this.isMouseMoved = false
      }

      onMouseMove(e) { 
        this.isMouseMoved = true
      }

      onMouseUp(e) {
        this.isMouseDown = false
        this.isMouseMoved = false
      }

      onMouseDownNote(e) {}
      resetCursor(e) {}
      updateCursor(e) {}
    }

    const DRAG_POSITION = {
      LEFT_EDGE: 0,
      CENTER: 1,
      RIGHT_EDGE: 2
    }

    class PencilMouseHandler extends MouseHandler {
      constructor(container) {
        super(container)
        bindAllMethods(this)
        this.startEvent = null
        this.startItem = null
      }

      resetCursor() {
        this.container.style.cursor = "default"
      }

      onMouseDownNote(e) {
        this.startItem = e.item
        this.dragOffset = { x: e.layerX, y: e.layerY }
        this.dragPosition = this.getDragPosition(e)
      }

      onMouseDown(e) { 
        super.onMouseDown(e) 
        if (e.target == this.container) {
          const loc = this.getLocation(e)
          opts.onCreateNote({
            x: quantizer.floorX(loc.x),
            y: quantizer.floorY(loc.y),
            width: quantizer.unitX
          })
        }
      }

      onMouseMove(e) {
        super.onMouseMove(e)
        const item = this.startItem
        if (item == null) return

        const bounds = {
          x: item.x,
          y: item.y,
          width: item.width
        }

        const loc = this.getLocation(e)
        const qx = quantizer.roundX(loc.x)

        switch (this.dragPosition) {
          case DRAG_POSITION.LEFT_EDGE:
          // 右端を固定して長さを変更
          bounds.width = item.width + item.x - qx 
          bounds.x = qx
          break
          case DRAG_POSITION.RIGHT_EDGE:
          // 左端を固定して長さを変更
          bounds.width = qx - bounds.x
          break
          case DRAG_POSITION.CENTER:
          // 移動
          bounds.x = quantizer.roundX(loc.x - this.dragOffset.x)
          bounds.y = quantizer.roundY(loc.y - this.dragOffset.y) 
          break
        }

        opts.onResizeNote(item, bounds)
      }

      onMouseUp(e) {
        if (this.startItem != null && !this.isMouseMoved) {
          opts.onClickNote(this.startItem)
        }
        this.startItem = null
        this.resetCursor()
        super.onMouseUp(e)
      }

      getDragPosition(e) {
        if (e.layerX <= 8) return DRAG_POSITION.LEFT_EDGE
        if (e.target.clientWidth - e.layerX <= 8) return DRAG_POSITION.RIGHT_EDGE
        return DRAG_POSITION.CENTER
      }

      updateCursor(e) {
        if (this.isMouseDown) return
        switch (this.getDragPosition(e)) {
          case DRAG_POSITION.LEFT_EDGE:
          case DRAG_POSITION.RIGHT_EDGE: 
          this.container.style.cursor = "w-resize"
          break
          default:
          this.container.style.cursor = "move"
          break
        }
      }
    }

    class SelectionMouseHandler extends MouseHandler {
      constructor(container) {
        super(container)
        bindAllMethods(this)
        this.container = container
      }

      onMouseDown(e) { 
        super.onMouseDown(e)
        this.start = this.getLocation(e)
        const clicked = new Rect(selection).containsPoint(this.start)
        if (!clicked) {
          // 選択範囲外でクリックした場合は選択範囲をリセット
          Object.assign(selection, {
            x: this.start.x,
            y: this.start.y,
            width: 0,
            height: 0,
            fixed: false,
            hidden: true
          })
          opts.onSelectNotes([])
        }

        this.dragOffset = { x: this.start.x - selection.x, y: this.start.y - selection.y }
      }

      onMouseMove(e) { 
        super.onMouseMove(e)
        if (!this.isMouseDown) return
        selection.hidden = false

        const loc = this.getLocation(e)
        if (selection.fixed) {
          // 確定済みの選択範囲をドラッグした場合はノートと選択範囲を移動
          const qx = quantizer.roundX(loc.x - this.dragOffset.x)
          const qy = quantizer.roundY(loc.y - this.dragOffset.y)

          opts.onMoveNotes(selection.notes, {
            x: qx - selection.x,
            y: qy - selection.y
          })
          selection.x = qx
          selection.y = qy
        } else {
          // 選択範囲の変形
          const rect = Rect.fromPoints(this.start, loc)
          selection.x = quantizer.roundX(rect.x)
          selection.y = quantizer.roundY(rect.y)
          selection.width = (quantizer.roundX(rect.x + rect.width) - selection.x) || quantizer.unitX
          selection.height = (quantizer.roundY(rect.y + rect.height) - selection.y) || quantizer.unitY
        }
      }

      onMouseUp(e) { 
        if (!selection.fixed) {
          selection.fixed = true
          selection.notes = opts.notes.filter(n => new Rect(selection).containsPoint(n))
          opts.onSelectNotes(selection.notes)
        } else if (!this.isMouseMoved) {
          opts.onClickNotes(selection.notes, e)
        }
        super.onMouseUp(e)
      }
    }

    this.mouseHandler = [ 
      new PencilMouseHandler(this.container),
      new SelectionMouseHandler(this.container)
    ][opts.mode]

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

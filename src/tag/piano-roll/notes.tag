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
  onResizeNote: <Function(note, bounds)>
  onClickNote: <Function(note)>
  onSelectNotes: <Function(notes)>
  onMoveNotes : <Function(notes, movement)>
  onClickNotes <Function(notes, mouseEvent)>
}
-->
<notes>
  <div class="container" name="container"
    onmouseup={ mouseHandler.onMouseUp }
    onmousemove={ mouseHandler.onMouseMove }
    onmousedown={ mouseHandler.onMouseDown }>
    <div 
      each={ notes } 
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
      hide={ hidden } >
      </div>
  </div>

  <script>
    selection = []
    @selections = [selection]

    class MouseHandler
      constructor: (container) ->
        @container = container
        @startLocation = {x: undefined, y: undefined}
        @isMouseDown = false
        @isMouseMoved = false

      getLocation: (e) =>
        b = @container.getBoundingClientRect()
        {
          x: e.clientX - b.left
          y: e.clientY - b.top
        }

      onMouseDown: (e) => 
        @startLocation = @getLocation e
        @isMouseDown = true

      onMouseMove: (e) => 
        @isMouseMoved = true

      onMouseUp: (e) =>
        @isMouseDown = false

      onMouseDownNote: (e) => undefined
      resetCursor: (e) => undefined
      updateCursor: (e) => undefined

    DRAG_POSITION =
      LEFT_EDGE: 0 
      CENTER: 1
      RIGHT_EDGE: 2

    class PencilMouseHandler extends MouseHandler
      constructor: (container) ->
        super(container)
        @startEvent = null
        @startItem = null
        @position = 

      resetCursor: => 
        @container.style.cursor = "default"

      onMouseDownNote: (e) =>
        @addEdgeFlags e
        @startEvent = e
        @startItem = e.item
        @dragPosition = @getDragPosition e

      onMouseUp: (e) => 
        super e
        if @startItem? and not @isMouseMoved
          opts.onClickNote @startItem
        @startItem = null
        @resetCursor()

      onMouseMove: (e) =>
        super e
        return unless @startItem?

        bounds =
          x: e.item.x
          y: e.item.y
          width: e.item.width
          height: e.item.height

        loc = @getLocation e

        if @isLeftEdge e
          # 右端を固定して長さを変更
          bounds.x = loc.x
          bounds.width -= @movement.x
        else if @isRightEdge e
          # 左端を固定して長さを変更
          bounds.width = loc.x - bounds.x
        else 
          # 移動
          bounds.x += e.movementX
          bounds.y += e.movementY

        opts.onResizeNote e.item, bounds

      getDragPosition: (e) ->
        if e.layerX <= 8 then return DRAG_POSITION.LEFT_EDGE
        if e.target.clientWidth - e.layerX <= 8 then return DRAG_POSITION.RIGHT_EDGE
        DRAG_POSITION.CENTER

      updateCursor: (e) =>
        return if @dragging
        @addEdgeFlags e
        @container.style.cursor = 
          if e.isLeftEdge or e.isRightEdge then "w-resize" else "move"

    class SelectionMouseHandler extends MouseHandler
      constructor: (container) ->
        super(container)
        @container = container
        @dragging = false
        @moved = false

      onMouseDown: (e) => 
        super e
        @moved = false
        b = @container.getBoundingClientRect()
        @start = 
          x: e.clientX - b.left
          y: e.clientY - b.top
        clicked = new Rect(selection).containsPoint @start
        selection.dragging = true
        unless clicked
          # 選択範囲外でクリックした場合は選択範囲をリセット
          extend selection, 
            x: @start.x
            y: @start.y
            width: 0
            height: 0
            fixed: false
            hidden: true

      onMouseMove: (e) => 
        super e
        return unless selection.dragging
        @moved = true
        selection.hidden = false

        items = []
        if selection.fixed and selection.dragging
          # 確定済みの選択範囲をドラッグした場合はノートの移動
          items = opts.notes.filter((n) => new Rect(selection).containsPoint(n))
          # 選択範囲も移動させる
          selection.x += e.movementX
          selection.y += e.movementY
        else
          # 選択範囲の変形
          b = @container.getBoundingClientRect()
          p =
            x: e.clientX - b.left
            y: e.clientY - b.top
          extend selection, Rect.fromPoints(@start, p)
          selection.hidden = false

        opts.onMoveNotes items, {
          x: e.movementX
          y: e.movementY
        }

      onMouseUp: (e) => 
        super e
        selection.dragging = false
        notes = opts.notes.filter((n) => new Rect(selection).containsPoint(n))
        unless selection.fixed
          selection.fixed = true
          opts.onSelectNotes notes
        else unless @moved
          opts.onClickNotes notes, e
        @moved = false

    @mouseHandler = switch opts.mode 
      when 0 then new PencilMouseHandler(@container)
      else new SelectionMouseHandler(@container)

    @container.oncontextmenu = (e) =>
      e.preventDefault()
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
    }

  </style>
</notes>

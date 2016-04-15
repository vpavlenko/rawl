<!--
opts = {
  notes: [
    {
      x: <Number> X 座標 (px)
      y: <Number> Y 座標 (px)
      width: <Number> 横幅 (px)
    }
  ],
  selections: [
    {
      x: <Number> X 座標 (px)
      y: <Number> Y 座標 (px)
      width: <Number> 横幅 (px)
      height: <Number> 高さ (px)
      fixed: <Bool>
      hidden: <Bool>
    }
  ],
  mode: <Number> 0: 鉛筆, 1: 範囲選択
  onResizeNote: <Function(note, bounds)>
  onClickNote: <Function(note)>
  onResizeSelection: <Function(selection, bounds, notes)>
  onClickSelection: <Function(selection, notes)>
  onClickOutsideSelection: <Function(position)>
  onStartDragNote: <Function> ノートのドラッグ開始時に呼ばれる 
  onDragNote: <Function> ノートのドラッグ中に呼ばれる Event#isRightEdge, isLeftEdge でノートの端にあるか取得できる
  onSelectNotes: <Function> 選択モードのときにノートが選択された時に呼ばれる items に対象のノートが入っている
  onMoveSelectedNotes: <Function> 選択モードのときに選択範囲がドラッグされた時に呼ばれる items に範囲内のノートが入っている
  onClickSelectedNotes: <Function> 選択モードのときに選択範囲がクリックされた時に呼ばれる　items に範囲内のノートが入っている
}
-->
<notes>
  <div class="container" name="container"
    onmouseup={ mouseHandler.onMouseUpContainer }
    onmousemove={ mouseHandler.onMouseMoveContainer }
    onmousedown={ mouseHandler.onMouseDownContainer }>
    <div 
      each={ notes } 
      class={"note": true, "selected": selected}
      style="left: { x }px; top: { y }px; width: { width }px;" 
      onmousedown={ mouseHandler.onMouseDown }
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

  <script type="text/coffeescript">
    class MouseHandler
      onMouseUpContainer: (e) => undefined
      onMouseMoveContainer: (e) => undefined
      onMouseDownContainer: (e) => undefined
      onMouseDown: (e) => undefined
      resetCursor: (e) => undefined
      updateCursor: (e) => undefined

    class PencilMouseHandler extends MouseHandler
      constructor: (container) ->
        @dragging = false
        @startEvent = null
        @startItem = null
        @container = container

      resetCursor: => 
        @container.style.cursor = "default"

      onMouseDown: (e) =>
        @addEdgeFlags e
        @startEvent = e
        @startItem = e.item

      onMouseUpContainer: (e) => 
        if @startItem? and not @dragging
          opts.onClickNote 
            original: e
            item: @startItem
        @startItem = null
        @dragging = false
        @resetCursor()

      onMouseMoveContainer: (e) =>
        return unless @startItem?
        ev = 
          original: e
          target: @startEvent.target
          item: @startItem
          isRightEdge: @startEvent.isRightEdge
          isLeftEdge: @startEvent.isLeftEdge

        unless @dragging
          @dragging = true
          @onStartDragNote ev
        else
          @onDragNote ev

      onStartDragNote: (e) =>
        @movement = {x: 0, y: 0}

      onDragNote: (e) =>
        @movement.x += e.original.movementX
        @movement.y += e.original.movementY
        bounds =
          x: e.item.x
          y: e.item.y
          width: e.item.width
          height: e.item.height

        if e.isLeftEdge
          # 右端を固定して長さを変更
          bounds.x += @movement.x
          bounds.width -= @movement.x
        else if e.isRightEdge
          # 左端を固定して長さを変更
          bounds.width += e.original.movementX
        else 
          # 移動
          bounds.x += e.original.movementX
          bounds.y += e.original.movementY

        opts.onResizeNote e.item, bounds

      addEdgeFlags: (e) =>
        e.isLeftEdge = e.layerX <= 8
        e.isRightEdge = e.target.clientWidth - e.layerX <= 8

      updateCursor: (e) =>
        return if @dragging
        @addEdgeFlags e
        @container.style.cursor = 
          if e.isLeftEdge or e.isRightEdge then "w-resize" else "move"

    class Rectangle
      constructor: (start, end) ->
        @start = start
        @end = end
      left: => Math.min(@start.x, @end.x)
      top: => Math.min(@start.y, @end.y)
      right: => Math.max(@start.x, @end.x)
      bottom: => Math.max(@start.y, @end.y)
      width: => @right() - @left()
      height: => @bottom() - @top()
      copyTo: (obj) =>
        obj.x = @left()
        obj.y = @top()
        obj.width = @width()
        obj.height = @height()

    rectContainsPoint = (rect, point) ->
      point.x >= rect.x and point.x <= rect.x + rect.width and 
      point.y >= rect.y and point.y <= rect.y + rect.height

    class SelectionMouseHandler extends MouseHandler
      constructor: (container) ->
        @container = container
        @dragging = false
        @moved = false

      onMouseDownContainer: (e) => 
        @dragging = true
        @moved = false
        b = @container.getBoundingClientRect()
        @start = 
          x: e.clientX - b.left
          y: e.clientY - b.top
        if opts.selections.length is 0 or not rectContainsPoint opts.selections[0], @start
          # 選択範囲外でクリックした場合は選択範囲を作成
          opts.onClickOutsideSelection @start
          @movement = {x: 0, y: 0}

      onMouseMoveContainer: (e) => 
        return unless @dragging 
        @moved = true
        sel = opts.selections[0]
        @movement.x += e.movementX
        @movement.y += e.movementY
        bounds =
          x: sel.x
          y: sel.y
          width: sel.width
          height: sel.height

        items = []
        if sel.fixed
          # 確定済みの選択範囲をドラッグした場合はノートの移動
          items = opts.notes.filter((n) => rectContainsPoint(sel, n))
          # 選択範囲も移動させる
          bounds.x += @movement.x
          bounds.y += @movement.y
        else
          # 選択範囲の変形
          b = @container.getBoundingClientRect()
          rect = new Rectangle
            x: @start.x
            y: @start.y
          ,
            x: e.clientX - b.left
            y: e.clientY - b.top
          rect.copyTo bounds
          sel.hidden = false

        opts.onResizeSelection sel, bounds, items
        console.log sel, bounds

      onMouseUpContainer: (e) => 
        sel = opts.selections[0]
        items = opts.notes.filter((n) => rectContainsPoint(sel, n))
        unless sel.fixed
          sel.fixed = true
          opts.onSelectNotes(e)
        else unless @moved
          opts.onClickSelectedNotes(e)
        @dragging = false
        @moved = false

      resetCursor: (e) => undefined
      updateCursor: (e) => undefined

    @mouseHandler = switch opts.mode 
      when 0 then new PencilMouseHandler(@container)
      else new SelectionMouseHandler(@container)

    console.log opts.mode

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

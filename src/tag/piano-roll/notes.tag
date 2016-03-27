<!--
opts = {
  notes: [
    {
      x: <Number> X 座標 (px)
      y: <Number> Y 座標 (px)
      width: <Number> 横幅 (px)
    }
  ],
  onClickNote: <Function> Event#item で要素を取得
  onStartDragNote: <Function> ノートのドラッグ開始時に呼ばれる 
  onDragNote: <Function> ノートのドラッグ中に呼ばれる Event#isRightEdge, isLeftEdge でノートの端にあるか取得できる
  onSelectNotes: <Function> 選択モードのときにノートが選択された時に呼ばれる items に対象のノートの情報が入っている
}
-->
<notes>
  <div class="container" name="container"
    onmouseup={ mouseHandler.onMouseUpContainer }
    onmousemove={ mouseHandler.onMouseMoveContainer }
    onmousedown={ mouseHandler.onMouseDownContainer }>
    <div 
      each={ opts.notes } 
      class="note {selected ? "selected" : ""}"
      style="left: { x }px; top: { y }px; width: { width }px;" 
      onmousedown={ mouseHandler.onMouseDown }
      onmouseover={ mouseHandler.updateCursor }
      onmousemove={ mouseHandler.updateCursor }
      onmouseleave={ mouseHandler.resetCursor }>
      </div>
    <div 
      class="selection"
      each={ selections } 
      style="left: { left() }px; top: { top() }px; width: { width() }px; height: { height() }px;"
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
        @container = container

      resetCursor: => 
        @container.style.cursor = "default"

      onMouseDown: (e) =>
        @addEdgeFlags e
        @startEvent = e 

      onMouseUpContainer: (e) => 
        if @startEvent? and not @dragging
          opts.onClickNote 
            original: e
            target: @startEvent.target
            item: @startEvent.item
        @startEvent = null
        @dragging = false
        @resetCursor()

      onMouseMoveContainer: (e) =>
        if @startEvent?
          ev = 
            original: e
            target: @startEvent.target
            item: @startEvent.item
            isRightEdge: @startEvent.isRightEdge
            isLeftEdge: @startEvent.isLeftEdge

          unless @dragging
            @dragging = true
            opts.onStartDragNote ev
          else
            opts.onDragNote ev

      addEdgeFlags: (e) =>
        e.isLeftEdge = e.layerX <= 8
        e.isRightEdge = e.target.clientWidth - e.layerX <= 8

      updateCursor: (e) =>
        return if @dragging
        @addEdgeFlags e
        @container.style.cursor = 
          if e.isLeftEdge or e.isRightEdge then "w-resize" else "move"

    class Selection
      constructor: (startX = 0, startY = 0) ->
        @startX = startX
        @startY = startY
        @endX = startX
        @endY = startY
        @hidden = true
      left: => Math.min(@startX, @endX)
      top: => Math.min(@startY, @endY)
      right: => Math.max(@startX, @endX)
      bottom: => Math.max(@startY, @endY)
      width: => @right() - @left()
      height: => @bottom() - @top()
      contains: (point) => 
        point.x >= @left() and point.x <= @right() and 
        point.y >= @top() and point.y <= @bottom()

    class SelectionMouseHandler extends MouseHandler
      constructor: (container, selections) ->
        @dragging = false
        @selections = selections
        @container = container

      onMouseDownContainer: (e) => 
        @dragging = true
        b = @container.getBoundingClientRect()
        @selections[0] = new Selection(e.clientX - b.left, e.clientY - b.top)

      onMouseMoveContainer: (e) => 
        return unless @dragging
        b = @container.getBoundingClientRect()
        sel = @selections[0]
        sel.endX = e.clientX - b.left
        sel.endY = e.clientY - b.top
        sel.hidden = false

      onMouseUpContainer: (e) => 
        @dragging = false
        e.items = opts.notes.filter((n) => @selections[0].contains(n))
        opts.onSelectNotes(e)

      resetCursor: (e) => undefined
      updateCursor: (e) => undefined

    @selections = [new Selection()]
    @mouseHandler = new SelectionMouseHandler(@container, @selections)
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

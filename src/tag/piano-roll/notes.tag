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
  onSelectNotes: <Function> 選択モードのときにノートが選択された時に呼ばれる items に対象のノートが入っている
  onMoveSelectedNotes: <Function> 選択モードのときに選択範囲がドラッグされた時に呼ばれる items に範囲内のノートが入っている
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
    <div 
      class="context-menu" 
      style="left: { menu.x }px; top: { menu.y }px; display: { menu.hidden ? "none" : "block"};">
      <ul>
          <li each={ menu.items }>{ title }</li>
      </ul>
    </div>
  </div>

  <script type="text/coffeescript">
    @menu = {}
    @menu.hidden = true
    @menu.items = [
      title: "item1"
    , 
      title: "aaa"
    , 
      title: "hoge"
    ]

    class MouseHandler
      onMouseUpContainer: (e) => undefined
      onMouseMoveContainer: (e) => undefined
      onMouseDownContainer: (e) => undefined
      onMouseDown: (e) => undefined
      resetCursor: (e) => undefined
      updateCursor: (e) => undefined

    class PencilMouseHandler extends MouseHandler
      constructor: (container, menu) ->
        @menu = menu
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
        @menu.hidden = true

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
        @fixed = false # マウスクリックを離した後に true
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
      constructor: (container, selections, menu) ->
        @menu = menu
        @selections = selections
        @container = container
        @dragging = false

      onMouseDownContainer: (e) => 
        console.log "a"
        @dragging = true
        b = @container.getBoundingClientRect()
        p = {x: e.clientX - b.left, y: e.clientY - b.top}
        unless @selections[0].contains(p)
          # 選択範囲外でクリックした場合は選択範囲を作成
          @selections[0] = new Selection(p.x, p.y)

      onMouseMoveContainer: (e) => 
        return unless @dragging 
        sel = @selections[0]
        if sel.fixed
          # 確定済みの選択範囲をドラッグした場合はノートの移動
          e.items = opts.notes.filter((n) => @selections[0].contains(n))
          opts.onMoveSelectedNotes(e)
          # 選択範囲も移動させる
          sel.startX += e.movementX
          sel.startY += e.movementY
          sel.endX += e.movementX
          sel.endY += e.movementY
        else
          # 選択範囲の変形
          b = @container.getBoundingClientRect()
          sel.endX = e.clientX - b.left
          sel.endY = e.clientY - b.top
          sel.hidden = false

      onMouseUpContainer: (e) => 
        @dragging = false
        e.items = opts.notes.filter((n) => @selections[0].contains(n))
        @selections[0].fixed = true
        opts.onSelectNotes(e)
        @menu.hidden = true

      resetCursor: (e) => undefined
      updateCursor: (e) => undefined

    @selections = [new Selection(0, 0)]
    @mouseHandler = new SelectionMouseHandler(@container, @selections, @menu)

    @container.oncontextmenu = (e) =>
      e.preventDefault()
      @menu.hidden = false
      b = @container.getBoundingClientRect()
      @menu.x = e.pageX - b.left
      @menu.y = e.pageY - b.top
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

    .context-menu ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .context-menu {
      position: absolute; 
      background: white;
      border: solid 1px #CCC;
    }

    .context-menu ul li {
      padding: 0.3em 0.5em;
      margin: 0;
    }

  </style>
</notes>

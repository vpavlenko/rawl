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
}
-->
<notes>
  <div class="container" name="container"
    onmouseup={ onMouseUp }
    onmousemove={ onMouseMove }>
    <div 
      each={ opts.notes } 
      class="note"
      style="left: { x }px; top: { y }px; width: { width }px;" 
      onmousedown={ onMouseDown }
      onmouseover={ updateCursor }
      onmousemove={ updateCursor }
      onmouseleave={ resetCursor }>
      </div>
  </div>

  <script type="text/coffeescript">
    dragging = false
    startEvent = null

    @resetCursor = => 
      @container.style.cursor = "default"

    @onMouseDown = (e) =>
      addEdgeFlags e
      startEvent = e 

    @onMouseUp = (e) => 
      if startEvent? and not dragging
        opts.onClickNote 
          original: e
          target: startEvent.target
          item: startEvent.item
      startEvent = null
      dragging = false
      @resetCursor()

    @onMouseMove = (e) =>
      if startEvent?
        ev = 
          original: e
          target: startEvent.target
          item: startEvent.item
          isRightEdge: startEvent.isRightEdge
          isLeftEdge: startEvent.isLeftEdge

        unless dragging
          dragging = true
          opts.onStartDragNote ev
        else
          opts.onDragNote ev

    addEdgeFlags = (e) =>
      e.isLeftEdge = e.layerX <= 8
      e.isRightEdge = e.target.clientWidth - e.layerX <= 8

    @updateCursor = (e) =>
      return if dragging
      addEdgeFlags e
      @container.style.cursor = 
        if e.isLeftEdge or e.isRightEdge then "w-resize" else "move"
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
    }
  
  </style>
</notes>

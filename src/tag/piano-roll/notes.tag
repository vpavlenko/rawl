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
    target = null
    item = null
    dragging = false
    @resetCursor = => 
      @container.style.cursor = "default"
    @onMouseDown = (e) => 
      target = e.target
      item = e.item
    @onMouseUp = (e) => 
      if target? and not dragging
        opts.onClickNote 
          original: e
          target: target
          item: item
      target = null
      dragging = false
      @resetCursor()
    @onMouseMove = (e) =>
      if target?
        ev = 
          original: e
          target: target
          item: item

        unless dragging
          dragging = true
          opts.onStartDragNote ev
        else
          opts.onDragNote ev

    @updateCursor = (e) =>
      return if dragging
      isLeftEdge = e.layerX <= 8
      isRightEdge = e.target.clientWidth - e.layerX <= 8
      @container.style.cursor = 
        if isLeftEdge or isRightEdge then "w-resize" else "move"
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

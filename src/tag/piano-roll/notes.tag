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
  <div class="container">
    <div 
      each={ opts.notes } 
      class="note" 
      style="left: { x }px; top: { y }px; width: { width }px;" 
      onclick={ parent.opts.onClickNote }
      onmouseover={ updateCursor }
      onmousemove={ updateCursor }
      ></div>
  </div>

  <script type="text/coffeescript">
    @updateCursor = (e) ->
      isLeftEdge = e.layerX <= 8
      isRightEdge = e.target.clientWidth - e.layerX <= 8
      e.target.style.cursor = 
        if isLeftEdge or isRightEdge then "w-resize" else "move"
  </script>

  <style scoped>
    .container {
      position: relative;
    }

    .note {
      height: 30px;
      position: absolute;
      background: -webkit-linear-gradient(top, #5867FA, #3e4eee);
    }
  
  </style>
</notes>

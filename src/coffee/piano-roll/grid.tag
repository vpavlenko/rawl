<!--
opts = {
  numberOfKeys: <Number> 鍵盤の数
  lines: [
    {
      x: <Number> 縦線の位置 (px)
      color: <String> 縦線の色
    }
  ]
}
-->
<grid>
  <div class="container">
    <div class="vlines">
      <div each={ opts.lines } class="vline" style="left: { x - 1 }px; background-color: { color }"></div>
    </div>
    <div class="hlines">
      <div each={ hlines } class="{className}"></div>
    </div>
  </div>

  <script type="text/coffeescript">
    classes = (keyNum) ->
      for i in [0..keyNum]
        className = "hline"
        className += " bold" if i % 12 is 0 or i % 12 is 5
        {className: className}

    this.hlines = classes(opts.numberOfKeys)
  </script>

  <style scoped>
    .container {
      position: relative;
    }

    .hline {
      height: 30px;
      border-top: 1px solid rgb(222, 222, 222);
      box-sizing: border-box;
    }

    .hline.bold {
      border-top-color: rgb(160, 160, 160);
    }

    .vlines {
      position: absolute;
      top: 0;
      width: 100%;
      height: 100%;
    }

    .vline {
      width: 1px;
      height: 100%;
      position: absolute;
      top: 0;
    }
  </style>
</grid>

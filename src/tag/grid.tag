<!--
opts = {
  cursorX: <Number> 再生位置を示す縦線の位置 (px)
  lines: [
    {
      x: <Number> 縦線の位置 (px)
      color: <String> 縦線の色
    }
  ]
}
-->
<grid>
  <div class="container" style="width: { width }px;">
      <div class="vlines">
        <div each={ opts.lines } class="vline" style="left: { x }px; background-color: { color }"></div>
      </div>
      <div class="cursor" style="left: { opts.cursorX }px;"></div>
    </div>
  </div>

  <script type="text/javascript">
    const maxX = (opts.lines.reduce((a, b) => ({ x: Math.max(a.x, b.x) }))).x
    this.width = maxX + 1
  </script>

  <style scoped>
    .container {
      position: relative;
      height: 100%;
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

    .cursor {
      position: absolute;
      top: 0;
      width: 1px;
      height: 100%;
      background-color: rgb(255, 0, 0);
    }
  </style>
</grid>

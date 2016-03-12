<!--
opts = {
  bars: [
    {
      length: <Number> 小節の横幅 (px)
      label: <String> 表示するタイトル
    }
  ]
}
-->
<ruler>
  <div class="bars" style="width: { width }px;">
    <div each={ opts.bars } class="bar" style="width: { length }px;">
      { label }
    </div>
  </div>

  <script type="text/coffeescript">
    @width = (opts.bars.map (a) -> a.length).reduce (a, b) -> a + b
  </script>

  <style scoped>
  .bar {
    float: left;
    border-left: 1px solid gray;
    height: 1.5em;
    padding-left: 0.25em;
    box-sizing: border-box;
  }

  .bars {
    clear: both;
    overflow: hidden;
  }
  </style>
</ruler>

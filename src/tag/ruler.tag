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

  <script type="text/javascript">
    this.width = (opts.bars.map(a => a.length)).reduce((a, b) => a + b)
  </script>

  <style scoped>
  .bar {
    float: left;
    border-left: 1px solid gray;
    padding-left: 0.25em;
    box-sizing: border-box;
    height: 100%;
  }

  .bars {
    clear: both;
    overflow: hidden;
    height: 100%;
  }
  </style>
</ruler>

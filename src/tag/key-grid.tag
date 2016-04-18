<!--
opts = {
  numberOfKeys: <Number> 鍵盤の数
}
-->
<key-grid>
  <div class="container">
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
  </style>
</key-grid>

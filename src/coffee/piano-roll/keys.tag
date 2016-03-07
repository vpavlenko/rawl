<!--
opts = {
  numberOfKeys: <Number> 鍵盤の数
}
必ず keys に CSS で横幅を設定すること
-->
<keys>
  <div each={ keys } class="{className}">
    <div class="inner"></div>
  </div>

  <script type="text/coffeescript">
    keyColors = ["white", "black", "white", "black", "white", "white", "black", "white", "black", "white", "black", "white"]
    keyClasses = (keyNum) ->
      for i in [0..keyNum]
        className = "key #{keyColors[i % keyColors.length]}"
        className += " bordered" if i % 12 is 5 or i % 12 is 0
        {className: className}

    this.keys = keyClasses(opts.numberOfKeys)
  </script>

  <style scoped>
    .key {
        position: relative;
        width: 100%;
        height: 30px;
        box-sizing: border-box;
    }

    .key.white:active {
        background-color: #3e4eee;
    }

    .key.black:active {
        background-color: rgba(62, 78, 238, 0.18);
    }
    .key.black:active>.inner {
        background-color: #3e4eee;
    }

    .key.black:active>.inner::after {
        background-color: rgba(0, 0, 0, 0.24);
    }

    .key.black>.inner {
        background-color: black;
        width: 64%;
        height: 100%;
    }

    .key.black>.inner::after {
        content: "";
        height: 1px;
        width: 36%;
        background-color: rgb(224, 224, 224);
        position: absolute;
        top: 50%;
        left: 64%;
    }

    .key.bordered {
        border-top: 1px solid rgb(190, 190, 190);
    }
  </style>
</keys>

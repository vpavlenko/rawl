<!--
opts = {
  items: [
    {
      title: <String> 表示するタイトル
      onClick: <Function> クリックされた時に呼ばれる
    }
  ],
  hidden: <Bool> 表示するか
  x: <Number> X 座標
  y: <Number> Y 座標
}
-->
<context-menu>
  <div 
    class="context-menu" 
    style="left: { x }px; top: { y }px; display: { hidden ? "none" : "block"};">
    <ul>
        <li each={ items } onclick={ onClick }>{ title }</li>
    </ul>
  </div>

  <script type="text/coffeescript">
  </script>

  <style scoped>
  .context-menu {
    position: absolute; 
    background: white;
    border: solid 1px #CCC;
  }

  .context-menu ul {
    margin: 0;
    padding: 0.2em 0;
    list-style: none;
  }

  .context-menu li {
    padding: 0.3em 1em;
    margin: 0;
    cursor: default;
  }

  .context-menu li:hover {
    background-color: #3e4eee;
    color: white;
  }
  </style>
</context-menu>

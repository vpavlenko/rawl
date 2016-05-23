<track-info>
  <ul>
    <li class="name"><input type="text" value="{ name }" placeholder="Track Name"></li>
    <li>
      <label>Instrument</label>
      <input type="text" value="{ instrument }">
    </li>
    <li>
      <label>Volume</label>
      <input type="text" value="{ volume }">
    </li>
    <li>
      <label>Pan</label>
      <input type="text" value="{ pan }">
    </li>
  </ul>

  <script type="text/javascript">
    "use strict"
  </script>
  <style scoped>
    li {
      border-bottom: 1px solid rgb(214, 214, 214);
    }
    li.name input {
      font-weight: bold;
      padding: 1em;
      font-size: 1.2em;
      width: 100%;
      box-sizing: border-box;
    }

    ul {
      list-style-type: none;
      padding: 0;
      margin: 0;
    }

    label {
      background: rgba(0, 0, 0, 0.07);
      display: inline-block;
      padding: 0.3em;
      width: 35%;
      height: 23px;
      box-sizing: border-box;
      margin: 0;
      float: left;
    }

    input[type="text"] {
      border: none;
      padding: 0;
      margin: 0;
      outline: 0;
      height: 23px;
      background: rgba(0, 0, 0, 0.03);
      width: 65%;
    }
  </style>
</track-info>
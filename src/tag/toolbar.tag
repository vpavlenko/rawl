<toolbar>
  <div class="container">
    <input type="file" accept=".mid,.midi" onchange={onChangeFile}></input>
    <button onclick={onClickSave}>Save</button>
    <button onclick={onClickBackward}>←</button>
    <button onclick={onClickStop}>■</button>
    <button onclick={onClickPlay}>▶</button>
    <button onclick={onClickForward}>→</button>
    <button onclick={onClickPencil}>✎</button>
    <button onclick={onClickSelection}>□</button>
    <button onclick={onClickScaleUp}><img src="images/iconmonstr-magnifier-7-16.png"></button>
    <button onclick={onClickScaleDown}><img src="images/iconmonstr-magnifier-8-16.png"></button>
    <riot-select name="trackSelect"></riot-select>
    <riot-select name="quantizeSelect"></riot-select>
  </div>

  <script type="text/javascript">
    "use strict"
    console.log(this)
  </script>
  <style scoped>
    .container {
      height: var(--header-height);
      box-sizing: border-box;
      border-bottom: 1px solid rgb(204, 204, 204);
      background: rgb(249, 249, 249);
      padding-top: 8px;
      padding-left: 1em;
    }

    .container button {
      width: 2em;
      height: 1.5em;
      padding: 0;
      vertical-align: top;
      font-size: 1.3em;
      -webkit-appearance: none;
      background: rgba(0, 0, 0, 0);
      border: none;
      cursor: pointer;
    }
    .container riot-select {
      margin-top: 2px;
      display: inline-block;
    }
  </style>
</toolbar>
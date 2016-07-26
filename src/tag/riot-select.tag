<riot-select>
  <div class="container">
    <select name="select">
      <option each={options} value={value} selected={selected}>{name}</option>
    </select>
  </div>

  <script type="text/javascript">
  "use strict"
  this.options = opts.options
  this.select.onchange = e => {
    const i = this.select.selectedIndex
    this.selectedIndex = i
    opts.onselect(this.options[i], i)
  }
  this.on("update", () => {
    this.selectedIndex = this.select.selectedIndex
  })
  </script>

  <style scoped>
    .container {
      position: relative;
      height: 100%;
    }
    select {
      background: var(--background-color);
      color: var(--text-color);
      -webkit-appearance: none;
      border-radius: 0;
      padding: 0 2.5em 0 1em;
      border: none;
      height: 100%;
    }
    option {
      color: var(--text-color);
    }
    .container::after {
      font-family: "Flat-UI-Icons";
      font-weight: normal;
      content: "\e603";
      position: absolute;
      top: 0.4em;
      right: 0.5em;
      display: inline-block;
      pointer-events: none;
    }
  </style>
</riot-select>

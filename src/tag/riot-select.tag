<riot-select>
  <select name="select">
    <option each={options} value={value} selected={selected}>{name}</option>
  </select>

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
    select {
      -webkit-appearance: none;
      padding: 0.4em 1em;
      border-radius: 0;
      background: white;
      border: none;
    }
    select::after {
      font-family: "Flat-UI-Icons";
      font-weight: normal;
      content: "\e603";
    }
  </style>
</riot-select>

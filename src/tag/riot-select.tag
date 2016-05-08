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
    opts.onSelect(opts.options[i], i)
  }
  this.on("update", () => {
    this.selectedIndex = this.select.selectedIndex
  })
  </script>
</riot-select>

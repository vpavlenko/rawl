<instrument-browser>
  <div class="container">
    <div class="left">
      <label>Categories</label>
      <select size="12" onchange={onChangeCategory}>
        <option each={name, id in categories} selected={parent.selectedCategoryId == id}>{name}</option>
      </select>
    </div>
    <div class="right">
      <label>Instruments</label>
      <select size="12" onchange={onChangeInstrument}>
        <option each={name, id in instruments} selected={parent.selectedInstrumentId == id}>{name}</option>
      </select>
    </div>
    <div class="footer">
      <button class="ok" onclick={onClickOK}>OK</button>
      <button class="cancel" onclick={opts.onClickCancel}>Cancel</button>
    </div>
  </div>

  <script>
    this.selectedCategoryId = this.opts.selectedCategoryId || 0
    this.selectedInstrumentId = this.opts.selectedInstrumentId || 0

    this.onClickOK = e => {
      opts.onClickOK({
        categoryId: this.selectedCategoryId,
        instrumentId: this.selectedInstrumentId
      })
    }
    this.onChangeCategory = e => {
      this.update({
        selectedCategoryId: e.target.selectedIndex
      })
    }
    
    this.onChangeInstrument = e => {
      this.update({
        selectedInstrumentId: e.target.selectedIndex
      })
    }

    this.on("update", () => {
      this.categories = Object.keys(GMMap)
      this.instruments = GMMap[Object.keys(GMMap)[this.selectedCategoryId]]
    })
  </script>

  <style scoped>
  .container {
    padding: 2em;
    overflow: hidden;
  }

  label {
    padding: 0.5em 1em;
    display: block;
  }

  select {
    overflow: auto;
  }

  .left {
    float: left;
  }

  .left select {
    width: 17em;
  }

  .right {
    float: left;
  }

  .right select {
    width: 17em;
  }

  option {
    padding: 0.5em 1em;
  }

  .footer {
    text-align: right;
  }

  button {
    -webkit-appearance: none;
    border: none;
    padding: 0.5em 1.5em;
    border-radius: 4px;
    margin-left: 1em;
    margin-top: 1em;
    cursor: pointer;
  }

  button:hover {
    opacity: 0.5;
  }

  button.ok {
    background: #3e4eee;
    color: white;
  }

  button.cancel {
    background: transparent;
    border: 1px solid currentColor;
    color: rgb(183, 183, 183);
  }
  </style>
</instrument-browser>

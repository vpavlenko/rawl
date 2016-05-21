<property-pane>
  <ul>
  <li>
    <label>Pitch</label>
    <input type="text" value="{ sections.pitch }" onchange={ onChangePitch }>
    <div>
      <button onclick={ () => onClickPitch(1) }>+1</button>
      <button onclick={ () => onClickPitch(-1) }>-1</button>
      <button onclick={ () => onClickPitch(12) }>Oct +1</button>
      <button onclick={ () => onClickPitch(-12) }>Oct -1</button>
      <button onclick={ onClickPitchRandomize }>R</button>
    </div>
  </li>

  <li>
    <label>Start</label>
    <input type="text" value="{ sections.start }" onchange={ onChangeStart }>
    <button>R</button>
  </li>

  <li>
    <label>Duration</label>
    <input type="text" value="{ sections.duration }" onchange={ onChangeDuration }>
    <button>R</button>
  </li>

  <li>
    <label>Velocity</label>
    <input type="text" value="{ sections.velocity }" onchange={ onChangeVelocity }>
    <button>R</button>
  </li>

  <li>
    <label>Align</label>
    <button>Left</button>
    <button>Right</button>
    <button>Top</button>
    <button>Bottom</button>
  </li>

  <li>
    <button>Quantize</button>
  </li>
  </ul>

  <script type="text/javascript">
    "use strict"

    this.notes = []
    this.sections = []

    function equalValue(arr, prop, func = (v) => v, elseValue = "<multiple values>") {
      const first = arr[0][prop]
      for (let item of arr) {
        if (item[prop] != first) {
          return elseValue
        }
      }
      return func(first)
    }

    this.on("update", () => {
      if (this.notes.length == 0) {
        return
      }
      this.sections.pitch = equalValue(this.notes, "noteNumber", noteNumberString)
      this.sections.start = equalValue(this.notes, "tick")
      this.sections.duration = equalValue(this.notes, "duration")
      this.sections.velocity = equalValue(this.notes, "velocity")
    })

    this.onChangePitch = (e) => {
      // TODO: support math syntax (*25, 3 + 5, 127/3...)
      // TODO: support note number string (C# 3, D4, ...)
      const val = parseInt(e.target.value)
      if (isNaN(val)) {
        // TODO: reset previous value
        return
      }
      const aVal = Math.min(127, Math.max(0, val))
      e.target.value = noteNumberString(aVal)
      this.opts.onChangePitch(this.notes, aVal)
    }

    this.onClickPitch = (inc) => {
      this.opts.onTransformNotes(this.notes, inc)
    }

    this.onClickPitchRandomize = () => {
      const width = 10
      this.opts.onTransformNotes(this.notes, Math.floor(Math.random() * width - width / 2))
    }

    this.onChangeStart = (e) => {

    }

    this.onChangeDuration = (e) => {

    }

    this.onChangeVelocity = (e) => {
      // TODO: support math syntax (*25, 3 + 5, 127/3...)
      // TODO: support %
      // TODO: support drag to change value
      const val = parseInt(e.target.value)
      if (isNaN(val)) {
        // TODO: reset previous value
        return
      }
      const aVal = Math.min(127, Math.max(0, val))
      e.target.value = aVal
      this.opts.onChangeVelocity(this.notes, aVal)
    }

  </script>
  <style scoped>
    li {
      border-bottom: 1px solid rgb(214, 214, 214);
    }

    ul {list-style-type: none;padding: 0;}

    label {
      background: rgba(0, 0, 0, 0.07);
      display: inline-block;
      padding: 0.3em;
      width: 5em;
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
    }
  </style>
</property-pane>
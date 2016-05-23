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
    </div>
  </li>

  <li>
    <label>Start</label>
    <input type="text" value="{ sections.start }" onchange={ onChangeStart }>
    <button onclick={ onClickRandomStart }>R</button>
  </li>

  <li>
    <label>Duration</label>
    <input type="text" value="{ sections.duration }" onchange={ onChangeDuration }>
    <button onclick={ onClickRandomDuration }>R</button>
  </li>

  <li>
    <label>Velocity</label>
    <input type="text" value="{ sections.velocity }" onchange={ onChangeVelocity }>
    <button onclick={ onClickRandomVelocity }>R</button>
  </li>

  <li>
    <label>Align</label>
    <button onclick={ onClickAlignLeft }>Left</button>
    <button onclick={ onClickAlignRight }>Right</button>
    <button onclick={ onClickAlignTop }>Top</button>
    <button onclick={ onClickAlignBottom }>Bottom</button>
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
      const aVal = isNaN(val) ? 100 : Math.min(127, Math.max(0, val))
      e.target.value = noteNumberString(aVal)
      this.opts.onChangePitch(this.notes, aVal)
    }

    this.onClickPitch = (inc) => {
      this.opts.onTransformNotes(this.notes, inc)
    }

    this.onChangeStart = (e) => {
      const val = parseInt(e.target.value)
      if (isNaN(val)) {
        return
      }
      const aVal = Math.max(0, val)
      e.target.value = aVal
      this.opts.onChangeStart(this.notes, aVal)
    }

    this.onClickRandomStart = () => {
      this.notes.forEach(n => {
        const delta = (Math.random() - 0.5) * 240
        this.opts.onChangeStart([n], Math.max(0, Math.round(n.tick + delta)))
      })
    }

    this.onChangeDuration = (e) => {
      const val = parseInt(e.target.value)
      if (isNaN(val)) {
        return
      }
      const aVal = Math.max(0, val)
      e.target.value = aVal
      this.opts.onChangeDuration(this.notes, aVal)
    }

    this.onClickRandomDuration = () => {
      this.notes.forEach(n => {
        const delta = n.duration * (Math.random() - 0.5) * 0.5
        this.opts.onChangeDuration([n], Math.max(0, Math.round(n.duration + delta)))
      })
    }

    this.onChangeVelocity = (e) => {
      // TODO: support math syntax (*25, 3 + 5, 127/3...)
      // TODO: support %
      // TODO: support drag to change value
      const val = parseInt(e.target.value)
      const aVal = isNaN(val) ? 100 : Math.min(127, Math.max(0, val))
      e.target.value = aVal
      this.opts.onChangeVelocity(this.notes, aVal)
    }

    this.onClickRandomVelocity = () => {
      this.notes.forEach(n => {
        const delta = n.velocity * (Math.random() - 0.5) * 0.5
        this.opts.onChangeVelocity([n], Math.max(0, Math.min(127, Math.round(n.velocity + delta))))
      })
    }

    this.onClickAlignLeft = () => {
      let minTick = Number.MAX_VALUE
      this.notes.forEach(n => {
        if (n.tick < minTick) {
          minTick = n.tick
        }
      })
      this.notes.forEach(n => {
        this.opts.onChangeStart([n], minTick)
      })
    }

    this.onClickAlignRight = () => {
      let maxTick = Number.MIN_VALUE
      this.notes.forEach(n => {
        const t = n.tick + n.duration
        if (t > maxTick) {
          maxTick = t
        }
      })
      this.notes.forEach(n => {
        this.opts.onChangeStart([n], maxTick - n.duration)
      })
    }

    this.onClickAlignBottom = () => {
      let minPitch = Number.MAX_VALUE
      this.notes.forEach(n => {
        if (n.noteNumber < minPitch) {
          minPitch = n.noteNumber
        }
      })
      this.notes.forEach(n => {
        this.opts.onChangePitch([n], minPitch)
      })
    }

    this.onClickAlignTop = () => {
      let maxPitch = Number.MIN_VALUE
      this.notes.forEach(n => {
        if (n.noteNumber > maxPitch) {
          maxPitch = n.noteNumber
        }
      })
      this.notes.forEach(n => {
        this.opts.onChangePitch([n], maxPitch)
      })
    }

  </script>
  <style scoped>
    li {
      border-bottom: 1px solid rgb(214, 214, 214);
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
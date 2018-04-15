import React, { Component } from "react"
import { noteNumberString } from "helpers/noteNumberString"
import Section from "components/groups/Section"
import Icon from "components/Icon.tsx"

import "./PropertyPane.css"

function PropertyPaneContent({
  sections
}) {
  const s = sections
  return <div className="property-pane">
    <Section title="Note Properties">
      <ul>
        <li>
          <label>Pitch</label>
          <input type="text" value={s.pitch.value} onChange={s.pitch.onChange} />
          <div>
            <button onClick={() => s.pitch.onAdd(1)}>+1</button>
            <button onClick={() => s.pitch.onAdd(-1)}>-1</button>
            <button onClick={() => s.pitch.onAdd(12)}>Oct +1</button>
            <button onClick={() => s.pitch.onAdd(-12)}>Oct -1</button>
          </div>
        </li>

        <li>
          <label>Start</label>
          <input type="text" value={s.start.value} onChange={s.start.onChange} />
          <button onClick={s.start.onRandom}>R</button>
        </li>

        <li>
          <label>Duration</label>
          <input type="text" value={s.duration.value} onChange={s.duration.onChange} />
          <button onClick={s.duration.onRandom}>R</button>
        </li>

        <li>
          <label>Velocity</label>
          <input type="text" value={s.velocity.value} onChange={s.velocity.onChange} />
          <button onClick={s.velocity.onRandom}>R</button>
        </li>

        <li>
          <label>Align</label>
          <button onClick={s.align.onClickLeft}><Icon>format-align-left</Icon></button>
          <button onClick={s.align.onClickRight}><Icon>format-align-right</Icon></button>
          <button onClick={s.align.onClickTop}><Icon>format-align-top</Icon></button>
          <button onClick={s.align.onClickBottom}><Icon>format-align-bottom</Icon></button>
        </li>

        <li>
          <button onClick={s.quantize.onClick}>Quantize</button>
        </li>
      </ul>
    </Section>
  </div>
}

function equalValue(arr, prop, func = (v) => v, elseValue = "<multiple values>") {
  if (!arr || arr.length === 0) {
    return ""
  }
  const first = arr[0][prop]
  for (let item of arr) {
    if (item[prop] != first) {
      return elseValue
    }
  }
  return func(first)
}

export default class PropertyPane extends Component {
  render() {
    const notes = this.props.notes

    const sections = {}

    const emitNoteChanges = (propName, func) => {
      const changes = notes.map(n => {
        return {
          id: n.id,
          [propName]: func(n[propName], n)
        }
      })
      this.props.updateNotes(changes)
    }

    sections.pitch = {
      onChange: (e) => {
        // TODO: support math syntax (*25, 3 + 5, 127/3...)
        // TODO: support note number string (C# 3, D4, ...)
        const val = parseInt(e.target.value)
        const aVal = isNaN(val) ? 100 : Math.min(127, Math.max(0, val))
        e.target.value = noteNumberString(aVal)
        emitNoteChanges("noteNumber", () => aVal)
      },

      onAdd: (inc) => {
        emitNoteChanges("noteNumber", v => v + inc)
      }
    }

    sections.start = {
      onChange: (e) => {
        const val = parseInt(e.target.value)
        if (isNaN(val)) {
          return
        }
        const aVal = Math.max(0, val)
        e.target.value = aVal
        emitNoteChanges("tick", () => aVal)
      },

      onRandom: () => {
        emitNoteChanges("tick", v => {
          const delta = (Math.random() - 0.5) * 240
          return Math.max(0, Math.round(v + delta))
        })
      }
    }

    sections.duration = {
      onChange: (e) => {
        const val = parseInt(e.target.value)
        if (isNaN(val)) {
          return
        }
        const aVal = Math.max(0, val)
        e.target.value = aVal
        emitNoteChanges("duration", () => aVal)
      },

      onRandom: () => {
        emitNoteChanges("duration", v => {
          const delta = v * (Math.random() - 0.5) * 0.5
          return Math.max(0, Math.round(v + delta))
        })
      }
    }

    sections.velocity = {
      onChange: (e) => {
        // TODO: support math syntax (*25, 3 + 5, 127/3...)
        // TODO: support %
        // TODO: support drag to change value
        const val = parseInt(e.target.value)
        const aVal = isNaN(val) ? 100 : Math.min(127, Math.max(0, val))
        e.target.value = aVal
        emitNoteChanges("velocity", () => aVal)
      },

      onRandom: () => {
        emitNoteChanges("velocity", v => {
          const delta = v * (Math.random() - 0.5) * 0.5
          return Math.max(0, Math.min(127, Math.round(v + delta)))
        })
      }
    }

    sections.align = {
      onClickLeft: () => {
        let minTick = Number.MAX_VALUE
        notes.forEach(n => {
          if (n.tick < minTick) {
            minTick = n.tick
          }
        })
        emitNoteChanges("tick", () => minTick)
      },

      onClickRight: () => {
        let maxTick = Number.MIN_VALUE
        notes.forEach(n => {
          const t = n.tick + n.duration
          if (t > maxTick) {
            maxTick = t
          }
        })
        emitNoteChanges("tick", (v, n) => maxTick - n.duration)
      },

      onClickBottom: () => {
        let minPitch = Number.MAX_VALUE
        notes.forEach(n => {
          if (n.noteNumber < minPitch) {
            minPitch = n.noteNumber
          }
        })
        emitNoteChanges("noteNumber", () => minPitch)
      },

      onClickTop: () => {
        let maxPitch = Number.MIN_VALUE
        notes.forEach(n => {
          if (n.noteNumber > maxPitch) {
            maxPitch = n.noteNumber
          }
        })
        emitNoteChanges("noteNumber", () => maxPitch)
      }
    }

    sections.quantize = {
      onClick: () => true
    }

    sections.pitch.value = equalValue(notes, "noteNumber", noteNumberString)
    sections.start.value = equalValue(notes, "tick")
    sections.duration.value = equalValue(notes, "duration")
    sections.velocity.value = equalValue(notes, "velocity")

    return <PropertyPaneContent sections={sections} />
  }
}

import _ from "lodash"

/**

  assemble noteOn and noteOff to single note event to append duration

 */
export function assemble(events) {
  const noteOnEvents = []

  function findNoteOn(noteOff) {
    const i = _.findIndex(noteOnEvents, e => {
      return e.channel === noteOff.channel &&
        e.noteNumber === noteOff.noteNumber
    })
    if (i < 0) {
      return null
    }
    const e = noteOnEvents[i]
    noteOnEvents.splice(i, 1)
    return e
  }

  const result = []
  events.forEach((e) => {
    switch(e.subtype) {
      case "noteOn":
        noteOnEvents.push(e)
        break
      case "noteOff": {
        const noteOn = findNoteOn(e)
        if (noteOn != null) {
          noteOn.duration = e.tick - noteOn.tick
          noteOn.subtype = "note"
          result.push(noteOn)
        }
        break
      }
      default:
        result.push(e)
        break
    }
  })

  return result
}

// separate note to noteOn + noteOff
export function deassemble(e) {
  if (e.subtype === "note") {
    return [{
      type: "channel",
      subtype: "noteOn",
      tick: e.tick,
      channel: e.channel,
      noteNumber: e.noteNumber,
      velocity: e.velocity
    },
    {
      type: "channel",
      subtype: "noteOff",
      tick: e.tick + e.duration - 1, // -1 to prevent overlap
      channel: e.channel,
      noteNumber: e.noteNumber,
      velocity: 0
    }]
  } else {
    return [e]
  }
}

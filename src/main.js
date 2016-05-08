const MAX_NOTE_NUMBER = 127
const KEY_HEIGHT = 14
const PIXELS_PER_BEAT = 23
const TIME_BASE = 480

const clipboard = new Clipboard
const quantizer = new Quantizer(PIXELS_PER_BEAT, KEY_HEIGHT)
const eventStore = new EventStore

const player = new Player(eventStore, TIME_BASE)
document.player = player
var currentMidi

const coordConverter = new NoteCoordConverter(PIXELS_PER_BEAT, KEY_HEIGHT, [
  { tempo: 120, tick: 0 },
], TIME_BASE, MAX_NOTE_NUMBER)

document.querySelector("#play-button").onclick = e => {
  if (player.playing) { 
    player.stop()
  } else {
    player.resume()
  }
}

document.querySelector("#stop-button").onclick = e => {
  player.stop()
  player.position = 0
}

document.querySelector("#forward-button").onclick = e => {
  player.position += TIME_BASE * 4
}

document.querySelector("#backward-button").onclick = e => {
  player.position -= TIME_BASE * 4
}

document.querySelector("#load-midi-input").onchange = e => {
  const file = e.target.files[0]
  if (file.type != "audio/mid" && file.type != "audio/midi") {
    return
  }
  MidiFileReader.read(file, midi => {
    currentMidi = midi

    const tempos = midi.tracks[0].events
    .filter(e => {
      return e.subtype == "setTempo"
    }).map(e => {
      return {
        tempo: 1 / e.microsecondsPerBeat * 1000 * 1000 * 60,
        tick: e.tick
      }
    })
    coordConverter.tempos = tempos

    eventStore.clear()
    eventStore.addAll(midi.tracks.map(t => t.events).flatten())

    player.reset()
  })
}

function createNoteEvent(bounds, channel) {
  const e = {
    type: "channel",
    subtype: "note",
    velocity: 127,
    channel: channel,
    track: channel
  }
  updateNoteEventWithBounds(e, bounds)
  return e
}

function updateNoteEventWithBounds(e, bounds) {
  const start = coordConverter.getTicksForPixels(bounds.x)
  const end = coordConverter.getTicksForPixels(bounds.x + bounds.width)
  const noteNum = coordConverter.getNoteNumberForPixels(bounds.y)

  e.tick = start
  e.duration = end - start
  e.noteNumber = noteNum
}

riot.compile(() => {
  contextMenu = riot.mount("context-menu", {
    hidden: true,
    x: 0,
    y: 0,
    items: []
  })[0]
  document.contextMenu = contextMenu

  // ルーラーの表示
  bars = Array.range(0, 3).map(i => {
    return {
      length: 120,
      label: i
    }
  })
  bars[0].label += " Start"

  const notesOpts = {
    numberOfKeys: MAX_NOTE_NUMBER,
    notes: [], 
    mouseMode: 1,
    quantizer: quantizer,
    coordConverter: coordConverter,
    onCreateNote: bounds => {
      eventStore.add(createNoteEvent(bounds, trackSelectTag.selectedIndex))
    },
    onClickNote: noteId => {
      eventStore.removeById(noteId)
    },
    onResizeNote: (noteId, bounds) => {
      const e = eventStore.getEventById(noteId)
      updateNoteEventWithBounds(e, bounds)
      eventStore.update(e)
    },
    onSelectNotes: noteIds => {
      console.log(`${noteIds.length} notes selected`)
    },
    onMoveNotes: changes => {
      changes.forEach(c => {
        const e = eventStore.getEventById(c.id)
        updateNoteEventWithBounds(e, c)
      })
      eventStore.update()
    },
    onClickNotes: (noteIds, e) => {
      if (e.button != 2) return
      contextMenu.update({
        hidden: false,
        x: e.clientX,
        y: e.clientY,
        items: [
          { title: "Cut", onClick: ev => {
            clipboard.writeText(JSON.stringify(aNotes))
            notes.deleteArray(aNotes)
          } },
          { title: "Copy", onClick: ev => {
            clipboard.writeText(JSON.stringify(aNotes))
          } },
          { title: "Paste", onClick: ev => {
            copiedNotes = JSON.parse(clipboard.readText())
            notes.pushArray(copiedNotes)
          } },
          { title: "Delete", onClick: ev => {
            noteStore.removeEventsById(aNotes.map(n => n.id))
          } },
        ]
      })
    },
    onMoveCursor: tick => {
      player.position = tick
    },
    onChangeNoteVelocity: (noteId, velocity) => {
      const e = eventStore.getEventById(noteId)
      e.velocity = velocity
      eventStore.update()
    }
  }
  const trackSelectTag = riot.mount("#track-select", { 
    options: [
    {
      name: "Track 1",
      value: 1,
      selected: true
    },
    {
      name: "Track 2",
      value: 2,
      selected: false
    },
    ],
    onSelect: (item, index) => {
      console.log(item, index)
      notesTag.clearNotes()
      updateNotes(index)
    }
  })[0]

  const quantizeSelectTag = riot.mount("#quantize-select", { 
    options: [
    {
      name: "全音符",
      value: 1,
    },
    {
      name: "付点2分音符",
      value: 2 / 1.5,
    },
    {
      name: "2分音符",
      value: 2,
    },
    {
      name: "3連2分音符",
      value: 3,
    },
    {
      name: "付点4分音符",
      value: 4 / 1.5
    },
    {
      name: "4分音符",
      value: 4,
      selected: true
    },
    {
      name: "3連4分音符",
      value: 6,
    },
    {
      name: "付点8分音符",
      value: 8 / 1.5
    },
    {
      name: "8分音符",
      value: 8
    },
    {
      name: "3連8分音符",
      value: 12,
    },
    {
      name: "付点16分音符",
      value: 16 / 1.5
    },
    {
      name: "16分音符",
      value: 16
    },
    {
      name: "3連16分音符",
      value: 24,
    },
    {
      name: "付点32分音符",
      value: 32 / 1.5
    },
    {
      name: "32分音符",
      value: 32
    },
    {
      name: "3連16分音符",
      value: 48,
    },
    ],
    onSelect: (item, index) => {
      quantizer.denominator = item.value
    }
  })[0]

  const notesTag = riot.mount("piano-roll", notesOpts)[0]
  const eventTable = riot.mount("event-table", eventStore)[0]

  setInterval(() => {
    notesTag.setCursorPosition(player.position)
  }, 66)

  document.querySelector("#pencil-button").onclick = e => {
    notesTag.update({mouseMode: 0})
  }

  document.querySelector("#selection-button").onclick = e => {
    notesTag.update({mouseMode: 1})
  }

  document.querySelector("#scale-up-button").onclick = e => {
    changePixelsPerBeat(10)
  }

  document.querySelector("#scale-down-button").onclick = e => {
    changePixelsPerBeat(-10)
  }

  function changePixelsPerBeat(increment) {
    const oldValue = quantizer.pixelsPerBeat
    const newValue = Math.max(10, oldValue + increment)
    quantizer.pixelsPerBeat = newValue
    coordConverter.pixelsPerBeat = newValue
    // keep scroll position
    notesTag.scrollContainer.scrollX = notesTag.scrollContainer.scrollX * newValue / oldValue
    updateNotes(trackSelectTag.selectedIndex)
  }

  function updateNotes(track) {
    const trackEvents = eventStore.events.filter(e => {
      return e.track == track
    })
    const notes = trackEvents.filter(e => {
      return e.type == "channel" && e.subtype == "note"
    }).map(e => {
      const start = coordConverter.getPixelsAt(e.tick)
      const end = coordConverter.getPixelsAt(e.tick + e.duration)
      return {
        id: e.id,
        x: start,
        y: coordConverter.getPixelsForNoteNumber(e.noteNumber),
        width: end - start,
        velocity: e.velocity
      }
    })

    notesTag.update({
      notes: notes
    })

    eventTable.update({events: trackEvents})
  }

  eventStore.on("change", e => {
    updateNotes(trackSelectTag.selectedIndex)

    if (currentMidi) {
      const trackOptions = currentMidi.tracks.map((t, i) => { return {
        name: `${t.name}(${i})`,
        value: i,
        selected: i == trackSelectTag.selectedIndex
      }})
      trackSelectTag.update({options: trackOptions})
    }
  })
})

const clipboard = new Clipboard
const quantizer = new Quantizer(30, 30)
const eventStore = new EventStore

MAX_NOTE_NUMBER = 127
KEY_HEIGHT = 30
PIXELS_PER_BEAT = 50
TIME_BASE = 480

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

function createNoteEventFromBounds(bounds) {
  const e = {
    type: "channel",
    subtype: "note",
    velocity: 127,
    channel: 1,
    track: 1
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
      eventStore.add(createNoteEventFromBounds(bounds))
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
    }
  }
  const selectTag = riot.mount("riot-select", { 
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

  function updateNotes(track) {
    const notes = (eventStore.events.filter(e => {
      return e.type == "channel" && e.subtype == "note" && e.track == track
    }).map(e => {
      const start = coordConverter.getPixelsAt(e.tick)
      const end = coordConverter.getPixelsAt(e.tick + e.duration)
      return {
        id: e.id,
        x: start,
        y: coordConverter.getPixelsForNoteNumber(e.noteNumber),
        width: end - start
      }
    }))

    notesTag.update({
      notes: notes
    })
  }

  eventStore.on("change", e => {
    updateNotes(selectTag.selectedIndex)
    //eventTable.update(eventStore)

    if (currentMidi) {
      const trackOptions = currentMidi.tracks.map((t, i) => { return {
        name: `${t.name}(${i})`,
        value: i,
        selected: i == selectTag.selectedIndex
      }})
      selectTag.update({options: trackOptions})
    }
  })

  eventStore.addAll([{"deltaTime":0,"eventTypeByte":255,"type":"meta","subtype":"setTempo","microsecondsPerBeat":479999,"tick":0,"track":0},{"deltaTime":0,"eventTypeByte":255,"type":"meta","subtype":"timeSignature","numerator":3,"denominator":4,"metronome":24,"thirtyseconds":8,"tick":0,"track":0},{"deltaTime":240,"eventTypeByte":145,"channel":1,"type":"channel","noteNumber":52,"velocity":100,"subtype":"note","tick":8640,"duration":133,"track":1},{"deltaTime":113,"eventTypeByte":145,"channel":1,"type":"channel","noteNumber":57,"velocity":100,"subtype":"note","tick":8886,"duration":127,"track":1},{"deltaTime":0,"eventTypeByte":60,"channel":1,"type":"channel","noteNumber":60,"velocity":100,"subtype":"note","tick":8886,"duration":127,"track":1},{"deltaTime":107,"eventTypeByte":145,"channel":1,"type":"channel","noteNumber":52,"velocity":100,"subtype":"note","tick":9120,"duration":133,"track":1},{"deltaTime":347,"eventTypeByte":145,"channel":1,"type":"channel","noteNumber":52,"velocity":100,"subtype":"note","tick":9600,"duration":133,"track":1},{"deltaTime":113,"eventTypeByte":145,"channel":1,"type":"channel","noteNumber":57,"velocity":100,"subtype":"note","tick":9846,"duration":127,"track":1},{"deltaTime":0,"eventTypeByte":60,"channel":1,"type":"channel","noteNumber":60,"velocity":100,"subtype":"note","tick":9846,"duration":127,"track":1},{"deltaTime":107,"eventTypeByte":145,"channel":1,"type":"channel","noteNumber":53,"velocity":100,"subtype":"note","tick":10080,"duration":133,"track":1},{"deltaTime":113,"eventTypeByte":145,"channel":1,"type":"channel","noteNumber":57,"velocity":100,"subtype":"note","tick":10326,"duration":127,"track":1},{"deltaTime":0,"eventTypeByte":60,"channel":1,"type":"channel","noteNumber":60,"velocity":100,"subtype":"note","tick":10326,"duration":127,"track":1},{"deltaTime":107,"eventTypeByte":145,"channel":1,"type":"channel","noteNumber":53,"velocity":100,"subtype":"note","tick":10560,"duration":133,"track":1},{"deltaTime":347,"eventTypeByte":145,"channel":1,"type":"channel","noteNumber":53,"velocity":100,"subtype":"note","tick":11040,"duration":133,"track":1},{"deltaTime":113,"eventTypeByte":145,"channel":1,"type":"channel","noteNumber":57,"velocity":100,"subtype":"note","tick":11286,"duration":127,"track":1},{"deltaTime":0,"eventTypeByte":60,"channel":1,"type":"channel","noteNumber":60,"velocity":100,"subtype":"note","tick":11286,"duration":127,"track":1},{"deltaTime":107,"eventTypeByte":145,"channel":1,"type":"channel","noteNumber":54,"velocity":100,"subtype":"note","tick":11520,"duration":133,"track":1},{"deltaTime":113,"eventTypeByte":145,"channel":1,"type":"channel","noteNumber":57,"velocity":100,"subtype":"note","tick":11766,"duration":127,"track":1},{"deltaTime":0,"eventTypeByte":60,"channel":1,"type":"channel","noteNumber":60,"velocity":100,"subtype":"note","tick":11766,"duration":127,"track":1},{"deltaTime":107,"eventTypeByte":145,"channel":1,"type":"channel","noteNumber":54,"velocity":100,"subtype":"note","tick":12000,"duration":133,"track":1}])
})

const clipboard = new Clipboard
const quantizer = new Quantizer(30, 30)
const eventStore = new EventStore

MAX_NOTE_NUMBER = 127
KEY_HEIGHT = 30
PIXELS_PER_BEAT = 100
TIME_BASE = 480

const player = new Player(eventStore, TIME_BASE)
document.player = player

const coordConverter = new NoteCoordConverter(PIXELS_PER_BEAT, KEY_HEIGHT, [
  { tempo: 120, tick: 0 },
], TIME_BASE, MAX_NOTE_NUMBER)

document.querySelector("#play-button").onclick = e => {
  player.playAt(0)
}

document.querySelector("#load-midi-input").onchange = e => {
  const file = e.target.files[0]
  if (file.type != "audio/mid" && file.type != "audio/midi") {
    return
  }
  MidiFileReader.read(file, midi => {

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

    eventStore.addAll(midi.tracks.map(t => t.events).flatten())
  })
}

function onClickBody(e) {
  document.contextMenu.update({
    hidden: true
  })
}

function onMouseUpBody(e) {
  if (e.button == 2 && e.detail == 2) {
    console.log("right double click")
    if (document.notesOpts.mode == 0) {
      document.notesOpts.mode = 1
    } else {
      document.notesOpts.mode = 0
    }
  }
}

const keysElem = document.querySelector("keys")
const rulerElem = document.querySelector("ruler")
document.querySelector("#piano-roll").onscroll = e => {
  const top = e.target.scrollTop
  const left = e.target.scrollLeft
  // fixed to left
  keysElem.style.setProperty("left", `${left}px`)
  // fixed to top
  rulerElem.style.setProperty("top", `${top}px`)
}

riot.compile(() => {
  contextMenu = riot.mount("context-menu", {
    hidden: true,
    x: 0,
    y: 0,
    items: []
  })[0]
  document.contextMenu = contextMenu

  // 鍵盤の表示
  riot.mount("keys", {numberOfKeys: MAX_NOTE_NUMBER})

  // 水平線の表示
  riot.mount("key-grid", {numberOfKeys: MAX_NOTE_NUMBER})

  // グリッドの表示
  lines = Array.range(0, 4 * 4 - 1).map(i => {
    return {
      x: 120 / 4 * (i + 1),
      color: i % 4 == 3 ? "gray" : "rgb(210, 210, 210)"
    }
  })

  riot.mount("grid", {numberOfKeys: MAX_NOTE_NUMBER, lines: lines})

  // ルーラーの表示
  bars = Array.range(0, 3).map(i => {
    return {
      length: 120,
      label: i
    }
  })
  bars[0].label += " Start"

  riot.mount("ruler", {bars: bars})

  notes = []
  const notesOpts = {
    notes: notes, 
    mode: 0,
    quantizer: quantizer,
    onCreateNote: bounds => {
      notes.push(bounds)
    },
    onClickNote: note => {
      notes.splice(notes.indexOf(note), 1)
    },
    onResizeNote: (note, bounds) => {
      note.x = bounds.x
      note.y = bounds.y
      note.width = bounds.width
      note.height = bounds.height
    },
    onSelectNotes: aNotes => {
      notes.forEach(n => {
        n.selected = aNotes.includes(n)
      })
    },
    onMoveNotes: (notes, movement) => {
      notes.forEach(n => {
        n.x += movement.x
        n.y += movement.y
      })
    },
    onClickNotes: (aNotes, e) => {
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
            notes.deleteArray(aNotes)
          } },
        ]
      })
    }
  }

  const notesTag = riot.mount("notes", notesOpts)[0]
  const eventTable = riot.mount("event-table", eventStore)[0]

  eventStore.on("change", e => {
    notes.pushArray(eventStore.events.filter(e => {
      return e.type == "channel" && e.subtype == "note" && e.track == 1
    }).map(e => {
      const start = coordConverter.getPixelsAt(e.tick)
      const end = coordConverter.getPixelsAt(e.tick + e.duration)
      return {
        x: start,
        y: coordConverter.getPixelsForNoteNumber(e.noteNumber),
        width: end - start
      }
    }))
    eventTable.update(eventStore)
    notesTag.update({
      notes: notes
    })
  })
})

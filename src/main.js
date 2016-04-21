const clipboard = new Clipboard
const quantizer = new Quantizer(30, 30)
const eventStore = new EventStore

document.querySelector("#load-midi-input").onchange = (e) => {
  const file = e.target.files[0]
  if (file.type != "audio/mid" && file.type != "audio/midi") {
    return
  }
  MidiFileReader.read(file, (midi) => {
    eventStore.addAll(midi.tracks[2].events)
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

riot.compile(() => {
  contextMenu = riot.mount("context-menu", {
    hidden: true,
    x: 0,
    y: 0,
    items: []
  })[0]
  document.contextMenu = contextMenu

  // 鍵盤の表示
  riot.mount("keys", {numberOfKeys: 24})

  // 水平線の表示
  riot.mount("key-grid", {numberOfKeys: 24})

  // グリッドの表示
  lines = Array.range(0, 4 * 4 - 1).map((i) => {
    return {
      x: 120 / 4 * (i + 1),
      color: i % 4 == 3 ? "gray" : "rgb(210, 210, 210)"
    }
  })

  riot.mount("grid", {numberOfKeys: 24, lines: lines})

  // ルーラーの表示
  bars = Array.range(0, 3).map((i) => {
    return {
      length: 120,
      label: i
    }
  })
  bars[0].label += " Start"

  riot.mount("ruler", {bars: bars})

  // ノートの配置とコールバック
  notes = [
    {
      x: 30 * 0,
      y: 30 * 12,
      width: 30 * 2
    },
    {
      x: 30 * 3,
      y: 30 * 4,
      width: 30 * 5
    },
    {
      x: 30 * 4,
      y: 30 * 7,
      width: 30 * 5
    }
  ]

  selections = []

  var notesOpts = {
    notes: notes, 
    mode: 0,
    quantizer: quantizer,
    selections: selections,
    onCreateNote: (bounds) => {
      notes.push(bounds)
    },
    onClickNote: (note) => {
      notes.splice(notes.indexOf(note), 1)
    },
    onResizeNote: (note, bounds) => {
      note.x = bounds.x
      note.y = bounds.y
      note.width = bounds.width
      note.height = bounds.height
    },
    onSelectNotes: (aNotes) => {
      notes.forEach(function(n) {
        n.selected = aNotes.includes(n)
      })
    },
    onMoveNotes: (notes, movement) => {
      notes.forEach(function(n) {
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
          { title: "Cut", onClick: (ev) => {
            clipboard.writeText(JSON.stringify(aNotes))
            notes.deleteArray(aNotes)
          } },
          { title: "Copy", onClick: (ev) => {
            clipboard.writeText(JSON.stringify(aNotes))
          } },
          { title: "Paste", onClick: (ev) => {
            copiedNotes = JSON.parse(clipboard.readText())
            notes.pushArray(copiedNotes)
          } },
          { title: "Delete", onClick: (ev) => {
            notes.deleteArray(aNotes)
          } },
        ]
      })
    }
  }
  document.notesOpts = notesOpts
  riot.mount("notes", notesOpts)

  const eventTable = riot.mount("event-table", {
    events: [],
  })[0]

  eventStore.on("change", (e) => {
    eventTable.update({
      events: eventStore.events
    })
  })
})

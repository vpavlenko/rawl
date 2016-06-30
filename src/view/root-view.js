"use strict"

class RootView {
  constructor() {
    this.loadView()
    this.emitter = {}
    this.trackId = 0
    riot.observable(this.emitter)
  }

  setSong(song) {
    this.song = song
    this.toolbar.update({song: song})
    this.pianoRoll.setTrack(song.getTrack(0))
  }

  loadView() {
    riot.compile(() => {
      this.trackInfoPane = riot.mount("track-info")[0]
      this.propertyPane = riot.mount("property-pane")[0]
      this.toolbar = riot.mount("toolbar")[0]
      this.eventPane = riot.mount("event-table")[0]
      this.pianoRoll = new PianoRollController(this.emitter, document.querySelector("#piano-roll"))

      this.viewDidLoad()
    })
  }

  viewDidLoad() {
    this.toolbar.update({
      onChangeFile: e => {
        const file = e.target.files[0]
        if (file.type != "audio/mid" && file.type != "audio/midi") {
          return
        }
        this.emitter.trigger("change-file", file)
      },

      onClickPencil: e => {
        this.emitter.trigger("change-tool", 0)
      },

      onClickSelection: e => {
        this.emitter.trigger("change-tool", 1)
      },

      onClickScaleUp: e => {
        this.emitter.trigger("scale-up")
      },

      onClickScaleDown: e => {
        this.emitter.trigger("scale-down")
      },

      onSelectTrack: e => {
        this.trackId = e.value
        this.emitter.trigger("change-track", this.trackId)
        const track = this.song.getTrack(this.trackId)
        this.pianoRoll.setTrack(track)
        this.trackInfoPane.update({track: track})
      },

      onSelectQuantize: e => {
        this.emitter.trigger("change-quantize", e.value)
      }
    })

    this.pianoRoll.emitter.on("select-notes", events => {
      this.propertyPane.update({notes: events})
    })

    this.propertyPane.emitter.on("update-note", e => {
      this.song.getTrack(this.trackId).updateEvent(e.id, e)
    })
  }
}

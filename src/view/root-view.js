"use strict"

class RootView {
  constructor(model) {
    this.loadView()
    this.emitter = {}
    riot.observable(this.emitter)
  }

  loadView() {
    riot.compile(() => {
      this.trackInfoPane = riot.mount("track-info")[0]
      this.propertyPane = riot.mount("property-pane")[0]
      this.toolbar = riot.mount("toolbar")[0]
      this.eventPane = riot.mount("event-table")
      this.pianoRoll = new PianoRollController(document.querySelector("#piano-roll"))

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
      }
    })
  }
}

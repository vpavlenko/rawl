const { ipcRenderer } = window.require("electron")

export default class SynthOutput {
  constructor() {
    ipcRenderer.send("create-synth")
    ipcRenderer.on("did-create-synth-window", () => {
      ipcRenderer.send("synth", {
        type: "load_soundfont",
        payload: { path: "U:\\SoundFont\\Banks\\msgs.sf2" }
      })
    })
  }

  send(message, timestamp) {
    this.sendEvents([{ message, timestamp }])
  }

  sendEvents(events) {
    ipcRenderer.send("synth", {
      type: "midi",
      payload: { events, timestamp: window.performance.now() }
    })
  }
}

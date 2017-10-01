const { ipcRenderer } = window.require("electron")

export default class SynthOutput {
  constructor() {
    ipcRenderer.send("create-synth-window")
  }

  send(message, timestamp) {
    this.sendEvents([{ message, timestamp }])
  }

  sendEvents(events) {
    ipcRenderer.send("midi", { events, timestamp: window.performance.now() })
  }
}

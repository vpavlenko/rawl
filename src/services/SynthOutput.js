const { ipcRenderer } = window.require("electron")

export default class SynthOutput {
  constructor() {
    ipcRenderer.send("create-synth-window")
  }

  _send(msg) {
    ipcRenderer.send("midi", msg)
  }

  send(message, timestamp) {
    this._send({ message, timestamp })
  }
}

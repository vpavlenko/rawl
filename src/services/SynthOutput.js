const { remote, ipcRenderer } = window.require("electron")

export default class SynthOutput {
  constructor() {
    ipcRenderer.send("create-synth-window")
  }

  _send(msg) {
    ipcRenderer.send("midi", msg)
  }

  send(msg, timestamp) {
    const delay = timestamp - window.performance.now()
    setTimeout(() => {
      this._send(msg)
    }, delay)
  }
}

const { remote, ipcRenderer } = window.require("electron")
const { BrowserWindow } = remote

export default class SynthOutput {
  constructor() {
    ipcRenderer.send("create-synth-window")
  }

  _send(msg) {
    const message = ["midi", ...msg.map(m => m.toString(16))].join(",")
    ipcRenderer.send("midi", message)
  }

  send(msg, timestamp) {
    const delay = timestamp - window.performance.now()
    setTimeout(() => {
      this._send(msg)
    }, delay)
  }
}

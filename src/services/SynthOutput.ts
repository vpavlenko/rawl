const { ipcRenderer } = (window as any).require("electron")

export default class SynthOutput {
  constructor(soundFontPath) {
    ipcRenderer.send("create-synth")
    ipcRenderer.on("did-create-synth-window", () => {
      if (soundFontPath) {
        this.loadSoundFont(soundFontPath)
      }
    })
  }

  loadSoundFont(path) {
    ipcRenderer.send("synth", {
      type: "load_soundfont",
      payload: { path }
    })
  }

  startRecording() {
    ipcRenderer.send("synth", {
      type: "start_recording"
    })
  }

  stopRecording() {
    ipcRenderer.send("synth", {
      type: "stop_recording"
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

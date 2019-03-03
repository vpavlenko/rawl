const ipcRenderer = {
  send: (..._: any) => {},
  on: (..._: any) => {},
}

export default class SynthOutput {
  constructor(soundFontPath: string) {
    ipcRenderer.send("create-synth")
    ipcRenderer.on("did-create-synth-window", () => {
      if (soundFontPath) {
        this.loadSoundFont(soundFontPath)
      }
    })
  }

  loadSoundFont(path: string) {
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

  send(message: any, timestamp: number) {
    this.sendEvents([{ message, timestamp }])
  }

  sendEvents(events: any[]) {
    ipcRenderer.send("synth", {
      type: "midi",
      payload: { events, timestamp: window.performance.now() }
    })
  }
}

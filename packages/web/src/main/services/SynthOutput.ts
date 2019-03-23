import { Messenger, WindowMessenger } from "common/messenger/messenger"

export default class SynthOutput {
  private messenger: Messenger

  constructor(soundFontPath: string) {
    this.messenger = new WindowMessenger()
    this.messenger.send("create-synth")
    this.messenger.on("did-create-synth-window", () => {
      if (soundFontPath) {
        this.loadSoundFont(soundFontPath)
      }
    })
  }

  loadSoundFont(url: string) {
    this.messenger.send("synth", {
      type: "load_soundfont",
      payload: { url }
    })
  }

  startRecording() {
    this.messenger.send("synth", {
      type: "start_recording"
    })
  }

  stopRecording() {
    this.messenger.send("synth", {
      type: "stop_recording"
    })
  }

  send(message: any, timestamp: number) {
    this.sendEvents([{ message, timestamp }])
  }

  sendEvents(events: any[]) {
    this.messenger.send("synth", {
      type: "midi",
      payload: { events, timestamp: window.performance.now() }
    })
  }
}

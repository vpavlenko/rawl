import { Messenger, WindowMessenger } from "common/messenger/Messenger"

export default class SynthOutput {
  private messenger: Messenger

  constructor(soundFontPath: string) {
    this.messenger = new WindowMessenger(
      (document.getElementById("synth") as HTMLIFrameElement).contentWindow
    )
    this.messenger.on("did-create-synth-window", () => {
      if (soundFontPath) {
        this.loadSoundFont(soundFontPath)
      }
    })
  }

  loadSoundFont(url: string) {
    this.messenger.send("load_soundfont", { url })
  }

  startRecording() {
    this.messenger.send("start_recording")
  }

  stopRecording() {
    this.messenger.send("stop_recording")
  }

  send(message: any, timestamp: number) {
    this.sendEvents([{ message, timestamp }])
  }

  sendEvents(events: any[]) {
    this.messenger.send("midi", {
      events,
      timestamp: window.performance.now()
    })
  }
}

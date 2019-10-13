import { Messenger, WindowMessenger } from "common/messenger/Messenger"

export interface Message {
  message: number[]
  timestamp: number
}

export default class SynthOutput {
  private messenger: Messenger

  constructor(soundFontPath: string) {
    const iframe = document.getElementById("synth") as HTMLIFrameElement

    if (iframe.contentWindow == null) {
      return
    }
    this.messenger = new WindowMessenger(iframe.contentWindow)
    this.messenger.on("did-create-synth-window", () => {
      if (soundFontPath) {
        this.loadSoundFont(soundFontPath)
      }
    })
  }

  activate() {
    this.messenger.send("activate")
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

  send(message: number[], timestamp: DOMHighResTimeStamp) {
    this.sendEvents([{ message, timestamp }])
  }

  sendEvents(events: Message[]) {
    this.messenger.send("midi", {
      events,
      timestamp: window.performance.now()
    })
  }
}

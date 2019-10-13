import { Messenger, WindowMessenger } from "common/messenger/Messenger"

export interface Message {
  message: number[]
  timestamp: number
}

function createElement(html: string) {
  const elem = document.createElement("div")
  elem.innerHTML = html
  return elem.firstElementChild
}

export default class SynthOutput {
  private messenger: Messenger

  constructor(soundFontPath: string) {
    const iframe = createElement(
      `<iframe src="./synth.html" id="synth"></iframe>`
    ) as HTMLIFrameElement
    document.body.appendChild(iframe)

    if (iframe.contentWindow == null) {
      return
    }

    this.messenger = new WindowMessenger(iframe.contentWindow)

    iframe.onload = () => {
      if (soundFontPath) {
        this.loadSoundFont(soundFontPath)
      }
    }
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

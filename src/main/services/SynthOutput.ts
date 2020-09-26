import { Messenger, WindowMessenger } from "common/messenger/messenger"
import { SynthEvent, LoadSoundFontEvent } from "synth/synth"

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
  onLoadSoundFont: (e: LoadSoundFontEvent) => void = () => {}

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

    this.messenger.on(SynthEvent.didLoadSoundFont, (e) =>
      this.onLoadSoundFont(e)
    )
  }

  activate() {
    this.messenger.send(SynthEvent.activate)
  }

  loadSoundFont(url: string) {
    this.messenger.send(SynthEvent.loadSoundFont, { url })
  }

  startRecording() {
    this.messenger.send(SynthEvent.startRecording)
  }

  stopRecording() {
    this.messenger.send(SynthEvent.stopRecording)
  }

  send(message: number[], timestamp: DOMHighResTimeStamp) {
    this.sendEvents([{ message, timestamp }])
  }

  sendEvents(events: Message[]) {
    this.messenger.send(SynthEvent.midi, {
      events,
      timestamp: window.performance.now(),
    })
  }
}

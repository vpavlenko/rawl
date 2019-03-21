import { Synthesizer, MidiMessageHandler } from "sf2synth/bin/sf2.synth.js"
import Recorder from "opus-recorder"

import "./synth.css"

const ipcRenderer: any = {}

type Message = number[]

class SynthController {
  eventsBuffer: any[] = []
  // 送信元とのタイムスタンプの差
  timestampOffset = 0

  handler = new MidiMessageHandler()

  ctx: AudioContext
  output: AudioNode
  synth: Synthesizer
  recorder: Recorder

  constructor() {
    const ctx = new (window as any).AudioContext()
    const output = ctx.createGain()
    output.connect(ctx.destination)
    this.ctx = ctx
    this.output = output

    this.synth = new Synthesizer(ctx)
    this.synth.connect(output)
    this.handler.listener = this.synth

    this.setupRecorder()
    this.startTimer()
  }

  setupRecorder() {
    const recorder = new Recorder(this.ctx, {
      numberOfChannels: 2,
      encoderPath: "/libs/opus-recorder/waveWorker.min.js"
    })

    recorder.addEventListener("start", () => {
      console.log("Recorder is started")
    })
    recorder.addEventListener("stop", () => {
      console.log("Recorder is stopped")
    })
    recorder.addEventListener("pause", () => {
      console.log("Recorder is paused")
    })
    recorder.addEventListener("resume", () => {
      console.log("Recorder is resuming")
    })
    recorder.addEventListener("streamError", (e: any) => {
      console.log("Error encountered: " + e.error.name)
    })
    recorder.addEventListener("streamReady", () => {
      console.log("Audio stream is ready.")
    })
    recorder.addEventListener("dataAvailable", (e: any) => {
      const dateStr = new Date().toISOString().replace(/:/g, "-")
      // const filePath = `${app.getPath("desktop").replace(/\\/g, "/")}/${dateStr}.wav`
      // fs.writeFile(filePath, e.detail, error => {
      //   if (error) {
      //     console.error(error)
      //   }
      // })
    })
    this.recorder = recorder
  }

  startRecording() {
    this.recorder.initStream(this.output)
    this.recorder.start()
  }

  stopRecording() {
    this.recorder.stop()
  }

  onMidi({ events, timestamp }: { events: any[]; timestamp: number }) {
    this.eventsBuffer = [...this.eventsBuffer, ...events]
    this.timestampOffset = window.performance.now() - timestamp
  }

  loadSoundFont(path: string) {
    // fs.readFile(path, (error, input) => {
    //   if (!error) {
    //     this.synth.loadSoundFont(input)
    //   } else {
    //     console.warn(error.message)
    //   }
    // })
  }

  startTimer() {
    this.onTimer()
  }

  onTimer() {
    // 再生時刻が現在より過去なら再生して削除
    const eventsToSend = this.eventsBuffer.filter(({ message, timestamp }) => {
      const delay = timestamp - window.performance.now() + this.timestampOffset
      return delay <= 0
    })

    const allSoundOffChannels = eventsToSend
      .filter(({ message }) => isMessageAllSoundOff(message))
      .map(({ message }) => getMessageChannel(message))

    // 再生するイベントと、all sound off を受信したチャンネルのイベントを削除する
    this.eventsBuffer = this.eventsBuffer.filter(e => {
      return (
        !eventsToSend.includes(e) &&
        !allSoundOffChannels.includes(getMessageChannel(e.message))
      )
    })

    eventsToSend.forEach(({ message }) =>
      this.handler.processMidiMessage(message)
    )

    requestAnimationFrame(() => this.onTimer())
  }
}

export default class SynthApp {
  init() {
    const controller = new SynthController()

    ipcRenderer.on("midi", (sender: any, payload: any) => {
      controller.onMidi(payload)
    })

    ipcRenderer.on(
      "load_soundfont",
      (sender: any, { path }: { path: string }) => {
        controller.loadSoundFont(path)
      }
    )

    ipcRenderer.on("start_recording", () => {
      controller.startRecording()
    })

    ipcRenderer.on("stop_recording", () => {
      controller.stopRecording()
    })

    ipcRenderer.send("main", { type: "did-create-synth-window" })
  }
}

/// メッセージがチャンネルイベントならチャンネルを、そうでなければ -1 を返す
const getMessageChannel = (message: Message) => {
  const isChannelEvent = (message[0] & 0xf0) !== 0xf0
  return isChannelEvent ? message[0] & 0x0f : -1
}

const isMessageAllSoundOff = (message: Message) => {
  const isControlChange = (message[0] & 0xf0) === 0xb0
  if (isControlChange) {
    const isAllSoundOff = message[1] === 0x78
    return isAllSoundOff
  }
  return false
}

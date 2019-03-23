import { Synthesizer, MidiMessageHandler } from "sf2synth/bin/synth"
import Recorder from "opus-recorder"
import { WindowMessenger } from "common/messenger/Messenger"

import "./synth.css"

type Message = number[]

export default class SynthController {
  private eventsBuffer: any[] = []

  // 送信元とのタイムスタンプの差
  private timestampOffset = 0

  private handler = new MidiMessageHandler()
  private ctx: AudioContext
  private output: AudioNode
  private synth: Synthesizer
  private recorder: Recorder

  constructor() {
    const ctx = new AudioContext()
    const output = ctx.createGain()
    output.connect(ctx.destination)
    this.ctx = ctx
    this.output = output

    this.synth = new Synthesizer(ctx)
    this.synth.connect(output)
    this.handler.listener = this.synth

    this.setupRecorder()
    this.startTimer()
    this.bindMessenger()
  }

  private bindMessenger() {
    const messenger = new WindowMessenger(window.parent)
    messenger.on("midi", (payload: any) => this.onMidi(payload))
    messenger.on("load_soundfont", (payload: any) =>
      this.loadSoundFont(payload.url)
    )
    messenger.on("start_recording", () => this.startRecording())
    messenger.on("stop_recording", () => this.stopRecording())

    messenger.send("did-create-synth-window")
  }

  private setupRecorder() {
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

  private startRecording() {
    this.recorder.initStream(this.output)
    this.recorder.start()
  }

  private stopRecording() {
    this.recorder.stop()
  }

  private onMidi({ events, timestamp }: { events: any[]; timestamp: number }) {
    this.eventsBuffer = [...this.eventsBuffer, ...events]
    this.timestampOffset = window.performance.now() - timestamp
  }

  private loadSoundFont(url: string) {
    fetch(url)
      .then(res => res.arrayBuffer())
      .then(buf => this.synth.loadSoundFont(new Uint8Array(buf)))
      .catch(e => console.warn(e.message))
  }

  private startTimer() {
    this.onTimer()
  }

  private onTimer() {
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

import { Synth } from "@ryohey/sf2synth"
import { WindowMessenger } from "../common/messenger/messenger"
import { AdaptiveTimer } from "../common/player/AdaptiveTimer"
import { Message } from "../main/services/SynthOutput"

type MIDIMessage = number[]

const AudioContext = window.AudioContext || window.webkitAudioContext

export const SynthEvent = {
  activate: "activate",
  midi: "midi",
  loadSoundFont: "load_soundfont",
  startRecording: "start_recording",
  stopRecording: "stop_recording",
  didCreateSynthWindow: "did-create-synth-window",
  didLoadSoundFont: "did_load_soundfont",
}

export interface LoadSoundFontEvent {
  presetNames: {
    [index: number]: {
      [index: number]: string
    }
  }
}

const TIMER_INTERVAL = 1 / 50

export default class SynthController {
  private eventsBuffer: Message[] = []

  // 送信元とのタイムスタンプの差
  private timestampOffset = 0

  private handler = new Synth.MidiMessageHandler()
  private ctx: AudioContext
  private output: AudioNode
  private synth: Synth.Synthesizer
  private messenger: WindowMessenger
  private timer = new AdaptiveTimer(() => this.onTimer(), TIMER_INTERVAL)

  constructor() {
    const ctx = new AudioContext()
    const output = ctx.createGain()
    output.connect(ctx.destination)
    this.ctx = ctx
    this.output = output

    this.synth = new Synth.Synthesizer(ctx)
    this.synth.connect(output)
    this.handler.listener = this.synth

    this.setupRecorder()
    this.timer.start()

    this.messenger = new WindowMessenger(window.parent)
    this.bindMessenger()
  }

  private bindMessenger() {
    const { messenger } = this
    messenger.on(SynthEvent.activate, () => this.activate())
    messenger.on(SynthEvent.midi, (payload: any) => this.onMidi(payload))
    messenger.on(SynthEvent.loadSoundFont, (payload: any) =>
      this.loadSoundFont(payload.url)
    )
    messenger.on(SynthEvent.startRecording, () => this.startRecording())
    messenger.on(SynthEvent.stopRecording, () => this.stopRecording())

    messenger.send(SynthEvent.didCreateSynthWindow)
  }

  private setupRecorder() {}

  private startRecording() {}

  private stopRecording() {}

  private onMidi({
    events,
    timestamp,
  }: {
    events: Message[]
    timestamp: number
  }) {
    this.eventsBuffer = [...this.eventsBuffer, ...events]
    this.timestampOffset = window.performance.now() - timestamp
  }

  private loadSoundFont(url: string) {
    fetch(url)
      .then((res) => res.arrayBuffer())
      .then((buf) => this.synth.loadSoundFont(new Uint8Array(buf)))
      .then(() => {
        this.messenger.send(SynthEvent.didLoadSoundFont, {
          presetNames: this.synth.soundFont.getPresetNames(),
        } as LoadSoundFontEvent)
      })
      .catch((e) => console.warn(e.message))
  }

  private activate() {
    if (this.ctx.state !== "running") {
      this.ctx.resume().then(() => {
        console.log(`AudioContext.state = ${this.ctx.state}`)
      })
    }
  }

  private onTimer() {
    const now = window.performance.now()

    // 再生時刻が現在より過去なら再生して削除
    const eventsToSend = this.eventsBuffer.filter(({ message, timestamp }) => {
      const delay = timestamp - now + this.timestampOffset
      return delay <= 0
    })

    const allSoundOffChannels = eventsToSend
      .filter(({ message }) => isMessageAllSoundOff(message))
      .map(({ message }) => getMessageChannel(message))

    // 再生するイベントと、all sound off を受信したチャンネルのイベントを削除する
    this.eventsBuffer = this.eventsBuffer.filter((e) => {
      return (
        !eventsToSend.includes(e) &&
        !allSoundOffChannels.includes(getMessageChannel(e.message))
      )
    })

    eventsToSend.forEach(({ message }) =>
      this.handler.processMidiMessage(message)
    )
  }
}

/// メッセージがチャンネルイベントならチャンネルを、そうでなければ -1 を返す
const getMessageChannel = (message: MIDIMessage) => {
  const isChannelEvent = (message[0] & 0xf0) !== 0xf0
  return isChannelEvent ? message[0] & 0x0f : -1
}

const isMessageAllSoundOff = (message: MIDIMessage) => {
  const isControlChange = (message[0] & 0xf0) === 0xb0
  if (isControlChange) {
    const isAllSoundOff = message[1] === 0x78
    return isAllSoundOff
  }
  return false
}

import { SynthEvent, getSampleEventsFromSoundFont } from "@ryohey/wavelet"
import { makeObservable, observable } from "mobx"
import { SendableEvent, SynthOutput } from "./SynthOutput"

export class SoundFontSynth implements SynthOutput {
  private synth: AudioWorkletNode | null = null
  private context = new (window.AudioContext || window.webkitAudioContext)()

  private _loadedSoundFontData: ArrayBuffer | null = null
  get loadedSoundFontData(): ArrayBuffer | null {
    return this._loadedSoundFontData
  }

  isLoading: boolean = true
  private sequenceNumber = 0

  constructor(context: AudioContext) {
    this.context = context

    makeObservable(this, {
      isLoading: observable,
    })
  }

  async setup() {
    const url = new URL("@ryohey/wavelet/dist/processor.js", import.meta.url)
    await this.context.audioWorklet.addModule(url)
  }

  async loadSoundFontFromURL(url: string) {
    const response = await fetch(url)
    const data = await response.arrayBuffer()
    await this.loadSoundFont(data)
  }

  async loadSoundFont(data: ArrayBuffer) {
    this.isLoading = true

    if (this.synth !== null) {
      this.synth.disconnect()
    }

    // create new node
    this.synth = new AudioWorkletNode(this.context, "synth-processor", {
      numberOfInputs: 0,
      outputChannelCount: [2],
    } as any)
    this.synth.connect(this.context.destination)
    this.sequenceNumber = 0

    const sampleEvents = getSampleEventsFromSoundFont(new Uint8Array(data))
    this._loadedSoundFontData = data

    for (const e of sampleEvents) {
      this.postSynthMessage(
        e.event,
        e.transfer, // transfer instead of copy
      )
    }

    this.isLoading = false
  }

  private postSynthMessage(e: SynthEvent, transfer?: Transferable[]) {
    this.synth?.port.postMessage(
      { ...e, sequenceNumber: this.sequenceNumber++ },
      transfer ?? [],
    )
  }

  sendEvent(event: SendableEvent, delayTime: number = 0) {
    this.postSynthMessage({
      type: "midi",
      midi: event,
      delayTime: delayTime * this.context.sampleRate,
    })
  }

  activate() {
    this.context.resume()
  }
}

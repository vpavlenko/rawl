import { getSamplesFromSoundFont, SynthEvent } from "@ryohey/wavelet"
import { makeObservable, observable } from "mobx"
import { SendableEvent, SynthOutput } from "./SynthOutput"

export class SoundFontSynth implements SynthOutput {
  private synth: AudioWorkletNode | null = null
  private soundFontURL: string
  private context = new (window.AudioContext || window.webkitAudioContext)()

  private _loadedSoundFontData: ArrayBuffer | null = null
  get loadedSoundFontData(): ArrayBuffer | null {
    return this._loadedSoundFontData
  }

  isLoading: boolean = true

  constructor(soundFontURL: string) {
    this.soundFontURL = soundFontURL

    makeObservable(this, {
      isLoading: observable,
    })

    this.setup().finally(() => {
      this.isLoading = false
    })
  }

  private async setup() {
    const url = new URL("@ryohey/wavelet/dist/processor.js", import.meta.url)
    await this.context.audioWorklet.addModule(url)

    this.synth = new AudioWorkletNode(this.context, "synth-processor", {
      numberOfInputs: 0,
      outputChannelCount: [2],
    } as any)
    this.synth.connect(this.context.destination)

    await this.loadSoundFont()
  }

  private async loadSoundFont() {
    const data = await (await fetch(this.soundFontURL)).arrayBuffer()
    const samples = getSamplesFromSoundFont(new Uint8Array(data), this.context)
    this._loadedSoundFontData = data

    for (const sample of samples) {
      this.postSynthMessage(
        sample,
        [sample.sample.buffer] // transfer instead of copy
      )
    }
  }

  private postSynthMessage(e: SynthEvent, transfer?: Transferable[]) {
    this.synth?.port.postMessage(e, transfer ?? [])
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

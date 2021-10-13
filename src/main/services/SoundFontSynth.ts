import { getSamplesFromSoundFont, SynthEvent } from "@ryohey/wavelet"
import { AnyEvent } from "midifile-ts"
import { DistributiveOmit } from "../../common/types"

export class SoundFontSynth {
  private synth: AudioWorkletNode | null = null
  private soundFontURL: string
  private context = new AudioContext()

  constructor(soundFontURL: string) {
    this.soundFontURL = soundFontURL

    this.setup()
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
    const parsed = getSamplesFromSoundFont(new Uint8Array(data), this.context)

    for (const sample of parsed) {
      this.postSynthMessage(
        {
          type: "loadSample",
          sample,
          bank: sample.bank,
          instrument: sample.instrument,
          keyRange: sample.keyRange,
          velRange: sample.velRange,
        },
        [sample.buffer] // transfer instead of copy)
      )
    }
  }

  private postSynthMessage(e: SynthEvent, transfer?: Transferable[]) {
    this.synth?.port.postMessage(e, transfer ?? [])
  }

  sendEvent(event: SendableEvent, delayTime: number = 0) {
    const ev = anyEventToSynthEvent(event, delayTime * this.context.sampleRate)
    if (ev !== null) {
      this.postSynthMessage(ev)
    }
  }

  activate() {
    this.context.resume()
  }
}

export type SendableEvent = DistributiveOmit<AnyEvent, "deltaTime">

const anyEventToSynthEvent = (
  e: SendableEvent,
  delayTime: number
): SynthEvent | null => {
  switch (e.type) {
    case "channel":
      switch (e.subtype) {
        case "noteOn":
          return {
            type: "noteOn",
            channel: e.channel,
            pitch: e.noteNumber,
            velocity: e.velocity,
            delayTime,
          }
        case "noteOff":
          return {
            type: "noteOff",
            channel: e.channel,
            pitch: e.noteNumber,
            delayTime,
          }
        case "pitchBend":
          return {
            type: "pitchBend",
            channel: e.channel,
            value: e.value,
            delayTime,
          }
        case "programChange":
          return {
            type: "programChange",
            channel: e.channel,
            value: e.value,
            delayTime,
          }
        case "controller":
          switch (e.controllerType) {
            case 0:
              break
          }
          break
      }
  }
  return null
}

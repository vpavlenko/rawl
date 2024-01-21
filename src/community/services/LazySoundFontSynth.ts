import { SoundFontSynth } from "../../main/services/SoundFontSynth"
import { SendableEvent, SynthOutput } from "../../main/services/SynthOutput"

export class LazySoundFontSynth implements SynthOutput {
  constructor(private readonly synth: SoundFontSynth) {}

  activate(): void {
    this.synth.activate()
    this.setupSynth()
  }

  sendEvent(event: SendableEvent, delayTime: number): void {
    this.synth.sendEvent(event, delayTime)
  }

  private async setupSynth() {
    const soundFontURL =
      "https://cdn.jsdelivr.net/gh/ryohey/signal@4569a31/public/A320U.sf2"
    await this.synth.setup()
    const data = await (await fetch(soundFontURL)).arrayBuffer()
    await this.synth.loadSoundFont(data)
  }
}

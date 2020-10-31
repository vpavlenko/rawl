import { Message, SynthOutput } from "./SynthOutput"

export interface SynthEntry {
  synth: SynthOutput
  isEnabled: boolean
}

export class GroupOutput implements SynthOutput {
  outputs: SynthEntry[] = []

  activate() {
    this.outputs.filter((o) => o.isEnabled).forEach((o) => o.synth.activate())
  }

  sendEvents(events: Message[]) {
    this.outputs
      .filter((o) => o.isEnabled)
      .forEach((o) => o.synth.sendEvents(events))
  }
}

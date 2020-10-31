import { Message, SynthOutput } from "./SynthOutput"

export default class MIDIOutput implements SynthOutput {
  readonly midiOutput: WebMidi.MIDIOutput

  constructor(midiOutput: WebMidi.MIDIOutput) {
    this.midiOutput = midiOutput
  }

  activate() {
    this.midiOutput.open()
  }

  send(msg: number[], timestamp: number) {
    if (this.midiOutput.state === "connected") {
      this.midiOutput.send(msg, timestamp)
    }
  }

  sendEvents(events: Message[]) {
    events.forEach((e) => this.send(e.message, e.timestamp))
  }
}

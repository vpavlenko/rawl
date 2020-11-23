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
      try {
        this.midiOutput.send(msg, timestamp)
      } catch (e) {
        console.warn(e)
      }
    }
  }

  sendEvents(events: Message[]) {
    events.forEach((e) => this.send(e.message, e.timestamp))
  }
}

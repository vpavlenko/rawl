type MidiMessage = number[]

interface MidiEvent {
  message: MidiMessage
  timestamp: number
}

export default class MIDIOutput {
  private midiOutput: WebMidi.MIDIOutput

  constructor() {
    navigator
      .requestMIDIAccess({ sysex: true })
      .then((midiAccess) => {
        const outputs = Array.from(midiAccess.outputs.values())
        this.midiOutput = outputs[0]
      })
      .catch((error: Error) => {
        console.error(error)
      })
  }

  send(msg: MidiMessage, timestamp: number) {
    if (this.midiOutput) {
      this.midiOutput.send(msg, timestamp)
    }
  }

  sendEvents(events: MidiEvent[]) {
    events.forEach((e) => this.send(e.message, e.timestamp))
  }
}

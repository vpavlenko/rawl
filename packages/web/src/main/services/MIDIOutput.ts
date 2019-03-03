export default class MIDIOutput {
  midiOutput: any

  constructor() {
    ;(navigator as any).requestMIDIAccess({ sysex: true }).then(
      midiAccess => {
        const outputs = Array.from(midiAccess.outputs.values())
        this.midiOutput = outputs[0]
      },
      error => {
        console.error(error)
      }
    )
  }

  send(msg: any, timestamp: number) {
    if (this.midiOutput) {
      this.midiOutput.send(msg, timestamp)
    }
  }

  sendEvents(events: any[]) {
    events.forEach(e => this.send(e.message, e.timestamp))
  }
}

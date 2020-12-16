import { SynthOutput } from "./SynthOutput"

export class MIDIInput {
  private devices: WebMidi.MIDIInput[] = []
  private output: SynthOutput

  constructor(output: SynthOutput) {
    this.output = output
  }

  removeAllDevices = () => {
    this.devices.forEach(this.removeDevice)
  }

  removeDevice = (device: WebMidi.MIDIInput) => {
    device.removeEventListener("midimessage", this.onMidiMessage)
    this.devices = this.devices.filter((d) => d.id !== device.id)
  }

  addDevice = (device: WebMidi.MIDIInput) => {
    device.addEventListener("midimessage", this.onMidiMessage)
    this.devices.push(device)
  }

  onMidiMessage = (e: WebMidi.MIDIMessageEvent) => {
    this.output.sendEvents([
      {
        message: Array.from(e.data),
        timestamp: window.performance.now(),
      },
    ])
  }
}

import { parseMessage } from "../../common/midi/parseMessage"
import { serializeMessage } from "../../common/midi/serializeMessage"
import { SynthOutput } from "./SynthOutput"

export class MIDIInput {
  private devices: WebMidi.MIDIInput[] = []
  private output: SynthOutput
  channel: number = 0

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
    const event = parseMessage(e.data)

    // modify channel to the selected track channel
    event.channel = this.channel

    const data = serializeMessage(event)

    this.output.sendEvents([
      {
        message: data,
        timestamp: window.performance.now(),
      },
    ])
  }
}

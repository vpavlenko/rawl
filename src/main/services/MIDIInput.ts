import { parseMessage } from "../../common/midi/parseMessage"
import { serializeMessage } from "../../common/midi/serializeMessage"
import RootStore from "../stores/RootStore"

export class MIDIInput {
  private devices: WebMidi.MIDIInput[] = []
  onMessage: ((e: WebMidi.MIDIMessageEvent) => void) | null

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
    this.onMessage?.(e)
  }
}

export const previewMidiInput = (rootStore: RootStore) => (
  e: WebMidi.MIDIMessageEvent
) => {
  if (rootStore.song.selectedTrack === undefined) {
    return
  }
  const channel = rootStore.song.selectedTrack.channel
  if (channel === undefined) {
    return
  }
  const event = parseMessage(e.data)

  // modify channel to the selected track channel
  event.channel = channel

  const data = serializeMessage(event)

  rootStore.services.synthGroup.sendEvents([
    {
      message: data,
      timestamp: window.performance.now(),
    },
  ])
}

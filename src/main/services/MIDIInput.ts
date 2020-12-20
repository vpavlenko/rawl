import { observe } from "mobx"
import { parseMessage } from "../../common/midi/parseMessage"
import { serializeMessage } from "../../common/midi/serializeMessage"
import { NoteEvent } from "../../common/track"
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

export const recordMidiInput = (rootStore: RootStore) => {
  let recordedNotes: NoteEvent[] = []

  // extend duration while key press
  observe(rootStore.services.player, "position", (change) => {
    const track = rootStore.song.selectedTrack
    if (track === undefined) {
      return
    }

    const tick = rootStore.services.player.position

    recordedNotes.forEach((n) => {
      track.updateEvent<NoteEvent>(n.id, {
        duration: tick - n.tick,
      })
    })
  })

  return (e: WebMidi.MIDIMessageEvent) => {
    const track = rootStore.song.selectedTrack
    if (track === undefined) {
      return
    }

    const tick = rootStore.services.player.position

    const message = parseMessage(e.data)

    if (message.subtype === "noteOn") {
      const note = track.addEvent<NoteEvent>({
        type: "channel",
        subtype: "note",
        noteNumber: message.noteNumber,
        tick,
        velocity: message.velocity,
        duration: 0,
      })
      recordedNotes.push(note)
    }

    if (message.subtype === "noteOff") {
      recordedNotes = recordedNotes.filter(
        (n) => n.noteNumber !== message.noteNumber
      )
    }
  }
}

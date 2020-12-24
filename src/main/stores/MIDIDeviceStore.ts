import { action, makeObservable, observable } from "mobx"
import { toggled } from "../helpers/set"

export class MIDIDeviceStore {
  inputs: WebMidi.MIDIInput[] = []
  outputs: WebMidi.MIDIOutput[] = []
  requestError: Error | null = null
  isLoading = false
  enabledOutputIds: Set<string> = new Set()
  enabledInputIds: Set<string> = new Set()
  isFactorySoundEnabled = true

  constructor() {
    makeObservable(this, {
      inputs: observable,
      outputs: observable,
      requestError: observable,
      isLoading: observable,
      enabledOutputIds: observable,
      enabledInputIds: observable,
      isFactorySoundEnabled: observable,
      setInputEnable: action,
      setOutputEnable: action,
    })

    this.requestMIDIAccess()
  }

  requestMIDIAccess() {
    this.isLoading = true
    this.inputs = []
    this.outputs = []

    navigator
      .requestMIDIAccess({ sysex: true })
      .then((midiAccess) => {
        this.updatePorts(midiAccess)
        midiAccess.onstatechange = () => {
          this.updatePorts(midiAccess)
        }
      })
      .catch((error: Error) => {
        this.requestError = error
      })
      .finally(() => {
        this.isLoading = false
      })
  }

  private updatePorts(midiAccess: WebMidi.MIDIAccess) {
    this.inputs = Array.from(midiAccess.inputs.values())
    this.outputs = Array.from(midiAccess.outputs.values())
  }

  setInputEnable(deviceId: string, enabled: boolean) {
    this.enabledInputIds = toggled(this.enabledInputIds, deviceId, enabled)
  }

  setOutputEnable(deviceId: string, enabled: boolean) {
    this.enabledOutputIds = toggled(this.enabledOutputIds, deviceId, enabled)
  }
}

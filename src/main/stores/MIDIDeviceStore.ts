import { action, observable } from "mobx"
import { toggled } from "../helpers/set"

export class MIDIDeviceStore {
  @observable inputs: WebMidi.MIDIInput[] = []
  @observable outputs: WebMidi.MIDIOutput[] = []
  @observable requestError: Error | null = null
  @observable isLoading = false
  @observable enabledOutputIds: Set<string> = new Set()
  @observable enabledInputIds: Set<string> = new Set()
  @observable isFactorySoundEnabled = true

  constructor() {
    this.requestMIDIAccess()
  }

  requestMIDIAccess() {
    this.isLoading = true
    this.inputs = []
    this.outputs = []

    navigator
      .requestMIDIAccess({ sysex: true })
      .then((midiAccess) => {
        this.inputs = Array.from(midiAccess.inputs.values())
        this.outputs = Array.from(midiAccess.outputs.values())
      })
      .catch((error: Error) => {
        this.requestError = error
      })
      .finally(() => {
        this.isLoading = false
      })
  }

  @action setInputEnable(deviceId: string, enabled: boolean) {
    this.enabledInputIds = toggled(this.enabledInputIds, deviceId, enabled)
  }

  @action setOutputEnable(deviceId: string, enabled: boolean) {
    this.enabledOutputIds = toggled(this.enabledOutputIds, deviceId, enabled)
  }
}

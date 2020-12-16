import { autorun, observe } from "mobx"
import { isNotNull, isNotUndefined } from "../../common/helpers/array"
import { emptySelection } from "../../common/selection/Selection"
import { resetSelection } from "../actions"
import MIDIOutput from "../services/MIDIOutput"
import RootStore from "./RootStore"

export const registerReactions = (rootStore: RootStore) => {
  // reset selection when tool changed
  observe(rootStore.pianoRollStore, "mouseMode", resetSelection(rootStore))

  // sync synthGroup.output to enabledOutputIds/isFactorySoundEnabled
  const updateOutputDevices = () => {
    const { midiDeviceStore } = rootStore

    rootStore.services.player.allSoundsOff()

    const getMIDIDeviceEntries = () =>
      Array.from(midiDeviceStore.enabledOutputIds.values())
        .map((deviceId) => {
          const device = midiDeviceStore.outputs.find((d) => d.id === deviceId)
          if (device === undefined) {
            console.error(`device not found: ${deviceId}`)
            return null
          }
          return { synth: new MIDIOutput(device), isEnabled: true }
        })
        .filter(isNotNull)

    rootStore.services.synthGroup.outputs = [
      {
        synth: rootStore.services.synth,
        isEnabled: midiDeviceStore.isFactorySoundEnabled,
      },
      ...getMIDIDeviceEntries(),
    ]
  }

  observe(rootStore.midiDeviceStore, "enabledOutputIds", updateOutputDevices)
  observe(
    rootStore.midiDeviceStore,
    "isFactorySoundEnabled",
    updateOutputDevices
  )

  const updateInputDevices = () => {
    const { midiDeviceStore } = rootStore

    const devices = Array.from(midiDeviceStore.enabledInputIds.values())
      .map((deviceId) => midiDeviceStore.inputs.find((d) => d.id === deviceId))
      .filter(isNotUndefined)

    rootStore.services.midiInputGroup.devices = devices
  }

  observe(rootStore.midiDeviceStore, "enabledInputIds", updateInputDevices)

  // reset selection when change track
  autorun(() => {
    // deep observe
    const _ = rootStore.song.selectedTrackId
    rootStore.pianoRollStore.selection = emptySelection
  })
}

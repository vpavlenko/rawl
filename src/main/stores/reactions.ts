import { observe } from "mobx"
import { isNotNull, isNotUndefined } from "../../common/helpers/array"
import { resetSelection } from "../actions"
import MIDIOutput from "../services/MIDIOutput"
import RootStore from "./RootStore"

export const registerReactions = (rootStore: RootStore) => {
  // reset selection when tool changed
  observe(rootStore.pianoRollStore, "mouseMode", resetSelection(rootStore))

  observe(
    rootStore.midiDeviceStore,
    "enabledOutputIds",
    updateOutputDevices(rootStore)
  )

  observe(
    rootStore.midiDeviceStore,
    "isFactorySoundEnabled",
    updateOutputDevices(rootStore)
  )

  observe(
    rootStore.midiDeviceStore,
    "enabledInputIds",
    updateInputDevices(rootStore)
  )

  // reset selection when change track
  observe(rootStore.song, "selectedTrackId", resetSelection(rootStore))

  observe(rootStore, "song", updateMIDIRecorderSong(rootStore))

  observe(
    rootStore.services.midiRecorder,
    "isRecording",
    disableSeekWhileRecording(rootStore)
  )

  observe(
    rootStore.services.player,
    "isPlaying",
    stopRecordingWhenStopPlayer(rootStore)
  )
}

type Reaction = (rootStore: RootStore) => () => void

// sync synthGroup.output to enabledOutputIds/isFactorySoundEnabled
const updateOutputDevices: Reaction = ({
  midiDeviceStore,
  services: { player, synth, synthGroup },
}) => () => {
  player.allSoundsOff()

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

  synthGroup.outputs = [
    {
      synth: synth,
      isEnabled: midiDeviceStore.isFactorySoundEnabled,
    },
    ...getMIDIDeviceEntries(),
  ]
}

const updateInputDevices: Reaction = ({
  midiDeviceStore,
  services: { midiInput },
}) => () => {
  const devices = Array.from(midiDeviceStore.enabledInputIds.values())
    .map((deviceId) => midiDeviceStore.inputs.find((d) => d.id === deviceId))
    .filter(isNotUndefined)

  midiInput.removeAllDevices()
  devices.forEach(midiInput.addDevice)
}

const updateMIDIRecorderSong: Reaction = ({
  song,
  services: { midiRecorder },
}) => () => (midiRecorder.song = song)

const disableSeekWhileRecording: Reaction = ({
  services: { player, midiRecorder },
}) => () => (player.disableSeek = midiRecorder.isRecording)

const stopRecordingWhenStopPlayer: Reaction = ({
  services: { player, midiRecorder },
}) => () => {
  if (!player.isPlaying) {
    midiRecorder.isRecording = false
  }
}

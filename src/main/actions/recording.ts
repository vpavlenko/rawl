import RootStore from "../stores/RootStore"

export const toggleRecording = ({
  services: { midiRecorder, player },
}: RootStore) => () => {
  if (midiRecorder.isRecording) {
    midiRecorder.isRecording = false
    player.stop()
  } else {
    midiRecorder.isRecording = true
    player.play()
  }
}

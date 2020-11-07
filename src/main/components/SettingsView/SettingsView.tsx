import { useObserver } from "mobx-react-lite"
import React, { FC } from "react"
import { useStores } from "../../hooks/useStores"
import NavigationBar from "../groups/NavigationBar"
import "./SettingsView.css"

interface SettingItemProps {
  label: string
}

const SettingItem: FC<SettingItemProps> = ({ label, children }) => {
  return (
    <div className="SettingItem">
      <div className="label">{label}</div>
      <div className="value">{children}</div>
    </div>
  )
}

export const SettingsView: FC = () => {
  const rootStore = useStores()

  const { soundFontPath } = useObserver(() => ({
    soundFontPath: rootStore.settingsStore.soundFontPath,
  }))

  const {
    router,
    services: { synth },
  } = rootStore

  const clearSettings = () => rootStore.settingsStore.clear()
  const onClickNavBack = () => router.pushArrange()
  const onClickOpenSoundFont = () => {
    openSoundFont((files: string[]) => {
      if (files && files.length > 0) {
        const path = files[0]
        rootStore.settingsStore.soundFontPath = path
        synth.loadSoundFont(path)
      }
    })
  }
  const onClickShowSynth = () => {
    // ipcRenderer.send("show-synth")
  }
  const onClickStartRecording = () => {
    synth.startRecording()
  }
  const onClickStopRecording = () => {
    synth.stopRecording()
  }
  return (
    <div className="SettingsView">
      <NavigationBar title="Settings" onClickBack={onClickNavBack} />
      <div className="content">
        <SettingItem label="SoundFont">
          {soundFontPath} <button onClick={onClickOpenSoundFont}>open</button>
        </SettingItem>
        <SettingItem label="">
          <button onClick={clearSettings}>Clear settings</button>
        </SettingItem>
        <h3>Experimental</h3>
        <SettingItem label="">
          <button onClick={onClickShowSynth}>Show Synthesizer Window</button>
          <button onClick={onClickStartRecording}>Start Recording</button>
          <button onClick={onClickStopRecording}>Stop Recording</button>
        </SettingItem>
      </div>
    </div>
  )
}

function openSoundFont(callback: (files: string[]) => void) {
  // dialog.showOpenDialog({
  //   filters: [{
  //     name: "SoundFont File",
  //     extensions: ["sf2"]
  //   }]
  // }, files => callback(files))
}

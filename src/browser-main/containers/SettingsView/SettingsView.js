import React from "react"
import { observer, inject } from "mobx-react"
import NavigationBar from "components/groups/NavigationBar"

import "./SettingsView.css"

const { remote, ipcRenderer } = window.require("electron")
const { dialog } = remote

function SettingItem({
  label, children
}) {
  return <div className="SettingItem">
    <div className="label">{label}</div>
    <div className="value">{children}</div>
  </div>
}

function SettingsView({
  onClickNavBack,
  soundFontPath,
  onClickOpenSoundFont,
  clearSettings,
  onClickShowSynth,
  onClickStartRecording,
  onClickStopRecording
}) {
  return <div className="SettingsView">
    <NavigationBar title="Settings" onClickBack={onClickNavBack}>
    </NavigationBar>
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
}

function openSoundFont(callback) {
  dialog.showOpenDialog({
    filters: [{
      name: "SoundFont File",
      extensions: ["sf2"]
    }]
  }, files => callback(files))
}

export default inject(({ rootStore: { router, settingsStore: s, services: { synth } } }) => ({
  onClickNavBack: () => router.pushArrange(),
  soundFontPath: s.soundFontPath,
  onClickOpenSoundFont: () => {
    openSoundFont(files => {
      if (files && files.length > 0) {
        const path = files[0]
        s.soundFontPath = path
        synth.loadSoundFont(path)
      }
    })
  },
  clearSettings: () => s.clear(),
  onClickShowSynth: () => {
    ipcRenderer.send("show-synth")
  },
  onClickStartRecording: () => {
    synth.startRecording()
  },
  onClickStopRecording: () => {
    synth.stopRecording()
  }
}))(observer(SettingsView))

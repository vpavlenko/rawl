import React from "react"
import { observer, inject } from "mobx-react"
import NavigationBar from "components/groups/NavigationBar"

import "./SettingsView.css"

const { remote } = window.require("electron")
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
  setSoundFontPath
}) {
  return <div className="SettingsView">
    <NavigationBar title="Settings" onClickBack={onClickNavBack}>
    </NavigationBar>
    <div className="content">
      <SettingItem label="SoundFont">
        {soundFontPath} <button onClick={() => openSoundFont(files => {
          if (files && files.length > 0) {
            setSoundFontPath(files[0])
          }
        })}>open</button>
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
  setSoundFontPath: path => {
    s.soundFontPath = path
    synth.loadSoundFont(path)
  }
}))(observer(SettingsView))

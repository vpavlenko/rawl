import React from "react"
import { observer, inject } from "mobx-react"
import NavigationBar from "components/groups/NavigationBar"

import "./SettingsView.css"

function SettingsView({
  onClickNavBack,
  soundFontPath
}) {
  return <div className="SettingsView">
    <NavigationBar title="Settings" onClickBack={onClickNavBack}>
    </NavigationBar>
    <div className="content">
      <dl>
        <dt>SoundFont</dt>
        <dd>{soundFontPath} <button>open</button></dd>
      </dl>
    </div>
  </div>
}

export default inject(({ rootStore: { router, settingsStore: s } }) => ({
  onClickNavBack: () => router.pushArrange(),
  soundFontPath: s.soundFontPath
}))(observer(SettingsView))

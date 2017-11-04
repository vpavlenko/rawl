import React from "react"
import { observer, inject } from "mobx-react"

import NavigationBar from "components/groups/NavigationBar"
import TempoGraph from "./TempoGraph/TempoGraph"

import "./TempoEditor.css"

function TempoEditor({
  track,
  onClickNavBack
}) {
  return <div className="TempoEditor">
    <NavigationBar title="Tempo" onClickBack={onClickNavBack}>
    </NavigationBar>
    <TempoGraph />
  </div>
}

export default inject(({ rootStore: { song, rootViewStore } }) => ({
  track: song.conductorTrack,
  onClickNavBack: () => rootViewStore.isArrangeViewSelected = true
}))(observer(TempoEditor))

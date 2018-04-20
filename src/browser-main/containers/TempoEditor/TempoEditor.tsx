import React, { StatelessComponent } from "react"
import { observer, inject } from "mobx-react"
import { compose } from "recompose"

import NavigationBar from "components/groups/NavigationBar"
import TempoGraph from "./TempoGraph/TempoGraph"

import "./TempoEditor.css"

interface TempoEditorProps {
  onClickNavBack: (any) => void
}

const TempoEditor: StatelessComponent<TempoEditorProps> = ({
  onClickNavBack
}) => {
  return <div className="TempoEditor">
    <NavigationBar title="Tempo" onClickBack={onClickNavBack}>
    </NavigationBar>
    <TempoGraph />
  </div>
}

export default compose(
  inject(({ rootStore: { song, router } }) => ({
    track: song.conductorTrack,
    onClickNavBack: () => router.pushArrange()
  })),
  observer,
)(TempoEditor)

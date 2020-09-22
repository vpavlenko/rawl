import { hot } from "react-hot-loader/root"
import React, { FC } from "react"
import { compose } from "recompose"
import PianoRollEditor from "containers/PianoRollEditor/PianoRollEditor"
import TransportPanel from "../TransportPanel/TransportPanel"
import { BuildInfo } from "main/components/BuildInfo"
import { PianoRollDrawerWrapper } from "../PianoRollEditor/PianoRollDrawer"

import "./Resizer.css"
import "./RootView.css"

const RootView: FC = () => (
  <div className="RootView">
    <PianoRollDrawerWrapper />
    <PianoRollEditor />
    <TransportPanel />
    <BuildInfo />
  </div>
)

export default compose(hot)(RootView)

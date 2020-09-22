import { hot } from "react-hot-loader/root"
import React, { FC } from "react"
import { compose } from "recompose"
import PianoRollEditor from "containers/PianoRollEditor/PianoRollEditor"
import TransportPanel from "../TransportPanel/TransportPanel"
import { BuildInfo } from "main/components/BuildInfo"
import { Drawer } from "../../components/Drawer/Drawer"

import "./Resizer.css"
import "./RootView.css"

const RootView: FC = () => (
  <div className="RootView">
    <Drawer />
    <PianoRollEditor />
    <TransportPanel />
    <BuildInfo />
  </div>
)

export default compose(hot)(RootView)

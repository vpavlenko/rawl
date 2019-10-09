import { hot } from "react-hot-loader/root"
import React, { StatelessComponent } from "react"
import { compose } from "recompose"
import PianoRollEditor from "containers/PianoRollEditor/PianoRollEditor"
import TransportPanel from "../TransportPanel/TransportPanel"

import "./Resizer.css"
import "./RootView.css"

const RootView: StatelessComponent<{}> = ({}) => (
  <div className="RootView">
    <PianoRollEditor />
    <TransportPanel />
  </div>
)

export default compose(hot)(RootView)

import React, { FC } from "react"

import PianoRoll from "./PianoRoll/PianoRoll"
import PianoRollToolbar from "./PianoRollToolbar"
import PianoRollDrawer from "./PianoRollDrawer"

import "./PianoRollEditor.css"

const PianoRollEditor: FC = () => {
  return (
    <div className="PianoRollEditor">
      <PianoRollToolbar />
      <PianoRollDrawer />
      <PianoRoll />
    </div>
  )
}

export default PianoRollEditor

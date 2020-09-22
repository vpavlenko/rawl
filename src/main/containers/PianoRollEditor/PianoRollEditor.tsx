import React, { FC } from "react"

import PianoRoll from "./PianoRoll/PianoRoll"
import PianoRollToolbar from "./PianoRollToolbar"

import "./PianoRollEditor.css"

const PianoRollEditor: FC = () => {
  return (
    <div className="PianoRollEditor">
      <PianoRollToolbar />
      <PianoRoll />
    </div>
  )
}

export default PianoRollEditor

import React, { SFC } from "react"
import plusIcon from "images/plus.svg"
import "./AddTrackButton.css"

export interface AddTrackButtonProps {
  onClick: () => void
}

export const AddTrackButton: SFC<AddTrackButtonProps> = ({ onClick }) => (
  <div className="AddTrackButton" onClick={onClick}>
    <img src={plusIcon} />
  </div>
)

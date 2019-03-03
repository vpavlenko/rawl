import React from "react"
import plusIcon from "images/plus.svg"
import "./AddTrackButton.css"

export default function AddTrackButton({ onClick }) {
  return (
    <div className="AddTrackButton" onClick={onClick}>
      <img src={plusIcon} />
    </div>
  )
}

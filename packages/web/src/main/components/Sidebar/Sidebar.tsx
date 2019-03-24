import React from "react"

import "./Sidebar.css"
import TrackList from "containers/TrackList/TrackList"

// mac では閉じるボタンなどが表示される空白
function TrafficLightsSpace() {
  return <div className="TrafficLightsSpace" />
}

export default function Sidebar() {
  return (
    <div className="Sidebar">
      <TrafficLightsSpace />
      <TrackList />
    </div>
  )
}

import React from "react"
import TrackList from "containers/TrackList/TrackList"

import "./Sidebar.css"

// mac では閉じるボタンなどが表示される空白
function TrafficLightsSpace() {
  return <div className="TrafficLightsSpace">
  </div>
}

export default function Sidebar() {
  return <div className="Sidebar">
    <TrafficLightsSpace />
    <TrackList />
  </div>
}

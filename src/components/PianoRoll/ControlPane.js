import React from "react"
import { pure } from "recompose"

import fitToContainer from "../../hocs/fitToContainer"

import PianoGrid from "./PianoGrid"

import PanGraph from "./Graph/PanGraph"
import PitchGraph from "./Graph/PitchGraph"
import VolumeGraph from "./Graph/VolumeGraph"
import ExpressionGraph from "./Graph/ExpressionGraph"
import ModulationGraph from "./Graph/ModulationGraph"
import PianoVelocityControl from "./PianoVelocityControl/PianoVelocityControl"

import "./ControlPane.css"

const TabBar = pure(({ onmount, buttons }) => {
  return <div className="control-toolbar" ref={onmount}>
    {buttons.map(({ label, selected, onClick }) =>
      <button className={selected ? "selected" : ""} onClick={onClick} key={label}>{label}</button>
    )}
  </div>
})

function ControlPane({
  mode,
  theme,
  beats,
  events,
  dispatch,
  transform,
  scrollLeft,
  paddingBottom,
  containerWidth,
  containerHeight
}) {
  console.log(containerWidth, containerHeight)
  const controlButton = (label, name) => ({
    label,
    selected: mode === name,
    onClick: () => dispatch("SELECT_CONTROL_TAB", { name })
  })

  const TAB_HEIGHT = 30
  const BORDER_WIDTH = 1

  const controlProps = {
    events, transform, dispatch, scrollLeft,
    width: containerWidth - theme.keyWidth - BORDER_WIDTH,
    height: containerHeight - TAB_HEIGHT - paddingBottom,
    color: theme.themeColor
  }

  return <div className="ControlPane">
    <TabBar
      buttons={[
        controlButton("Velocity", "velocity"),
        controlButton("Pitch Bend", "pitchBend"),
        controlButton("Volume", "volume"),
        controlButton("Panpot", "pan"),
        controlButton("Modulation", "modulation"),
        controlButton("Expression", "expression")
      ]}
    />
    <div className="control-content">
      {mode === "velocity" && <PianoVelocityControl {...controlProps} />}
      {mode === "pitchBend" && <PitchGraph {...controlProps} />}
      {mode === "volume" && <VolumeGraph {...controlProps} />}
      {mode === "pan" && <PanGraph {...controlProps} />}
      {mode === "modulation" && <ModulationGraph {...controlProps} />}
      {mode === "expression" && <ExpressionGraph {...controlProps} />}
      <PianoGrid
        width={controlProps.width}
        height={controlProps.height}
        scrollLeft={scrollLeft}
        beats={beats} />
    </div>
  </div>
}

export default fitToContainer(ControlPane, {
  width: "100%",
  height: "100%"
})

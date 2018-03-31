import React from "react"
import { pure, shouldUpdate } from "recompose"
import _ from "lodash"
import sizeMe from "react-sizeme"

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
  onSelectTab,
  dispatch,
  transform,
  scrollLeft,
  paddingBottom,
  size
}) {
  const controlButton = (label, name) => ({
    label,
    selected: mode === name,
    onClick: () => onSelectTab(name)
  })

  const TAB_HEIGHT = 30
  const BORDER_WIDTH = 1

  const containerWidth = size.width
  const containerHeight = size.height

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
        theme={theme}
        width={controlProps.width}
        height={controlProps.height}
        scrollLeft={scrollLeft}
        beats={beats} />
    </div>
  </div>
}

function test(props, nextProps) {
  return props.mode !== nextProps.mode
    || props.scrollLeft !== nextProps.scrollLeft
    || props.paddingBottom !== nextProps.paddingBottom
    || !_.isEqual(props.theme, nextProps.theme)
    || !_.isEqual(props.beats, nextProps.beats)
    || !_.isEqual(props.events, nextProps.events)
    || !_.isEqual(props.onSelectTab, nextProps.onSelectTab)
    || !_.isEqual(props.dispatch, nextProps.dispatch)
    || !_.isEqual(props.transform, nextProps.transform)
}

export default shouldUpdate(test)(sizeMe({ monitorHeight: true })(ControlPane))
import React, { StatelessComponent } from "react"
import { pure, shouldUpdate, compose, Omit } from "recompose"
import _ from "lodash"
import { withSize } from "react-sizeme"

import Theme from "common/theme"
import { NoteCoordTransform } from "common/transform"
import { ISize } from "common/geometry"
import { TrackEvent } from "common/track"
import { BeatWithX } from "helpers/mapBeats"

import PianoGrid from "./PianoGrid"

import PanGraph from "./Graph/PanGraph"
import PitchGraph from "./Graph/PitchGraph"
import VolumeGraph from "./Graph/VolumeGraph"
import ExpressionGraph from "./Graph/ExpressionGraph"
import ModulationGraph from "./Graph/ModulationGraph"
import PianoVelocityControl from "./PianoVelocityControl/PianoVelocityControl"

import "./ControlPane.css"
import Item from "../Stage/Item"

interface ButtonItem {
  label: string
  selected: boolean
  onClick: (e: any) => void
}

interface TabBarProps {
  buttons: ButtonItem[]
}

export type ControlMode =
  | "velocity"
  | "volume"
  | "pitchBend"
  | "expression"
  | "modulation"
  | "pan"

const TabBar = pure(({ buttons }: TabBarProps) => {
  return (
    <div className="control-toolbar">
      {buttons.map(({ label, selected, onClick }) => (
        <button
          className={selected ? "selected" : ""}
          onClick={onClick}
          key={label}
        >
          {label}
        </button>
      ))}
    </div>
  )
})

export interface ControlPaneProps {
  mode: ControlMode
  theme: Theme
  beats: BeatWithX[]
  events: TrackEvent[]
  onSelectTab: (mode: string) => void
  transform: NoteCoordTransform
  scrollLeft: number
  paddingBottom: number
  size: ISize
  changeVelocity: (notes: Item[], velocity: number) => void
  createControlEvent: (mode: ControlMode, value: number, tick?: number) => void
}

const ControlPane: StatelessComponent<ControlPaneProps> = ({
  mode,
  theme,
  beats,
  events,
  onSelectTab,
  transform,
  scrollLeft,
  paddingBottom,
  size,
  changeVelocity,
  createControlEvent
}) => {
  const controlButton = (label: string, name: ControlMode): ButtonItem => ({
    label,
    selected: mode === name,
    onClick: () => onSelectTab(name)
  })

  const TAB_HEIGHT = 30
  const BORDER_WIDTH = 1

  const containerWidth = size.width
  const containerHeight = size.height

  const controlProps = {
    events,
    transform,
    scrollLeft,
    width: containerWidth - theme.keyWidth - BORDER_WIDTH,
    height: containerHeight - TAB_HEIGHT - paddingBottom,
    color: theme.themeColor,
    createEvent: (value: number, tick?: number) =>
      createControlEvent(mode, value, tick)
  }

  return (
    <div className="ControlPane">
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
        {mode === "velocity" && (
          <PianoVelocityControl
            {...controlProps}
            changeVelocity={changeVelocity}
          />
        )}
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
          beats={beats}
        />
      </div>
    </div>
  )
}

function test(props: ControlPaneProps, nextProps: ControlPaneProps) {
  return (
    props.mode !== nextProps.mode ||
    props.scrollLeft !== nextProps.scrollLeft ||
    props.paddingBottom !== nextProps.paddingBottom ||
    !_.isEqual(props.theme, nextProps.theme) ||
    !_.isEqual(props.beats, nextProps.beats) ||
    !_.isEqual(props.events, nextProps.events) ||
    !_.isEqual(props.onSelectTab, nextProps.onSelectTab) ||
    !_.isEqual(props.transform, nextProps.transform)
  )
}

export default compose<ControlPaneProps, Omit<ControlPaneProps, "size">>(
  shouldUpdate(test),
  withSize({ monitorHeight: true })
)(ControlPane)

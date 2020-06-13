import React, { StatelessComponent, SFC } from "react"
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

import VelocityItem from "./PianoVelocityControl/VelocityItem"
import { Stage, Container } from "@inlet/react-pixi"
import styled from "styled-components"
import { filterEventsWithScroll } from "common/helpers/filterEventsWithScroll"

interface ButtonItem {
  label: string
  selected: boolean
  onClick: () => void
}

interface TabBarProps {
  onClick: (mode: ControlMode) => void
  selectedMode: ControlMode
}

export type ControlMode =
  | "velocity"
  | "volume"
  | "pitchBend"
  | "expression"
  | "modulation"
  | "pan"

const TabButton = styled.div`
  min-width: 8em;
  background: transparent;
  -webkit-appearance: none;
  border: none;
  padding: 0.5em 0.8em;
  color: var(--secondary-text-color);
  outline: none;
  text-align: center;

  &.selected {
    font-weight: 600;
    color: var(--text-color);
  }
`

const Toolbar = styled.div`
  border-bottom: 1px solid var(--divider-color);
  box-sizing: border-box;
  display: flex;
  margin-left: var(--key-width);
  border-left: 1px solid var(--secondary-text-color);
  height: 30px;
`

const TabBar: SFC<TabBarProps> = React.memo(({ onClick, selectedMode }) => {
  const controlButton = (label: string, name: ControlMode): ButtonItem => ({
    label,
    selected: selectedMode === name,
    onClick: () => onClick(name),
  })

  const buttons = [
    controlButton("Velocity", "velocity"),
    controlButton("Pitch Bend", "pitchBend"),
    controlButton("Volume", "volume"),
    controlButton("Panpot", "pan"),
    controlButton("Modulation", "modulation"),
    controlButton("Expression", "expression"),
  ]

  return (
    <Toolbar>
      {buttons.map(({ label, selected, onClick }) => (
        <TabButton
          className={selected ? "selected" : ""}
          onClick={onClick}
          key={label}
        >
          {label}
        </TabButton>
      ))}
    </Toolbar>
  )
})

const Parent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--background-color);

  .control-content {
    flex-grow: 1;
    position: relative;

    > canvas,
    > .LineGraph {
      position: absolute;
      top: 0;
      left: 0;
    }
  }
`

export interface ControlPaneProps {
  mode: ControlMode
  theme: Theme
  beats: BeatWithX[]
  events: TrackEvent[]
  onSelectTab: (mode: ControlMode) => void
  transform: NoteCoordTransform
  scrollLeft: number
  paddingBottom: number
  size: ISize
  changeVelocity: (noteIds: number[], velocity: number) => void
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
  createControlEvent,
}) => {
  const TAB_HEIGHT = 30
  const BORDER_WIDTH = 1

  const containerWidth = size.width
  const containerHeight = size.height

  const controlEvents = filterEventsWithScroll(
    events,
    transform.pixelsPerTick,
    scrollLeft,
    size.width
  )

  const controlProps = {
    events: controlEvents,
    transform,
    scrollLeft,
    width: containerWidth - theme.keyWidth - BORDER_WIDTH,
    height: containerHeight - TAB_HEIGHT - paddingBottom,
    color: theme.themeColor,
    createEvent: (value: number, tick?: number) =>
      createControlEvent(mode, value, tick),
  }

  const control = (() => {
    switch (mode) {
      case "velocity":
        return (
          <PianoVelocityControl
            {...controlProps}
            changeVelocity={changeVelocity}
          />
        )
      case "pitchBend":
        return <PitchGraph {...controlProps} />
      case "volume":
        return <VolumeGraph {...controlProps} />
      case "pan":
        return <PanGraph {...controlProps} />
      case "modulation":
        return <ModulationGraph {...controlProps} />
      case "expression":
        return <ExpressionGraph {...controlProps} />
    }
  })()

  return (
    <Parent>
      <TabBar onClick={onSelectTab} selectedMode={mode} />
      <div className="control-content">
        {control}
        <Stage
          style={{
            marginLeft: theme.keyWidth,
            pointerEvents: "none",
          }}
          width={controlProps.width}
          height={controlProps.height}
          options={{ transparent: true }}
        >
          <Container x={-scrollLeft}>
            <PianoGrid height={controlProps.height} beats={beats} />
          </Container>
        </Stage>
      </div>
    </Parent>
  )
}

function areEqual(props: ControlPaneProps, nextProps: ControlPaneProps) {
  return (
    props.size.width === nextProps.size.width &&
    props.size.height === nextProps.size.height &&
    props.mode === nextProps.mode &&
    props.scrollLeft === nextProps.scrollLeft &&
    props.paddingBottom === nextProps.paddingBottom &&
    _.isEqual(props.theme, nextProps.theme) &&
    _.isEqual(props.beats, nextProps.beats) &&
    _.isEqual(props.events, nextProps.events) &&
    _.isEqual(props.onSelectTab, nextProps.onSelectTab) &&
    _.isEqual(props.transform, nextProps.transform)
  )
}

export default React.memo(ControlPane, areEqual)

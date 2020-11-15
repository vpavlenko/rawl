import { Container, Stage } from "@inlet/react-pixi"
import useComponentSize from "@rehooks/component-size"
import { toJS } from "mobx"
import { useObserver } from "mobx-react-lite"
import React, { FC, useCallback, useRef } from "react"
import styled from "styled-components"
import { filterEventsWithScroll } from "../../../common/helpers/filterEventsWithScroll"
import { createBeatsInRange } from "../../../common/helpers/mapBeats"
import { NoteCoordTransform } from "../../../common/transform"
import { changeNotesVelocity, createControlEvent } from "../../actions"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import PianoGrid from "../PianoRoll/PianoGrid"
import ExpressionGraph from "./Graph/ExpressionGraph"
import ModulationGraph from "./Graph/ModulationGraph"
import PanGraph from "./Graph/PanGraph"
import PitchGraph from "./Graph/PitchGraph"
import VolumeGraph from "./Graph/VolumeGraph"
import PianoVelocityControl from "./VelocityControl/VelocityControl"

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
  font-size: 0.7rem;
  cursor: default;

  &:hover {
    background: #ffffff14;
  }

  &.selected {
    color: var(--text-color);
    background: var(--secondary-background-color);
  }
`

const Toolbar = styled.div`
  border-bottom: 1px solid var(--divider-color);
  box-sizing: border-box;
  display: flex;
  margin-left: var(--key-width);
  border-left: 1px solid var(--divider-color);
  height: 30px;
`

const TabBar: FC<TabBarProps> = React.memo(({ onClick, selectedMode }) => {
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

const ControlPane: FC = () => {
  const TAB_HEIGHT = 30
  const BORDER_WIDTH = 1

  const ref = useRef(null)
  const size = useComponentSize(ref)

  const containerWidth = size.width
  const containerHeight = size.height

  const rootStore = useStores()
  const { events, measures, timebase, scaleX, scrollLeft, mode } = useObserver(
    () => ({
      events: toJS(rootStore.song.selectedTrack?.events ?? []),
      measures: rootStore.song.measures,
      timebase: rootStore.services.player.timebase,
      scaleX: rootStore.pianoRollStore.scaleX,
      scrollLeft: rootStore.pianoRollStore.scrollLeft,
      mode: rootStore.pianoRollStore.controlMode,
    })
  )

  const theme = useTheme()
  const transform = new NoteCoordTransform(0.1 * scaleX, theme.keyHeight, 127)
  const startTick = scrollLeft / transform.pixelsPerTick

  const mappedBeats = createBeatsInRange(
    measures,
    transform.pixelsPerTick,
    timebase,
    startTick,
    size.width
  )

  const onSelectTab = useCallback(
    (m: ControlMode) => (rootStore.pianoRollStore.controlMode = m),
    []
  )
  const changeVelocity = useCallback(changeNotesVelocity(rootStore), [])
  const onCreateControlEvent = useCallback(createControlEvent(rootStore), [])

  const controlEvents = filterEventsWithScroll(
    events,
    transform.pixelsPerTick,
    scrollLeft,
    size.width
  ).map((e) => ({ ...e })) // deep copy to react changes

  const controlProps = {
    events: controlEvents,
    transform,
    scrollLeft,
    width: containerWidth - theme.keyWidth - BORDER_WIDTH,
    height: containerHeight - TAB_HEIGHT,
    color: theme.themeColor,
    createEvent: (value: number, tick?: number) =>
      onCreateControlEvent(mode, value, tick),
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
    <Parent ref={ref}>
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
            <PianoGrid height={controlProps.height} beats={mappedBeats} />
          </Container>
        </Stage>
      </div>
    </Parent>
  )
}

export default ControlPane

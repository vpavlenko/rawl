import styled from "@emotion/styled"
import useComponentSize from "@rehooks/component-size"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useRef } from "react"
import { Layout } from "../../Constants"
import { useStores } from "../../hooks/useStores"
import ExpressionGraph from "./Graph/ExpressionGraph"
import HoldPedalGraph from "./Graph/HoldPedalGraph"
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
  | "hold"

const TabButton = styled.div`
  min-width: 8em;
  background: transparent;
  -webkit-appearance: none;
  border: none;
  padding: 0.5em 0.8em;
  color: ${({ theme }) => theme.secondaryTextColor};
  outline: none;
  text-align: center;
  font-size: 0.7rem;
  cursor: default;

  &:hover {
    background: #ffffff14;
  }

  &.selected {
    color: ${({ theme }) => theme.textColor};
    background: ${({ theme }) => theme.secondaryBackgroundColor};
  }
`

const Toolbar = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.dividerColor};
  box-sizing: border-box;
  display: flex;
  margin-left: ${Layout.keyWidth}px;
  border-left: 1px solid ${({ theme }) => theme.dividerColor};
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
    controlButton("Expression", "expression"),
    controlButton("Hold Pedal", "hold"),
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
  background: ${({ theme }) => theme.backgroundColor};

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

const TAB_HEIGHT = 30
const BORDER_WIDTH = 1

const ControlPane: FC = observer(() => {
  const ref = useRef(null)
  const containerSize = useComponentSize(ref)
  const rootStore = useStores()

  const mode = rootStore.pianoRollStore.controlMode

  const onSelectTab = useCallback(
    (m: ControlMode) => (rootStore.pianoRollStore.controlMode = m),
    []
  )

  const controlSize = {
    width: containerSize.width - Layout.keyWidth - BORDER_WIDTH,
    height: containerSize.height - TAB_HEIGHT,
  }

  const control = (() => {
    switch (mode) {
      case "velocity":
        return <PianoVelocityControl {...controlSize} />
      case "pitchBend":
        return <PitchGraph {...controlSize} />
      case "volume":
        return <VolumeGraph {...controlSize} />
      case "pan":
        return <PanGraph {...controlSize} />
      case "modulation":
        return <ModulationGraph {...controlSize} />
      case "expression":
        return <ExpressionGraph {...controlSize} />
      case "hold":
        return <HoldPedalGraph {...controlSize} />
    }
  })()

  return (
    <Parent ref={ref}>
      <TabBar onClick={onSelectTab} selectedMode={mode} />
      <div className="control-content">{control}</div>
    </Parent>
  )
})

export default ControlPane

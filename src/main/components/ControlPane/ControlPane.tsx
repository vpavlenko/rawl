import styled from "@emotion/styled"
import useComponentSize from "@rehooks/component-size"
import { MIDIControlEventNames, MIDIControlEvents } from "midifile-ts"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useRef } from "react"
import {
  ValueEventType,
  isEqualValueEventType,
} from "../../../common/helpers/valueEvent"
import { Localized } from "../../../components/Localized"
import { Layout } from "../../Constants"
import { useStores } from "../../hooks/useStores"
import { ValueEventGraph } from "./Graph/ValueEventGraph"
import PianoVelocityControl from "./VelocityControl/VelocityControl"

interface TabBarProps {
  onClick: (mode: ControlMode) => void
  selectedMode: ControlMode
}

export type ControlMode = { type: "velocity" } | ValueEventType

const isEqualControlMode = (a: ControlMode, b: ControlMode) => {
  switch (a.type) {
    case "velocity":
    case "pitchBend":
      return a.type === b.type
    case "controller":
      switch (b.type) {
        case "velocity":
        case "pitchBend":
          return false
        case "controller":
          return isEqualValueEventType(a, b)
      }
  }
}

const TabButton = styled.div<{ selected: boolean }>`
  min-width: 8em;
  background: transparent;
  -webkit-appearance: none;
  border-bottom: 1px solid;
  border-color: ${({ theme, selected }) =>
    selected ? theme.themeColor : "transparent"};
  padding: 0.5em 0.8em;
  color: ${({ theme, selected }) =>
    selected ? theme.textColor : theme.secondaryTextColor};
  outline: none;
  font-size: 0.75rem;
  cursor: default;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ theme }) => theme.highlightColor};
  }
`

const Toolbar = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.dividerColor};
  box-sizing: border-box;
  display: flex;
  margin-left: ${Layout.keyWidth}px;
  border-left: 1px solid ${({ theme }) => theme.dividerColor};
  height: 2rem;
  flex-shrink: 0;
`

const TabLabel: FC<{ mode: ControlMode }> = ({ mode }) => {
  switch (mode.type) {
    case "velocity":
      return <Localized default="Velocity">velocity</Localized>
    case "pitchBend":
      return <Localized default="Pitch Bend">pitch-bend</Localized>
    case "controller":
      switch (mode.controllerType) {
        case MIDIControlEvents.MSB_MAIN_VOLUME:
          return <Localized default="Volume">volume</Localized>
        case MIDIControlEvents.MSB_PAN:
          return <Localized default="Panpot">panpot</Localized>
        case MIDIControlEvents.MSB_EXPRESSION:
          return <Localized default="Expression">expression</Localized>
        case MIDIControlEvents.SUSTAIN:
          return <Localized default="Hold Pedal">hold-pedal</Localized>
        default:
          return (
            <>
              {MIDIControlEventNames[mode.controllerType] === "Undefined"
                ? `CC${mode.controllerType}`
                : MIDIControlEventNames[mode.controllerType]}
            </>
          )
      }
  }
}

const TabBar: FC<TabBarProps> = React.memo(
  observer(({ onClick, selectedMode }) => {
    const { controlStore } = useStores()
    const { controlModes } = controlStore

    return (
      <Toolbar>
        {controlModes.map((mode, i) => (
          <TabButton
            selected={isEqualControlMode(selectedMode, mode)}
            onClick={() => onClick(mode)}
            key={i}
          >
            <TabLabel mode={mode} />
          </TabButton>
        ))}
      </Toolbar>
    )
  })
)

const Parent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.backgroundColor};
`

const Content = styled.div`
  flex-grow: 1;
  position: relative;

  > canvas,
  > .LineGraph {
    position: absolute;
    top: 0;
    left: 0;
  }
`

const TAB_HEIGHT = 30
const BORDER_WIDTH = 1

const ControlPane: FC = observer(() => {
  const ref = useRef(null)
  const containerSize = useComponentSize(ref)
  const { controlStore } = useStores()
  const { controlMode: mode } = controlStore

  const onSelectTab = useCallback(
    (m: ControlMode) => (controlStore.controlMode = m),
    []
  )

  const controlSize = {
    width: containerSize.width - Layout.keyWidth - BORDER_WIDTH,
    height: containerSize.height - TAB_HEIGHT,
  }

  const control = (() => {
    switch (mode.type) {
      case "velocity":
        return <PianoVelocityControl {...controlSize} />
      default:
        return <ValueEventGraph {...controlSize} type={mode} />
    }
  })()

  return (
    <Parent ref={ref}>
      <TabBar onClick={onSelectTab} selectedMode={mode} />
      <Content>{control}</Content>
    </Parent>
  )
})

export default ControlPane

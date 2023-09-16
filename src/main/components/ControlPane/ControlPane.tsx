import styled from "@emotion/styled"
import useComponentSize from "@rehooks/component-size"
import DotsHorizontalIcon from "mdi-react/DotsHorizontalIcon"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useRef } from "react"
import { Layout } from "../../Constants"
import { useStores } from "../../hooks/useStores"
import { ControlMode, isEqualControlMode } from "../../stores/ControlStore"
import { ControlName } from "./ControlName"
import { ValueEventGraph } from "./Graph/ValueEventGraph"
import PianoVelocityControl from "./VelocityControl/VelocityControl"

interface TabBarProps {
  onClick: (mode: ControlMode) => void
  selectedMode: ControlMode
}

const TabButtonBase = styled.div`
  background: transparent;
  -webkit-appearance: none;
  padding: 0.5em 0.8em;
  color: ${({ theme }) => theme.secondaryTextColor};
  outline: none;
  font-size: 0.75rem;
  cursor: default;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.highlightColor};
  }
`

const TabButton = styled(TabButtonBase)<{ selected: boolean }>`
  width: 8em;
  overflow: hidden;
  border-bottom: 1px solid;
  border-color: ${({ theme, selected }) =>
    selected ? theme.themeColor : "transparent"};
  color: ${({ theme, selected }) =>
    selected ? theme.textColor : theme.secondaryTextColor};
`

const NoWrap = styled.span`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`

const Toolbar = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.dividerColor};
  box-sizing: border-box;
  display: flex;
  margin-left: ${Layout.keyWidth}px;
  border-left: 1px solid ${({ theme }) => theme.dividerColor};
  height: 2rem;
  flex-shrink: 0;
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`

const TabBar: FC<TabBarProps> = React.memo(
  observer(({ onClick, selectedMode }) => {
    const { controlStore, rootViewStore } = useStores()
    const { controlModes } = controlStore

    return (
      <Toolbar>
        {controlModes.map((mode, i) => (
          <TabButton
            selected={isEqualControlMode(selectedMode, mode)}
            onClick={() => onClick(mode)}
            key={i}
          >
            <NoWrap>
              <ControlName mode={mode} />
            </NoWrap>
          </TabButton>
        ))}
        <TabButtonBase
          onClick={() => (rootViewStore.openControlSettingDialog = true)}
        >
          <DotsHorizontalIcon style={{ width: "1rem" }} />
        </TabButtonBase>
      </Toolbar>
    )
  }),
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
    [],
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

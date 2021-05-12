import { FileCopy, Help, List, Schedule, Settings } from "@material-ui/icons"
import React, { FC, useCallback } from "react"
import styled from "styled-components"
import { localized } from "../../../common/localize/localizedString"
import { useStores } from "../../hooks/useStores"
import PianoIcon from "../../images/piano.svg"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--divider-color);
  width: 4rem;
`

const Tab = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border-left: 3px solid transparent;
  border-right: 3px solid transparent;
  padding: 1rem 0;
  font-size: 0.65rem;
  color: var(--secondary-text-color);

  &.active {
    color: var(--text-color);
    border-left-color: var(--theme-color);
  }

  &:hover {
    background-color: var(--secondary-background-color);
  }
`

const InstrumentIcon = styled(PianoIcon)`
  width: 1.3rem;
  fill: currentColor;
`

const Upper = styled.div`
  flex-grow: 1;
`

const Lower = styled.div``

export const Navigation: FC = () => {
  const { rootViewStore } = useStores()

  return (
    <Container>
      <Upper>
        <Tab>
          <FileCopy />
          <span>File</span>
        </Tab>
        <Tab className="active">
          <InstrumentIcon />
          <span>Piano Roll</span>
        </Tab>
        <Tab>
          <List />
          <span>Arrange</span>
        </Tab>
        <Tab>
          <Schedule />
          <span>Tempo</span>
        </Tab>
      </Upper>
      <Lower>
        <Tab>
          <Settings />
          <span>Settings</span>
        </Tab>
        <Tab onClick={useCallback(() => (rootViewStore.openHelp = true), [])}>
          <Help />
          <span>{localized("help", "Help")} </span>
        </Tab>
      </Lower>
    </Container>
  )
}

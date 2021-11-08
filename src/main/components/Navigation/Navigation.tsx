import { Forum, Help, List, Schedule, Settings } from "@mui/icons-material"
import Color from "color"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback } from "react"
import styled from "styled-components"
import { localized } from "../../../common/localize/localizedString"
import { useStores } from "../../hooks/useStores"
import Logo from "../../images/logo-circle.svg"
import PianoIcon from "../../images/piano.svg"
import { FileMenuButton } from "./FileMenuButton"

const BannerContainer = styled.div`
  background: var(--theme-color);
  padding: 0 16px;
  height: 3rem;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  a {
    display: flex;
  }
`

const LogoIcon = styled(Logo)`
  width: 1.5rem;
`

const Container = styled.div`
  display: flex;
  flex-direction: row;
  background: ${({ theme }) => Color(theme.backgroundColor).darken(0.2).hex()};
`

export const Tab = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center; 
  padding: 0.5rem 1rem;
  font-size: 0.7rem;
  border-top: solid 0.1rem transparent;
  color: var(--secondary-text-color);

  &.active {
    color: var(--text-color);
    background: var(--background-color);
    border-top-color: var(--theme-color);
  }

  &:hover {
    background: ${({ theme }) =>
      Color(theme.backgroundColor).darken(0.1).hex()};
  }

  > svg {
    margin-right: 0.4rem;
  }
}
`

const InstrumentIcon = styled(PianoIcon)`
  width: 1.3rem;
  fill: currentColor;
`

const FlexibleSpacer = styled.div`
  flex-grow: 1;
`

const Separator = styled.div`
  background: var(--divider-color);
  margin: 0.5rem 0.5rem;
  width: 1px;
`

export const Navigation: FC = observer(() => {
  const { rootViewStore, router } = useStores()

  return (
    <Container>
      <FileMenuButton />

      <Separator />

      <Tab
        className={router.path === "/track" ? "active" : undefined}
        onClick={useCallback(() => (router.path = "/track"), [])}
      >
        <InstrumentIcon viewBox="0 0 24 24" />
        <span>{localized("piano-roll", "Piano Roll")}</span>
      </Tab>
      <Tab
        className={router.path === "/arrange" ? "active" : undefined}
        onClick={useCallback(() => (router.path = "/arrange"), [])}
      >
        <List />
        <span>{localized("arrange", "Arrange")}</span>
      </Tab>
      <Tab
        className={router.path === "/tempo" ? "active" : undefined}
        onClick={useCallback(() => (router.path = "/tempo"), [])}
      >
        <Schedule />
        <span>{localized("tempo", "Tempo")}</span>
      </Tab>

      <FlexibleSpacer />

      <Tab
        onClick={useCallback(() => (rootViewStore.openDeviceDialog = true), [])}
      >
        <Settings />
        <span>{localized("settings", "Settings")}</span>
      </Tab>
      <Tab onClick={useCallback(() => (rootViewStore.openHelp = true), [])}>
        <Help />
        <span>{localized("help", "Help")} </span>
      </Tab>
      <Tab id="open-gitter-button">
        <Forum />
        <span>{localized("open-chat", "Open Chat")} </span>
      </Tab>
    </Container>
  )
})

import {
  Help,
  InsertDriveFileOutlined,
  List,
  Schedule,
  Settings,
} from "@material-ui/icons"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback } from "react"
import styled from "styled-components"
import { localized } from "../../../common/localize/localizedString"
import { useStores } from "../../hooks/useStores"
import Logo from "../../images/logo-circle.svg"
import PianoIcon from "../../images/piano.svg"

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
  flex-direction: column;
  border-right: 1px solid var(--divider-color);
  width: 4rem;
`

const Tab = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border-left: 2px solid transparent;
  border-right: 2px solid transparent;
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

export const Navigation: FC = observer(() => {
  const { rootViewStore, router } = useStores()

  return (
    <Container>
      <Upper>
        {/* <BannerContainer>
          <a href="/">
            <LogoIcon
              viewBox="0 0 99 99"
              width={undefined}
              height={undefined}
            />
          </a>
        </BannerContainer> */}
        <Tab onClick={useCallback(() => (rootViewStore.openDrawer = true), [])}>
          <InsertDriveFileOutlined />
          <span>File</span>
        </Tab>
        <Tab
          className={router.path === "/track" ? "active" : undefined}
          onClick={useCallback(() => (router.path = "/track"), [])}
        >
          <InstrumentIcon />
          <span>Piano Roll</span>
        </Tab>
        <Tab
          className={router.path === "/arrange" ? "active" : undefined}
          onClick={useCallback(() => (router.path = "/arrange"), [])}
        >
          <List />
          <span>Arrange</span>
        </Tab>
        <Tab
          className={router.path === "/tempo" ? "active" : undefined}
          onClick={useCallback(() => (router.path = "/tempo"), [])}
        >
          <Schedule />
          <span>Tempo</span>
        </Tab>
      </Upper>
      <Lower>
        <Tab
          onClick={useCallback(
            () => (rootViewStore.openDeviceDialog = true),
            []
          )}
        >
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
})

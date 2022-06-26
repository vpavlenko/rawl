import styled from "@emotion/styled"
import { Forum, Help, Settings } from "@mui/icons-material"
import { Tooltip } from "@mui/material"
import Color from "color"
import { observer } from "mobx-react-lite"
import { FC, useCallback } from "react"
import { localized } from "../../../common/localize/localizedString"
import { useStores } from "../../hooks/useStores"
import ArrangeIcon from "../../images/icons/arrange.svg"
import PianoIcon from "../../images/icons/piano.svg"
import TempoIcon from "../../images/icons/tempo.svg"
import Logo from "../../images/logo-circle.svg"
import { FileMenuButton } from "./FileMenuButton"

const BannerContainer = styled.div`
  background: ${({ theme }) => theme.themeColor};
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
  color: ${({ theme }) => theme.secondaryTextColor};

  &.active {
    color: ${({ theme }) => theme.textColor};
    background: ${({ theme }) => theme.backgroundColor};
    border-top-color: ${({ theme }) => theme.themeColor};
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

const FlexibleSpacer = styled.div`
  flex-grow: 1;
`

const Separator = styled.div`
  background: ${({ theme }) => theme.dividerColor};
  margin: 0.5rem 0.5rem;
  width: 1px;
`

export const Navigation: FC = observer(() => {
  const { rootViewStore, router } = useStores()

  return (
    <Container>
      <FileMenuButton />

      <Separator />

      <Tooltip
        title={`${localized("switch-tab", "Switch Tab")} [Cmd+1]`}
        placement="bottom"
        enterDelay={300}
        enterNextDelay={500}
      >
        <Tab
          className={router.path === "/track" ? "active" : undefined}
          onClick={useCallback(() => (router.path = "/track"), [])}
        >
          <PianoIcon
            style={{
              width: "1.3rem",
              height: "1.3rem",
              fill: "currentColor",
            }}
            viewBox="0 0 128 128"
          />
          <span>{localized("piano-roll", "Piano Roll")}</span>
        </Tab>
      </Tooltip>

      <Tooltip
        title={`${localized("switch-tab", "Switch Tab")} [Cmd+2]`}
        placement="bottom"
        enterDelay={300}
        enterNextDelay={500}
      >
        <Tab
          className={router.path === "/arrange" ? "active" : undefined}
          onClick={useCallback(() => (router.path = "/arrange"), [])}
        >
          <ArrangeIcon
            style={{
              width: "1.3rem",
              height: "1.3rem",
              fill: "currentColor",
            }}
            viewBox="0 0 128 128"
          />
          <span>{localized("arrange", "Arrange")}</span>
        </Tab>
      </Tooltip>

      <Tooltip
        title={`${localized("switch-tab", "Switch Tab")} [Cmd+3]`}
        placement="bottom"
        enterDelay={300}
        enterNextDelay={500}
      >
        <Tab
          className={router.path === "/tempo" ? "active" : undefined}
          onClick={useCallback(() => (router.path = "/tempo"), [])}
        >
          <TempoIcon
            style={{
              width: "1.3rem",
              height: "1.3rem",
              fill: "currentColor",
            }}
            viewBox="0 0 128 128"
          />
          <span>{localized("tempo", "Tempo")}</span>
        </Tab>
      </Tooltip>

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

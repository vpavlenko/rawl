import styled from "@emotion/styled"
import Color from "color"
import Forum from "mdi-react/ForumIcon"
import Help from "mdi-react/HelpCircleIcon"
import Settings from "mdi-react/SettingsIcon"
import { observer } from "mobx-react-lite"
import { CSSProperties, FC, useCallback } from "react"
import { envString } from "../../../common/localize/envString"
import { Localized } from "../../../components/Localized"
import { Tooltip } from "../../../components/Tooltip"
import { useStores } from "../../hooks/useStores"
import ArrangeIcon from "../../images/icons/arrange.svg"
import PianoIcon from "../../images/icons/piano.svg"
import TempoIcon from "../../images/icons/tempo.svg"
import Logo from "../../images/logo-circle.svg"
import { FileMenuButton } from "./FileMenuButton"
import { UserButton } from "./UserButton"

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
  height: 3rem;
  flex-shrink: 0;
`

export const Tab = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center; 
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  border-top: solid 0.1rem transparent;
  color: ${({ theme }) => theme.secondaryTextColor};

  &.active {
    color: ${({ theme }) => theme.textColor};
    background: ${({ theme }) => theme.backgroundColor};
    border-top-color: ${({ theme }) => theme.themeColor};
  }

  &:hover {
    background: ${({ theme }) => theme.highlightColor};
  }

  a {
    color: inherit;
    text-decoration: none;
  }
}
`

export const TabTitle = styled.span`
  margin-left: 0.5rem;

  @media (max-width: 850px) {
    display: none;
  }
`

const FlexibleSpacer = styled.div`
  flex-grow: 1;
`

export const IconStyle: CSSProperties = {
  width: "1.3rem",
  height: "1.3rem",
  fill: "currentColor",
}

export const Navigation: FC = observer(() => {
  const {
    rootViewStore,
    authStore: { user },
    router,
  } = useStores()

  return (
    <Container>
      <FileMenuButton />

      <Tooltip
        title={
          <>
            <Localized default="Switch Tab">switch-tab</Localized> [
            {envString.cmdOrCtrl}+1]
          </>
        }
        delayDuration={500}
      >
        <Tab
          className={router.path === "/track" ? "active" : undefined}
          onClick={useCallback(() => (router.path = "/track"), [])}
        >
          <PianoIcon style={IconStyle} viewBox="0 0 128 128" />
          <TabTitle>
            <Localized default="Piano Roll">piano-roll</Localized>
          </TabTitle>
        </Tab>
      </Tooltip>

      <Tooltip
        title={
          <>
            <Localized default="Switch Tab">switch-tab</Localized> [
            {envString.cmdOrCtrl}+2]
          </>
        }
        delayDuration={500}
      >
        <Tab
          className={router.path === "/arrange" ? "active" : undefined}
          onClick={useCallback(() => (router.path = "/arrange"), [])}
        >
          <ArrangeIcon style={IconStyle} viewBox="0 0 128 128" />
          <TabTitle>
            <Localized default="Arrange">arrange</Localized>
          </TabTitle>
        </Tab>
      </Tooltip>

      <Tooltip
        title={
          <>
            <Localized default="Switch Tab">switch-tab</Localized> [
            {envString.cmdOrCtrl}+3]
          </>
        }
        delayDuration={500}
      >
        <Tab
          className={router.path === "/tempo" ? "active" : undefined}
          onClick={useCallback(() => (router.path = "/tempo"), [])}
        >
          <TempoIcon style={IconStyle} viewBox="0 0 128 128" />
          <TabTitle>
            <Localized default="Tempo">tempo</Localized>
          </TabTitle>
        </Tab>
      </Tooltip>

      <FlexibleSpacer />

      <Tab
        onClick={useCallback(
          () => (rootViewStore.openSettingDialog = true),
          [],
        )}
      >
        <Settings style={IconStyle} />
        <TabTitle>
          <Localized default="Settings">settings</Localized>
        </TabTitle>
      </Tab>

      <Tab onClick={useCallback(() => (rootViewStore.openHelp = true), [])}>
        <Help style={IconStyle} />
        <TabTitle>
          <Localized default="Help">help</Localized>
        </TabTitle>
      </Tab>

      <Tab>
        <Forum style={IconStyle} />
        <TabTitle>
          <a href="https://discord.gg/XQxzNdDJse" target="_blank">
            Discord
          </a>
        </TabTitle>
      </Tab>

      <UserButton />
    </Container>
  )
})

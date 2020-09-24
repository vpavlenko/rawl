import { hot } from "react-hot-loader/root"
import React, { FC } from "react"
import { PianoRollEditor } from "components/PianoRoll/PianoRollEditor"
import { BuildInfo } from "main/components/BuildInfo"
import { Drawer } from "../../components/Drawer/Drawer"
import { TransportPanel } from "main/components/TransportPanel/TransportPanel"
import styled from "styled-components"

import "./Resizer.css"
import { useStores } from "../../hooks/useStores"
import { useObserver } from "mobx-react"
import { TempoEditor } from "../TempoGraph/TempoEditor"
import { ArrangeEditor } from "../ArrangeEditor/ArrangeEditor"
import { SettingsView } from "../SettingsView/SettingsView"

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`

const Routes: FC = () => {
  const stores = useStores()
  const { path } = useObserver(() => ({ path: stores.rootStore.router.path }))
  return (
    <>
      {path === "/track" && <PianoRollEditor />}
      {path === "/tempo" && <TempoEditor />}
      {path === "/arrange" && <ArrangeEditor />}
      {path === "/settings" && <SettingsView />}
    </>
  )
}

const RootView: FC = () => (
  <Container>
    <Drawer />
    <Routes />
    <TransportPanel />
    <BuildInfo />
  </Container>
)

export default hot(RootView)

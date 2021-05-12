import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import styled from "styled-components"
import { Drawer } from "../../components/Drawer/Drawer"
import { useStores } from "../../hooks/useStores"
import { ArrangeEditor } from "../ArrangeView/ArrangeEditor"
import { BuildInfo } from "../BuildInfo"
import { TrackListDrawer } from "../Drawer/TrackListDrawer"
import { EventEditor } from "../EventEditor/EventEditor"
import { HelpDialog } from "../Help/HelpDialog"
import { MIDIDeviceDialog } from "../MIDIDeviceView/MIDIDeviceDialog"
import { Navigation } from "../Navigation/Navigation"
import { PianoRollEditor } from "../PianoRoll/PianoRollEditor"
import { TempoEditor } from "../TempoGraph/TempoEditor"
import { TransportPanel } from "../TransportPanel/TransportPanel"

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const Column = styled.div`
  height: 100%;
  display: flex;
  flex-grow: 1;
`

const Routes: FC = observer(() => {
  const { router } = useStores()
  const path = router.path
  return (
    <>
      {path === "/track" && <PianoRollEditor />}
      {path === "/tempo" && <TempoEditor />}
      {path === "/arrange" && <ArrangeEditor />}
    </>
  )
})

export const RootView: FC = () => (
  <Column>
    <Navigation />
    <Container>
      <Drawer />
      <TrackListDrawer />
      <Routes />
      <TransportPanel />
      <BuildInfo />
      <HelpDialog />
      <MIDIDeviceDialog />
      <EventEditor />
    </Container>
  </Column>
)

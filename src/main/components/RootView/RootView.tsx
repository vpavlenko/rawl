import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import styled from "styled-components"
import { Drawer } from "../../components/Drawer/Drawer"
import { useStores } from "../../hooks/useStores"
import { ArrangeEditor } from "../ArrangeView/ArrangeEditor"
import { BuildInfo } from "../BuildInfo"
import { EventEditor } from "../EventEditor/EventEditor"
import { HelpDialog } from "../Help/HelpDialog"
import { MIDIDeviceDialog } from "../MIDIDeviceView/MIDIDeviceDialog"
import { PianoRollEditor } from "../PianoRoll/PianoRollEditor"
import { TempoEditor } from "../TempoGraph/TempoEditor"
import { TransportPanel } from "../TransportPanel/TransportPanel"

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
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
  <Container>
    <Drawer />
    <Routes />
    <TransportPanel />
    <BuildInfo />
    <HelpDialog />
    <MIDIDeviceDialog />
    <EventEditor />
  </Container>
)

import styled from "@emotion/styled"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { useStores } from "../../hooks/useStores"
import { ArrangeEditor } from "../ArrangeView/ArrangeEditor"
import { BuildInfo } from "../BuildInfo"
import { CloudFileDialog } from "../CloudFileDialog/CloudFileDialog"
import { ActionDialog } from "../Dialog/ActionDialog"
import { PromptDialog } from "../Dialog/PromptDialog"
import { EventEditor } from "../EventEditor/EventEditor"
import { ExportDialog } from "../ExportDialog/ExportDialog"
import { ExportProgressDialog } from "../ExportDialog/ExportProgressDialog"
import { Head } from "../Head/Head"
import { HelpDialog } from "../Help/HelpDialog"
import { MIDIDeviceDialog } from "../MIDIDeviceView/MIDIDeviceDialog"
import { Navigation } from "../Navigation/Navigation"
import { OnBeforeUnload } from "../OnBeforeUnload/OnBeforeUnload"
import { PianoRollEditor } from "../PianoRoll/PianoRollEditor"
import { SignInDialog } from "../SignInDialog/SignInDialog"
import { TempoEditor } from "../TempoGraph/TempoEditor"
import { Toast } from "../Toast/Toast"
import { TransportPanel } from "../TransportPanel/TransportPanel"
import { ArrangeTransposeDialog } from "../TransposeDialog/ArrangeTransposeDialog"
import { PianoRollTransposeDialog } from "../TransposeDialog/PianoRollTransposeDialog"

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
`

const Column = styled.div`
  height: 100%;
  display: flex;
  flex-grow: 1;
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
  <>
    <Column>
      <Navigation />
      <Container>
        <Routes />
        <TransportPanel />
        <BuildInfo />
        <EventEditor />
      </Container>
    </Column>
    <HelpDialog />
    <MIDIDeviceDialog />
    <ExportDialog />
    <ExportProgressDialog />
    <PianoRollTransposeDialog />
    <ArrangeTransposeDialog />
    <Toast />
    <Head />
    <SignInDialog />
    <CloudFileDialog />
    <ActionDialog />
    <PromptDialog />
    <OnBeforeUnload />
  </>
)

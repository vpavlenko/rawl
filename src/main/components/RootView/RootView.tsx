import styled from "@emotion/styled"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { useStores } from "../../hooks/useStores"
import { ArrangeEditor } from "../ArrangeView/ArrangeEditor"
import { BuildInfo } from "../BuildInfo"
import { CloudFileDialog } from "../CloudFileDialog/CloudFileDialog"
import { ControlSettingDialog } from "../ControlSettingDialog/ControlSettingDialog"
import { ExportDialog } from "../ExportDialog/ExportDialog"
import { ExportProgressDialog } from "../ExportDialog/ExportProgressDialog"
import { Head } from "../Head/Head"
import { HelpDialog } from "../Help/HelpDialog"
import { InitializeErrorDialog } from "../InitializeErrorDialog/InitializeErrorDialog"
import { Navigation } from "../Navigation/Navigation"
import { OnBeforeUnload } from "../OnBeforeUnload/OnBeforeUnload"
import { PianoRollEditor } from "../PianoRoll/PianoRollEditor"
import { SettingDialog } from "../SettingDialog/SettingDialog"
import { SignInDialog } from "../SignInDialog/SignInDialog"
import { TempoEditor } from "../TempoGraph/TempoEditor"
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
      </Container>
    </Column>
    <HelpDialog />
    <ExportDialog />
    <ExportProgressDialog />
    <PianoRollTransposeDialog />
    <ArrangeTransposeDialog />
    <Head />
    <SignInDialog />
    <CloudFileDialog />
    <SettingDialog />
    <ControlSettingDialog />
    <InitializeErrorDialog />
    <OnBeforeUnload />
  </>
)

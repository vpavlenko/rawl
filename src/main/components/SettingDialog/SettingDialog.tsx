import styled from "@emotion/styled"
import { observer } from "mobx-react-lite"
import { FC, useCallback, useState } from "react"
import { Button } from "../../../components/Button"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "../../../components/Dialog"
import { Localized } from "../../../components/Localized"
import { useStores } from "../../hooks/useStores"
import { GeneralSettingsView } from "./GeneralSettingsView"
import { MIDIDeviceView } from "./MIDIDeviceView/MIDIDeviceView"
import { SettingNavigation, SettingRoute } from "./SettingNavigation"
import { SoundFontSettingsView } from "./SoundFontSettingView"

const RouteContent: FC<{ route: SettingRoute }> = ({ route }) => {
  switch (route) {
    case "general":
      return <GeneralSettingsView />
    case "midi":
      return <MIDIDeviceView />
    case "soundfont":
      return <SoundFontSettingsView />
  }
}
const Content = styled.div`
  min-width: 20rem;
  min-height: 20rem;
`

export const SettingDialog: FC = observer(() => {
  const rootStore = useStores()
  const { rootViewStore } = rootStore
  const { openSettingDialog: open } = rootViewStore
  const [route, setRoute] = useState<SettingRoute>("general")

  const onClose = useCallback(
    () => (rootViewStore.openSettingDialog = false),
    [rootViewStore],
  )

  return (
    <Dialog open={open} onOpenChange={onClose} style={{ minWidth: "20rem" }}>
      <DialogTitle>
        <Localized default="Settings">settings</Localized>
      </DialogTitle>
      <DialogContent style={{ display: "flex", flexDirection: "row" }}>
        <SettingNavigation route={route} onChange={setRoute} />
        <Content>
          <RouteContent route={route} />
        </Content>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          <Localized default="Close">close</Localized>
        </Button>
      </DialogActions>
    </Dialog>
  )
})

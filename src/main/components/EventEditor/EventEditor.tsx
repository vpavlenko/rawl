import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { localized } from "../../../common/localize/localizedString"
import { useStores } from "../../hooks/useStores"
import EventList from "./EventList"

export const EventEditor: FC = observer(() => {
  const { rootViewStore } = useStores()
  const rootStore = useStores()
  const isOpen = rootViewStore.openEventEditor

  const close = () => (rootViewStore.openEventEditor = false)
  const onClickOK = close
  const onClickCancel = close
  return (
    <Dialog open={isOpen} onClose={close}>
      <DialogTitle>{localized("midi-settings", "MIDI Settings")}</DialogTitle>
      <DialogContent>
        <EventList />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClickOK}>{localized("ok", "OK")}</Button>
        <Button onClick={onClickCancel}>{localized("cancel", "Cancel")}</Button>
      </DialogActions>
    </Dialog>
  )
})

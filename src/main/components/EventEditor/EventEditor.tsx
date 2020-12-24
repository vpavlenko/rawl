import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core"
import { useObserver } from "mobx-react-lite"
import React, { FC } from "react"
import { localized } from "../../../common/localize/localizedString"
import { useStores } from "../../hooks/useStores"
import EventList from "./EventList"

export const EventEditor: FC = () => {
  const { rootViewStore } = useStores()
  const rootStore = useStores()
  const { isOpen, events } = useObserver(() => ({
    isOpen: rootViewStore.openEventEditor,
    events: rootStore.song?.selectedTrack?.events ?? [],
  }))
  const close = () => (rootViewStore.openEventEditor = false)
  const onClickOK = close
  const onClickCancel = close
  return (
    <Dialog open={isOpen} onClose={close}>
      <DialogTitle>{localized("midi-settings", "MIDI Settings")}</DialogTitle>
      <DialogContent>
        <EventList events={events} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClickOK}>{localized("ok", "OK")}</Button>
        <Button onClick={onClickCancel}>{localized("cancel", "Cancel")}</Button>
      </DialogActions>
    </Dialog>
  )
}

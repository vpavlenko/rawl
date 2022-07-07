import { Alert } from "@mui/material"
import Snackbar from "@mui/material/Snackbar"
import { observer } from "mobx-react-lite"
import * as React from "react"
import { FC } from "react"
import { useStores } from "../../hooks/useStores"
import { ToastMessage } from "../../stores/ToastStore"

// https://mui.com/material-ui/react-snackbar/#consecutive-snackbars
export const Toast: FC = observer(() => {
  const { toastStore } = useStores()
  const { messages } = toastStore
  const [open, setOpen] = React.useState(false)
  const [messageInfo, setMessageInfo] = React.useState<
    ToastMessage | undefined
  >(undefined)

  React.useEffect(() => {
    if (messages.length && !messageInfo) {
      // Set a new snack when we don't have an active one
      setMessageInfo({ ...messages[0] })
      toastStore.messages = toastStore.messages.slice(1)
      setOpen(true)
    } else if (messages.length && messageInfo && open) {
      // Close an active snack when a new one is added
      setOpen(false)
    }
  }, [messages, messageInfo, open])

  const handleClose = (
    _event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return
    }
    setOpen(false)
  }

  const handleExited = () => {
    setMessageInfo(undefined)
  }

  return (
    <Snackbar
      key={messageInfo ? messageInfo.key : undefined}
      open={open}
      autoHideDuration={5000}
      onClose={handleClose}
      TransitionProps={{ onExited: handleExited }}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert severity={messageInfo?.severity}>{messageInfo?.message}</Alert>
    </Snackbar>
  )
})

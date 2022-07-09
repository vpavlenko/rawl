import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material"
import { observer } from "mobx-react-lite"
import { useCallback } from "react"
import { useStores } from "../../hooks/useStores"

export const ActionDialog = observer(() => {
  const rootStore = useStores()
  const {
    dialogStore,
    dialogStore: { props },
  } = rootStore

  const onClose = useCallback(() => (dialogStore.props = null), [])

  if (props === null) {
    return <></>
  }

  return (
    <Dialog
      open={props !== null}
      onClose={onClose}
      keepMounted={false}
      maxWidth="xs"
    >
      <DialogTitle>{props.title}</DialogTitle>
      {props.message && <DialogContent>{props.message}</DialogContent>}
      <DialogActions>
        {props.actions.map((action) => (
          <Button
            onClick={() => {
              props.callback(action.key)
              onClose()
            }}
          >
            {action.title}
          </Button>
        ))}
      </DialogActions>
    </Dialog>
  )
})

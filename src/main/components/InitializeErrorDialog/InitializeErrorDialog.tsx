import { observer } from "mobx-react-lite"
import { FC, useCallback } from "react"
import { Button } from "../../../components/Button"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "../../../components/Dialog"
import { Localized } from "../../../components/Localized"
import { useStores } from "../../hooks/useStores"

export const InitializeErrorDialog: FC = observer(() => {
  const { rootViewStore } = useStores()
  const { initializeError, openInitializeErrorDialog } = rootViewStore

  const onClose = useCallback(
    () => (rootViewStore.openInitializeErrorDialog = false),
    [rootViewStore],
  )

  return (
    <Dialog open={openInitializeErrorDialog} onOpenChange={onClose}>
      <DialogTitle>
        <Localized default="Error occured in launch process">
          initialize-error
        </Localized>
      </DialogTitle>
      <DialogContent>{initializeError?.message ?? ""}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          <Localized default="Close">close</Localized>
        </Button>
      </DialogActions>
    </Dialog>
  )
})

import { observer } from "mobx-react-lite"
import { useCallback } from "react"
import { Button } from "../../../components/Button"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "../../../components/Dialog"
import { Localized } from "../../../components/Localized"
import { useStores } from "../../hooks/useStores"
import { CloudFileList } from "./CloudFileList"

export const CloudFileDialog = observer(() => {
  const rootStore = useStores()
  const {
    rootViewStore,
    rootViewStore: { openCloudFileDialog },
  } = rootStore

  const onClose = useCallback(
    () => (rootViewStore.openCloudFileDialog = false),
    [rootViewStore],
  )

  return (
    <Dialog open={openCloudFileDialog} onOpenChange={onClose}>
      <DialogTitle>
        <Localized default="Files">files</Localized>
      </DialogTitle>
      <DialogContent>
        <CloudFileList />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          <Localized default="Close">close</Localized>
        </Button>
      </DialogActions>
    </Dialog>
  )
})

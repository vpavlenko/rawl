import { observer } from "mobx-react-lite"
import { useCallback } from "react"
import { localized } from "../../../common/localize/localizedString"
import { Button } from "../../../components/Button"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "../../../components/Dialog"
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
    [rootViewStore]
  )

  return (
    <Dialog open={openCloudFileDialog} onOpenChange={onClose}>
      <DialogTitle>{localized("files", "Files")}</DialogTitle>
      <DialogContent>
        <CloudFileList />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{localized("close", "Close")}</Button>
      </DialogActions>
    </Dialog>
  )
})

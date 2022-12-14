import { observer } from "mobx-react-lite"
import { FC, useCallback } from "react"
import { Button } from "../../../components/Button"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "../../../components/Dialog"
import { LinearProgress } from "../../../components/LinearProgress"
import { Localized } from "../../../components/Localized"
import { cancelExport } from "../../actions"
import { useStores } from "../../hooks/useStores"

export const ExportProgressDialog: FC = observer(() => {
  const rootStore = useStores()
  const { exportStore } = rootStore
  const { openExportProgressDialog: open, progress } = exportStore

  const onClickCancel = useCallback(() => {
    exportStore.openExportProgressDialog = false
    cancelExport(rootStore)()
  }, [])

  return (
    <Dialog open={open} style={{ minWidth: "20rem" }}>
      <DialogTitle>
        <Localized default="Exporting Audio...">exporting-audio</Localized>
      </DialogTitle>
      <DialogContent>
        <LinearProgress value={progress} max={1} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClickCancel}>
          <Localized default="Cancel">cancel</Localized>
        </Button>
      </DialogActions>
    </Dialog>
  )
})

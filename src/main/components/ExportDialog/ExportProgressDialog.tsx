import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
} from "@mui/material"
import { observer } from "mobx-react-lite"
import { useCallback, VFC } from "react"
import { localized } from "../../../common/localize/localizedString"
import { cancelExport } from "../../actions"
import { useStores } from "../../hooks/useStores"

export const ExportProgressDialog: VFC = observer(() => {
  const rootStore = useStores()
  const { exportStore } = rootStore
  const { openExportProgressDialog: open, progress } = exportStore

  const onClickCancel = useCallback(() => {
    exportStore.openExportProgressDialog = false
    cancelExport(rootStore)()
  }, [])

  return (
    <Dialog open={open} fullWidth maxWidth="xs">
      <DialogTitle>
        {localized("exporting-audio", "Exporting Audio...")}
      </DialogTitle>
      <DialogContent>
        <LinearProgress variant="determinate" value={progress * 100} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClickCancel}>{localized("cancel", "Cancel")}</Button>
      </DialogActions>
    </Dialog>
  )
})

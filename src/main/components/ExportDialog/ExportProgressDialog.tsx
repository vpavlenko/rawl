import { Button, LinearProgress } from "@mui/material"
import { observer } from "mobx-react-lite"
import { useCallback, VFC } from "react"
import { localized } from "../../../common/localize/localizedString"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "../../../components/Dialog"
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
    <Dialog open={open} style={{ minWidth: "20rem" }}>
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

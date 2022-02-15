import { Alert } from "@mui/lab"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material"
import { observer } from "mobx-react-lite"
import { useCallback, useEffect, useState, VFC } from "react"
import { localized } from "../../../common/localize/localizedString"
import { canExport, exportSongAsWav } from "../../actions"
import { useStores } from "../../hooks/useStores"

export const ExportDialog: VFC = observer(() => {
  const rootStore = useStores()
  const { exportStore, song } = rootStore
  const { openExportDialog: open } = exportStore
  const onClose = useCallback(
    () => (exportStore.openExportDialog = false),
    [exportStore]
  )

  const onClickExport = useCallback(() => {
    exportStore.openExportDialog = false
    exportSongAsWav(rootStore)()
  }, [rootStore, exportStore])

  const [exportEnabled, setExportEnabled] = useState(false)
  useEffect(() => {
    if (open) {
      setExportEnabled(canExport(song))
    }
  }, [open])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{localized("export-audio", "Export Audio")}</DialogTitle>
      <DialogContent>
        <p>{localized("file-type", "File Type")}: WAV</p>
        {!exportEnabled && (
          <Alert severity="warning">
            {localized("export-error-too-short", "Songs are too short")}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{localized("close", "Close")}</Button>
        {exportEnabled && (
          <Button onClick={onClickExport} color="primary" variant="contained">
            {localized("export", "Export")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
})

import { observer } from "mobx-react-lite"
import { FC, useCallback, useEffect, useState } from "react"
import { localized } from "../../../common/localize/localizedString"
import { Alert } from "../../../components/Alert"
import { Button, PrimaryButton } from "../../../components/Button"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "../../../components/Dialog"
import { canExport, exportSongAsWav } from "../../actions"
import { useStores } from "../../hooks/useStores"

export const ExportDialog: FC = observer(() => {
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
    <Dialog open={open} onOpenChange={onClose} style={{ minWidth: "20rem" }}>
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
          <PrimaryButton onClick={onClickExport}>
            {localized("export", "Export")}
          </PrimaryButton>
        )}
      </DialogActions>
    </Dialog>
  )
})

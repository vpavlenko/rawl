import { Divider, MenuItem } from "@mui/material"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { localized } from "../../../common/localize/localizedString"
import { createSong } from "../../actions"
import { openFile, saveFile, saveFileAs } from "../../actions/file"
import { useStores } from "../../hooks/useStores"

export const FileMenu: FC<{ close: () => void }> = observer(({ close }) => {
  const rootStore = useStores()

  const onClickNew = () => {
    const { song } = rootStore
    close()
    if (
      song.isSaved ||
      confirm(localized("confirm-new", "Are you sure you want to continue?"))
    ) {
      createSong(rootStore)()
    }
  }

  const onClickOpen = async () => {
    const { song } = rootStore
    close()
    try {
      if (
        song.isSaved ||
        confirm(localized("confirm-new", "Are you sure you want to continue?"))
      ) {
        await openFile(rootStore)
      }
    } catch (e) {
      rootStore.toastStore.showError((e as Error).message)
    }
  }

  const onClickSave = async () => {
    close()
    await saveFile(rootStore)
  }

  const onClickSaveAs = async () => {
    close()
    await saveFileAs(rootStore)
  }

  return (
    <>
      <MenuItem onClick={onClickNew}>{localized("new-song", "New")}</MenuItem>

      <Divider />

      <MenuItem onClick={onClickOpen}>
        {localized("open-song", "Open")}
      </MenuItem>

      <MenuItem
        onClick={onClickSave}
        disabled={rootStore.song.fileHandle === null}
      >
        {localized("save-song", "Save")}
      </MenuItem>

      <MenuItem onClick={onClickSaveAs}>
        {localized("save-as", "Save As")}
      </MenuItem>
    </>
  )
})

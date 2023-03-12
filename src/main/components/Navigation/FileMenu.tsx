import { observer } from "mobx-react-lite"
import { FC } from "react"
import { Localized } from "../../../components/Localized"
import { MenuDivider, MenuItem } from "../../../components/Menu"
import { createSong, saveSong } from "../../actions"
import { openFile, saveFile, saveFileAs } from "../../actions/file"
import { useLocalization } from "../../hooks/useLocalization"
import { useStores } from "../../hooks/useStores"
import { useToast } from "../../hooks/useToast"

export const FileMenu: FC<{ close: () => void }> = observer(({ close }) => {
  const rootStore = useStores()
  const toast = useToast()
  const localized = useLocalization()

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
        confirm(localized("confirm-open", "Are you sure you want to continue?"))
      ) {
        await openFile(rootStore)
      }
    } catch (e) {
      toast.error((e as Error).message)
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

  const onClickDownload = () => {
    close()
    saveSong(rootStore)()
  }

  return (
    <>
      <MenuItem onClick={onClickNew}>
        <Localized default="New">new-song</Localized>
      </MenuItem>

      <MenuDivider />

      <MenuItem onClick={onClickOpen}>
        <Localized default="Open">open-song</Localized>
      </MenuItem>

      <MenuItem
        onClick={onClickSave}
        disabled={rootStore.song.fileHandle === null}
      >
        <Localized default="Save">save-song</Localized>
      </MenuItem>

      <MenuItem onClick={onClickSaveAs}>
        <Localized default="Save As">save-as</Localized>
      </MenuItem>

      <MenuItem onClick={onClickDownload}>
        <Localized default="Download MIDI File">download-midi</Localized>
      </MenuItem>
    </>
  )
})

import { Divider, MenuItem } from "@mui/material"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { localized } from "../../../common/localize/localizedString"
import { emptySong } from "../../../common/song"
import { createSong, updateSong } from "../../firebase/song"
import { useStores } from "../../hooks/useStores"

export const CloudFileMenu: FC<{ close: () => void }> = observer(
  ({ close }) => {
    const rootStore = useStores()
    const { rootViewStore } = rootStore

    const onClickNew = async () => {
      const { song } = rootStore
      try {
        if (!song.isSaved) {
          if (song.firestoreReference === null) {
            rootViewStore.openSaveAsDialog = true
            return
          } else {
            await updateSong(song)
            rootStore.toastStore.showSuccess(
              localized("song-saved", "Song saved")
            )
          }
        }
        await createSong(emptySong())
      } catch (e) {
        rootStore.toastStore.showError((e as Error).message)
      }
    }

    const onClickOpen = () => {
      rootViewStore.openCloudFileDialog = true
      close()
    }

    const onClickSave = async () => {
      const { song } = rootStore
      try {
        if (song.isSaved) {
          await updateSong(song)
        }
        rootStore.toastStore.showSuccess(localized("song-saved", "Song saved"))
      } catch (e) {
        rootStore.toastStore.showError((e as Error).message)
      }
    }

    return (
      <>
        <MenuItem onClick={onClickNew}>{localized("new-song", "New")}</MenuItem>

        <Divider />

        <MenuItem onClick={onClickOpen}>
          {localized("open-song-cloud", "Open from Cloud")}
        </MenuItem>

        <MenuItem onClick={onClickSave}>
          {localized("save-song-cloud", "Save to Cloud")}
        </MenuItem>
      </>
    )
  }
)

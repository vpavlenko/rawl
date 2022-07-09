import { Divider, MenuItem } from "@mui/material"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { localized } from "../../../common/localize/localizedString"
import { emptySong } from "../../../common/song"
import { setSong } from "../../actions"
import { createSong, updateSong } from "../../firebase/song"
import { useStores } from "../../hooks/useStores"

export const CloudFileMenu: FC<{ close: () => void }> = observer(
  ({ close }) => {
    const rootStore = useStores()
    const { song, rootViewStore, dialogStore, promptStore } = rootStore

    const saveOrCreateSong = async () => {
      if (song.firestoreReference !== null) {
        await updateSong(song)
      } else {
        if (song.name.length === 0) {
          const text = await promptStore.show({
            title: localized("save-as", "Save as"),
          })
          if (text !== null && text.length > 0) {
            song.name = text
          } else {
            return Promise.resolve(false)
          }
        }
        await createSong(song)
      }
      rootStore.toastStore.showSuccess(localized("song-saved", "Song saved"))
    }

    // true: saved or not necessary
    // false: canceled
    const saveIfNeeded = async (): Promise<boolean> => {
      if (song.isSaved) {
        return true
      }

      const res = await dialogStore.show({
        title: localized(
          "save-changes",
          "Do you want to save your changes to the song?"
        ),
        actions: [
          { title: localized("yes", "Yes"), key: "yes" },
          { title: localized("no", "No"), key: "no" },
          { title: localized("cancel", "Cancel"), key: "cancel" },
        ],
      })
      switch (res) {
        case "yes":
          await saveOrCreateSong()
          return true
        case "no":
          return true
        case "cancel":
          return false
      }
    }

    const onClickNew = async () => {
      close()
      try {
        if (!(await saveIfNeeded())) {
          return
        }
        setSong(rootStore)(emptySong())
      } catch (e) {
        rootStore.toastStore.showError((e as Error).message)
      }
    }

    const onClickOpen = async () => {
      close()
      try {
        if (!(await saveIfNeeded())) {
          return
        }
        rootViewStore.openCloudFileDialog = true
      } catch (e) {
        rootStore.toastStore.showError((e as Error).message)
      }
    }

    const onClickSave = async () => {
      close()
      try {
        await saveOrCreateSong()
      } catch (e) {
        rootStore.toastStore.showError((e as Error).message)
      }
    }

    const onClickSaveAs = async () => {
      close()
      try {
        const text = await promptStore.show({
          title: localized("save-as", "Save as"),
          initialText: song.name,
        })
        if (text !== null && text.length > 0) {
          song.name = text
        } else {
          return
        }
        await createSong(song)
        rootStore.toastStore.showSuccess(localized("song-saved", "Song saved"))
      } catch (e) {
        rootStore.toastStore.showError((e as Error).message)
      }
    }

    const onClickImport = async () => {
      close()
      try {
        if (!(await saveIfNeeded())) {
          return
        }
        // TODO: open midi
      } catch (e) {
        rootStore.toastStore.showError((e as Error).message)
      }
    }

    const onClickExport = async () => {
      try {
        // TODO: export midi
      } catch (e) {
        rootStore.toastStore.showError((e as Error).message)
      }
    }

    return (
      <>
        <MenuItem onClick={onClickNew}>{localized("new-song", "New")}</MenuItem>

        <Divider />

        <MenuItem onClick={onClickOpen}>
          {localized("open-song", "Open")}
        </MenuItem>

        <MenuItem onClick={onClickSave} disabled={song.isSaved}>
          {localized("save-song", "Save")}
        </MenuItem>

        <MenuItem onClick={onClickSaveAs}>
          {localized("save-as", "Save As")}
        </MenuItem>

        <Divider />

        <MenuItem onClick={onClickImport}>
          {localized("import-midi", "Import MIDI file")}
        </MenuItem>

        <MenuItem onClick={onClickExport}>
          {localized("export-midi", "Export MIDI file")}
        </MenuItem>
      </>
    )
  }
)

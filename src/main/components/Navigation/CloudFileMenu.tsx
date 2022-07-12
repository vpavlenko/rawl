import { Divider, MenuItem } from "@mui/material"
import { observer } from "mobx-react-lite"
import { ChangeEvent, FC } from "react"
import { localized } from "../../../common/localize/localizedString"
import { emptySong } from "../../../common/song"
import { openSong, saveSong, setSong } from "../../actions"
import { hasFSAccess, openFile, saveFileAs } from "../../actions/file"
import { createSong, updateSong } from "../../firebase/song"
import { useStores } from "../../hooks/useStores"
import { FileInput } from "./LegacyFileMenu"

export const CloudFileMenu: FC<{ close: () => void }> = observer(
  ({ close }) => {
    const rootStore = useStores()
    const { rootViewStore, dialogStore, promptStore } = rootStore

    const saveOrCreateSong = async () => {
      const { song } = rootStore
      if (song.firestoreReference !== null) {
        await updateSong(song)
        rootStore.toastStore.showSuccess(localized("song-saved", "Song saved"))
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
        rootStore.toastStore.showSuccess(
          localized("song-created", "Song created")
        )
      }
    }

    // true: saved or not necessary
    // false: canceled
    const saveIfNeeded = async (): Promise<boolean> => {
      const { song } = rootStore
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
        const newSong = emptySong()
        setSong(rootStore)(newSong)
        await createSong(newSong)
        rootStore.toastStore.showSuccess(
          localized("song-created", "Song created")
        )
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
      const { song } = rootStore
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

    const onClickRename = async () => {
      close()
      const { song } = rootStore
      try {
        if (song.name.length === 0) {
          const text = await promptStore.show({
            title: localized("rename", "Rename"),
          })
          if (text !== null && text.length > 0) {
            song.name = text
          } else {
            return Promise.resolve(false)
          }
        }
        if (song.firestoreReference !== null) {
          await updateSong(song)
        } else {
          await createSong(song)
        }
        rootStore.toastStore.showSuccess(localized("song-saved", "Song saved"))
      } catch (e) {
        rootStore.toastStore.showError((e as Error).message)
      }
    }

    const onClickImportLegacy = async (e: ChangeEvent<HTMLInputElement>) => {
      close()
      try {
        await openSong(rootStore)(e.currentTarget)
        await saveOrCreateSong()
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
        await openFile(rootStore)
        await saveOrCreateSong()
      } catch (e) {
        rootStore.toastStore.showError((e as Error).message)
      }
    }

    const onClickExport = async () => {
      try {
        if (hasFSAccess) {
          await saveFileAs(rootStore)
        } else {
          saveSong(rootStore)()
        }
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

        <MenuItem onClick={onClickSave} disabled={rootStore.song.isSaved}>
          {localized("save-song", "Save")}
        </MenuItem>

        <MenuItem onClick={onClickSaveAs}>
          {localized("save-as", "Save As")}
        </MenuItem>

        <MenuItem onClick={onClickRename}>
          {localized("rename", "Rename")}
        </MenuItem>

        <Divider />

        {!hasFSAccess && (
          <FileInput onChange={onClickImportLegacy}>
            <MenuItem>{localized("import-midi", "Import MIDI file")}</MenuItem>
          </FileInput>
        )}

        {hasFSAccess && (
          <MenuItem onClick={onClickImport}>
            {localized("import-midi", "Import MIDI file")}
          </MenuItem>
        )}

        <MenuItem onClick={onClickExport}>
          {localized("export-midi", "Export MIDI file")}
        </MenuItem>
      </>
    )
  }
)

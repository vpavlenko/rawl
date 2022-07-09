import styled from "@emotion/styled"
import { KeyboardArrowDown } from "@mui/icons-material"
import { Divider, Menu, MenuItem } from "@mui/material"
import Color from "color"
import { observer } from "mobx-react-lite"
import { ChangeEvent, FC, useCallback, useRef } from "react"
import { localized } from "../../../common/localize/localizedString"
import { createSong, openSong, saveSong } from "../../actions"
import { hasFSAccess, openFile, saveFile, saveFileAs } from "../../actions/file"
import {
  createSong as saveSongToFirestore,
  updateSong,
} from "../../firebase/song"
import { useStores } from "../../hooks/useStores"
import { Tab } from "./Navigation"

const fileInputID = "OpenButtonInputFile"

const FileInput: FC<
  React.PropsWithChildren<{
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
  }>
> = ({ onChange, children }) => (
  <>
    <input
      accept="audio/midi"
      style={{ display: "none" }}
      id={fileInputID}
      type="file"
      onChange={onChange}
    />
    <label htmlFor={fileInputID}>{children}</label>
  </>
)

const FileMenu: FC<{ close: () => void }> = observer(({ close }) => {
  const rootStore = useStores()

  const onClickOpen = async () => {
    close()
    try {
      await openFile(rootStore)
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

const LegacyFileMenu: FC<{ close: () => void }> = observer(({ close }) => {
  const rootStore = useStores()

  const onClickOpen = (e: ChangeEvent<HTMLInputElement>) => {
    close()
    openSong(rootStore)(e.currentTarget)
  }

  const onClickSave = () => {
    close()
    saveSong(rootStore)()
  }

  return (
    <>
      <FileInput onChange={onClickOpen}>
        <MenuItem>{localized("open-song", "Open")}</MenuItem>
      </FileInput>

      <MenuItem onClick={onClickSave}>
        {localized("save-song", "Save")}
      </MenuItem>
    </>
  )
})

const CloudMenu: FC<{ close: () => void }> = observer(({ close }) => {
  const rootStore = useStores()
  const { rootViewStore } = rootStore

  const onClickOpen = () => {
    rootViewStore.openCloudFileDialog = true
    close()
  }

  const onClickSave = async () => {
    close()
    const { song } = rootStore

    try {
      if (song.firestoreReference === null) {
        await saveSongToFirestore(rootStore.song)
      } else {
        await updateSong(song)
      }
      rootStore.toastStore.showSuccess(localized("song-saved", "Song saved"))
    } catch (e) {
      rootStore.toastStore.showError((e as Error).message)
    }
  }

  return (
    <>
      <MenuItem onClick={onClickOpen}>
        {localized("open-song-cloud", "Open from Cloud")}
      </MenuItem>

      <MenuItem onClick={onClickSave}>
        {localized("save-song-cloud", "Save to Cloud")}
      </MenuItem>
    </>
  )
})

const StyledMenu = styled(Menu)`
  .MuiList-root {
    background: ${({ theme }) =>
      Color(theme.backgroundColor).lighten(0.2).hex()};
  }
`

export const FileMenuButton: FC = observer(() => {
  const rootStore = useStores()
  const {
    rootViewStore,
    exportStore,
    authStore: { user },
  } = rootStore
  const isOpen = rootViewStore.openDrawer
  const handleClose = () => (rootViewStore.openDrawer = false)

  const onClickNew = () => {
    handleClose()
    if (
      confirm(localized("confirm-new", "Are you sure you want to continue?"))
    ) {
      createSong(rootStore)()
    }
  }

  const onClickExport = () => {
    handleClose()
    exportStore.openExportDialog = true
  }

  const ref = useRef<HTMLDivElement>(null)

  return (
    <>
      <Tab
        ref={ref}
        onClick={useCallback(() => (rootViewStore.openDrawer = true), [])}
        id="tab-file"
      >
        <span style={{ marginLeft: "0.25rem" }}>
          {localized("file", "File")}
        </span>
        <KeyboardArrowDown style={{ width: "1rem", marginLeft: "0.25rem" }} />
      </Tab>

      <StyledMenu
        keepMounted
        open={isOpen}
        onClose={handleClose}
        anchorEl={ref.current}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transitionDuration={50}
        disableAutoFocusItem={true}
      >
        <MenuItem onClick={onClickNew}>{localized("new-song", "New")}</MenuItem>

        <Divider />

        {hasFSAccess && <FileMenu close={handleClose} />}

        {!hasFSAccess && <LegacyFileMenu close={handleClose} />}

        <Divider />

        <MenuItem disabled={true}>
          {localized("cloud-save", "Cloud Save")}
        </MenuItem>

        {user && <CloudMenu close={handleClose} />}

        {user === null && (
          <MenuItem disabled={true}>
            {localized("please-sign-up", "Please sign up to use Cloud Save")}
          </MenuItem>
        )}

        <Divider />

        <MenuItem onClick={onClickExport}>
          {localized("export-audio", "Export Audio")}
        </MenuItem>
      </StyledMenu>
    </>
  )
})

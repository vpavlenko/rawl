import {
  Divider,
  ListItemText,
  makeStyles,
  Menu,
  MenuItem,
} from "@material-ui/core"
import Color from "color"
import { observer } from "mobx-react-lite"
import React, { ChangeEvent, FC, useCallback, useRef, VFC } from "react"
import { localized } from "../../../common/localize/localizedString"
import { createSong, openSong, saveSong } from "../../actions"
import { hasFSAccess, openFile, saveFile, saveFileAs } from "../../actions/file"
import { useStores } from "../../hooks/useStores"
import { Tab } from "./Navigation"

const fileInputID = "OpenButtonInputFile"

const FileInput: FC<{
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}> = ({ onChange, children }) => (
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

const useStyles = makeStyles((theme) => ({
  menuPaper: {
    background: Color(theme.palette.background.paper).lighten(0.2).hex(),
  },
}))

export const FileMenu: VFC<{ close: () => void }> = observer(({ close }) => {
  const rootStore = useStores()

  const onClickOpen = async () => {
    close()
    await openFile(rootStore)
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

export const LegacyFileMenu: VFC<{ close: () => void }> = observer(
  ({ close }) => {
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
  }
)

export const FileMenuButton: FC = observer(() => {
  const rootStore = useStores()
  const { rootViewStore, exportStore } = rootStore
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

  const classes = useStyles({})

  return (
    <>
      <Tab
        ref={ref}
        onClick={useCallback(() => (rootViewStore.openDrawer = true), [])}
        id="tab-file"
      >
        <span>{localized("file", "File")}</span>
      </Tab>

      <Menu
        classes={{ paper: classes.menuPaper }}
        keepMounted
        open={isOpen}
        onClose={handleClose}
        anchorEl={ref.current}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        getContentAnchorEl={null}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transitionDuration={50}
        disableAutoFocusItem={true}
      >
        <MenuItem onClick={onClickNew}>
          <ListItemText primary={localized("new-song", "New")} />
        </MenuItem>

        <Divider />

        {hasFSAccess && <FileMenu close={handleClose} />}

        {!hasFSAccess && <LegacyFileMenu close={handleClose} />}

        <Divider />

        <MenuItem onClick={onClickExport}>
          {localized("export-audio", "Export Audio")}
        </MenuItem>
      </Menu>
    </>
  )
})

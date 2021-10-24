import { ListItemText, makeStyles, Menu, MenuItem } from "@material-ui/core"
import Color from "color"
import { observer } from "mobx-react-lite"
import React, { ChangeEvent, FC, useCallback, useRef } from "react"
import { localized } from "../../../common/localize/localizedString"
import { createSong, openSong, saveSong } from "../../actions"
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

export const FileMenuButton: FC = observer(() => {
  const rootStore = useStores()
  const { rootViewStore } = rootStore
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

  const onClickOpen = (e: ChangeEvent<HTMLInputElement>) => {
    handleClose()
    openSong(rootStore)(e.currentTarget)
  }

  const onClickSave = () => {
    handleClose()
    saveSong(rootStore)()
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

        <FileInput onChange={onClickOpen}>
          <MenuItem>{localized("open-song", "Open")}</MenuItem>
        </FileInput>

        <MenuItem onClick={onClickSave}>
          {localized("save-song", "Save")}
        </MenuItem>
      </Menu>
    </>
  )
})

import { List, ListItem, ListItemText } from "@material-ui/core"
import React, { ChangeEvent, FC } from "react"
import { localized } from "../../../common/localize/localizedString"
import { createSong, openSong, saveSong } from "../../actions"
import { useStores } from "../../hooks/useStores"
import { ListHeader } from "./Drawer"

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

export const SongList: FC = () => {
  const { rootStore } = useStores()
  const onClickNew = () => {
    if (
      confirm(localized("confirm-new", "Are you sure you want to continue?"))
    ) {
      createSong(rootStore)()
    }
  }
  const onClickOpen = (e: ChangeEvent<HTMLInputElement>) =>
    openSong(rootStore)(e.currentTarget)
  const onClickSave = () => saveSong(rootStore)()
  return (
    <List>
      <ListHeader>{localized("file", "File")}</ListHeader>

      <ListItem button onClick={onClickNew}>
        <ListItemText primary={localized("new-song", "New")} />
      </ListItem>

      <FileInput onChange={onClickOpen}>
        <ListItem button>
          <ListItemText primary={localized("open-song", "Open")} />
        </ListItem>
      </FileInput>

      <ListItem button onClick={onClickSave}>
        <ListItemText primary={localized("save-song", "Save")} />
      </ListItem>
    </List>
  )
}

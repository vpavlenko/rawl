import React, { FC, ChangeEvent } from "react"
import { List, ListItem, ListItemText } from "@material-ui/core"
import { createSong, openSong, saveSong } from "actions"
import { useStores } from "main/hooks/useStores"
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
    if (confirm("Are you sure you want to continue?")) {
      createSong(rootStore)()
    }
  }
  const onClickOpen = (e: ChangeEvent<HTMLInputElement>) =>
    openSong(rootStore)(e.currentTarget)
  const onClickSave = () => saveSong(rootStore)()
  return (
    <List>
      <ListHeader>Song</ListHeader>

      <ListItem button onClick={onClickNew}>
        <ListItemText primary="New" />
      </ListItem>

      <FileInput onChange={onClickOpen}>
        <ListItem button>
          <ListItemText primary="Open" />
        </ListItem>
      </FileInput>

      <ListItem button onClick={onClickSave}>
        <ListItemText primary="Save" />
      </ListItem>
    </List>
  )
}

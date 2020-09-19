import React, { FC, ChangeEvent } from "react"
import { List, ListSubheader, ListItem, ListItemText } from "@material-ui/core"
import { createSong, openSong, saveSong } from "actions"
import { useStores } from "main/hooks/useStores"

interface SongListProps {
  onClickNew: () => void
  onClickOpen: (e: ChangeEvent<HTMLInputElement>) => void
  onClickSave: () => void
}

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

const SongList: FC<SongListProps> = ({
  onClickNew,
  onClickOpen,
  onClickSave,
}) => (
  <List>
    <ListSubheader>Song</ListSubheader>

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

export const SongListWrapper: FC<{}> = () => {
  const { rootStore } = useStores()
  return (
    <SongList
      onClickNew={() => {
        if (confirm("Are you sure you want to continue?")) {
          createSong(rootStore)()
        }
      }}
      onClickOpen={(e) => openSong(rootStore)(e.currentTarget)}
      onClickSave={() => saveSong(rootStore)()}
    />
  )
}

import React, { SFC, ChangeEvent } from "react"
import { List, ListSubheader, ListItem, ListItemText } from "@material-ui/core"
import { compose } from "recompose"
import { inject, observer } from "mobx-react"
import RootStore from "stores/RootStore"
import { OPEN_SONG, SAVE_SONG, CREATE_SONG } from "actions"

interface SongListProps {
  onClickNew: () => void
  onClickOpen: (e: ChangeEvent<HTMLInputElement>) => void
  onClickSave: () => void
}

const fileInputID = "OpenButtonInputFile"

const FileInput: SFC<{
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

const SongList: SFC<SongListProps> = ({
  onClickNew,
  onClickOpen,
  onClickSave
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

export default compose(
  inject(({ rootStore: { dispatch } }: { rootStore: RootStore }) => {
    return {
      onClickNew: () => {
        if (confirm("Are you sure you want to continue?")) {
          dispatch(CREATE_SONG)
        }
      },
      onClickOpen: e => dispatch(OPEN_SONG, e.currentTarget),
      onClickSave: () => dispatch(SAVE_SONG)
    } as SongListProps
  }),
  observer
)(SongList)

import React, { SFC } from "react"

import { VolumeOff, VolumeUp, Headset } from "@material-ui/icons"
import { ListItem, MenuItem, IconButton, Menu } from "@material-ui/core"

import "./TrackListItem.css"

export interface TrackListItemData {
  index: number
  name: string
  instrument: string
  mute: boolean
  solo: boolean
  selected: boolean
  volume: number
  pan: number
}

export type TrackListItemProps = TrackListItemData & {
  onClick: () => void
  onClickSolo: () => void
  onClickMute: () => void
  onClickDelete: () => void
}

const TrackListItem: SFC<TrackListItemProps> = ({
  name,
  instrument,
  mute,
  solo,
  selected,
  volume,
  pan,
  onClick,
  onClickDelete,
  onClickSolo,
  onClickMute,
}) => {
  const [state, setState] = React.useState({
    mouseX: 0,
    mouseY: 0,
    isContextMenuOpen: false,
  })

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setState({
      mouseX: e.clientX - 2,
      mouseY: e.clientY - 4,
      isContextMenuOpen: true,
    })
  }

  const handleClose = () => {
    setState({ ...state, isContextMenuOpen: false })
  }

  return (
    <ListItem
      button
      selected={selected}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <Menu
        keepMounted
        open={state.isContextMenuOpen}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={{ top: state.mouseY, left: state.mouseX }}
      >
        <MenuItem
          onClick={() => {
            onClickDelete()
            handleClose()
          }}
        >
          Delete Track
        </MenuItem>
      </Menu>
      <div className="TrackListItem">
        <div className="label">
          <div className="name">{name}</div>
          <div className="instrument">{instrument}</div>
        </div>
        <div className="controls">
          <IconButton
            color="default"
            size="small"
            className={`button solo ${solo ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation()
              onClickSolo()
            }}
          >
            <Headset fontSize="small" />
          </IconButton>
          <IconButton
            color="default"
            size="small"
            className={`button mute ${mute ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation()
              onClickMute()
            }}
          >
            {mute ? (
              <VolumeOff fontSize="small" />
            ) : (
              <VolumeUp fontSize="small" />
            )}
          </IconButton>
        </div>
      </div>
    </ListItem>
  )
}

export default TrackListItem

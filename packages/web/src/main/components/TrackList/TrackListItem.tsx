import React from "react"
import { createContextMenu } from "components/groups/ContextMenu"

import "./TrackListItem.css"
import { VolumeOff, VolumeUp, Headset } from "@material-ui/icons"
import { ListItem, MenuItem } from "@material-ui/core"

const Nop = () => {}

export default function TrackListItem({
  name = "",
  instrument = "",
  mute = false,
  solo = false,
  selected = false,
  volume = 0,
  pan = 0,
  onClick = Nop,
  onDoubleClickName = Nop,
  onClickSolo = Nop,
  onClickMute = Nop,
  onClickDelete = Nop
}) {
  return (
    <ListItem
      button
      selected={selected}
      onClick={onClick}
      onContextMenu={createContextMenu(close => [
        <MenuItem
          onClick={() => {
            onClickDelete()
            close()
          }}
        >
          Delete Track
        </MenuItem>
      ])}
    >
      <div className="TrackListItem">
        <div className="label">
          <div className="name" onDoubleClick={onDoubleClickName}>
            {name}
          </div>
          <div className="instrument">{instrument}</div>
        </div>
        <div className="controls">
          <div
            className={`button solo ${solo ? "active" : ""}`}
            onClick={e => {
              e.stopPropagation()
              onClickSolo()
            }}
          >
            <Headset fontSize="small" />
          </div>
          <div
            className={`button mute ${mute ? "active" : ""}`}
            onClick={e => {
              e.stopPropagation()
              onClickMute()
            }}
          >
            {mute ? (
              <VolumeOff fontSize="small" />
            ) : (
              <VolumeUp fontSize="small" />
            )}
          </div>
        </div>
      </div>
    </ListItem>
  )
}

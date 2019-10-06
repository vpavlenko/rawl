import React from "react"
import {
  ContextMenu,
  MenuItem,
  createContextMenu
} from "components/groups/ContextMenu"

import "./TrackListItem.css"
import { VolumeOff, VolumeUp, Headset } from "@material-ui/icons"

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
    <div
      className={`TrackListItem ${selected ? "selected" : ""}`}
      onClick={onClick}
      onContextMenu={createContextMenu(close => (
        <ContextMenu>
          <MenuItem
            onClick={() => {
              onClickDelete()
              close()
            }}
          >
            Delete Track
          </MenuItem>
        </ContextMenu>
      ))}
    >
      <div className="label">
        <div className="name" onDoubleClick={onDoubleClickName}>
          {name}
        </div>
        <div className="instrument">{instrument}</div>
      </div>
      <div className="controls">
        <div
          className={`button solo ${solo ? "active" : ""}`}
          onClick={onClickSolo}
        >
          <Headset fontSize="small" />
        </div>
        <div
          className={`button mute ${mute ? "active" : ""}`}
          onClick={onClickMute}
        >
          {mute ? (
            <VolumeOff fontSize="small" />
          ) : (
            <VolumeUp fontSize="small" />
          )}
        </div>
      </div>
    </div>
  )
}

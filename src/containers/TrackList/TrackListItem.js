import React from "react"
import Icon from "components/Icon"
import { ContextMenu, MenuItem, createContextMenu } from "components/groups/ContextMenu"

import "./TrackListItem.css"

const Nop = () => { }

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
  return <div
    className={`TrackListItem ${selected ? "selected" : ""}`}
    onClick={onClick}
    onContextMenu={createContextMenu(close =>
      <ContextMenu id="TrackListItem">
        <MenuItem onClick={() => {
          onClickDelete()
          close()
        }}>Delete Track</MenuItem>
      </ContextMenu>
    )}>
    <div className="label">
      <div className="name" onDoubleClick={onDoubleClickName}>{name}</div>
      <div className="instrument">{instrument}</div>
    </div>
    <div className="controls">
      <div className={`button solo ${solo ? "active" : ""}`} onClick={onClickSolo}><Icon>headphones</Icon></div>
      <div className={`button mute ${mute ? "active" : ""}`} onClick={onClickMute}><Icon>{mute ? "volume-off" : "volume-high"}</Icon></div>
    </div>
  </div>
}

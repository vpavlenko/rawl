import { IconButton, ListItem } from "@material-ui/core"
import { Headset, VolumeOff, VolumeUp } from "@material-ui/icons"
import React, { FC } from "react"
import styled from "styled-components"
import { TrackListContextMenu, useContextMenu } from "./TrackListContextMenu"
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

const Container = styled(ListItem)`
  &.Mui-selected {
    background-color: rgb(255 255 255 / 5%);
    border-right: 5px solid var(--theme-color);
  }
`

const TrackListItem: FC<TrackListItemProps> = ({
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
  const { onContextMenu, menuProps } = useContextMenu()

  return (
    <Container
      button
      selected={selected}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <TrackListContextMenu onClickDelete={onClickDelete} {...menuProps} />
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
    </Container>
  )
}

export default TrackListItem

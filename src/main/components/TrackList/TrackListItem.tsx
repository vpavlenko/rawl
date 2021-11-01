import { IconButton, ListItem } from "@material-ui/core"
import { Headset, Layers, VolumeOff, VolumeUp } from "@material-ui/icons"
import { FC } from "react"
import styled from "styled-components"
import { useContextMenu } from "../../hooks/useContextMenu"
import { TrackListContextMenu } from "./TrackListContextMenu"

export interface TrackListItemData {
  index: number
  name: string
  instrument: string
  mute: boolean
  solo: boolean
  selected: boolean
  volume: number
  pan: number
  ghostTrack: boolean
  channel: number | undefined
}

export type TrackListItemProps = TrackListItemData & {
  onClick: () => void
  onClickSolo: () => void
  onClickMute: () => void
  onClickAdd: () => void
  onClickDelete: () => void
  onClickGhostTrack: () => void
  onClickToogleAllGhostTracks: () => void
}

const Container = styled(ListItem)`
  &.Mui-selected {
    background-color: rgb(255 255 255 / 5%);
    border-right: 5px solid var(--theme-color);

    .name {
      font-weight: 600;
    }
  }

  .controls {
    display: flex;
  }

  .label {
    display: flex;
    padding-bottom: 0.3em;
    font-size: 105%;
    align-items: baseline;
  }

  .name {
    padding-right: 0.5em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .label .instrument {
    opacity: 0.5;
    font-size: 90%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .button {
    margin-right: 0.5em;
    color: var(--secondary-text-color);
  }

  .button.active {
    color: var(--text-color);
  }
`

const ChannelName = styled.div`
  color: var(--secondary-text-color);
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  border: 1px solid var(--divider-color);
  padding: 0 0.3rem;
`

export const TrackListItem: FC<TrackListItemProps> = ({
  name,
  instrument,
  mute,
  solo,
  selected,
  ghostTrack,
  channel,
  onClick,
  onClickAdd,
  onClickDelete,
  onClickSolo,
  onClickMute,
  onClickGhostTrack,
  onClickToogleAllGhostTracks,
}) => {
  const { onContextMenu, menuProps } = useContextMenu()

  return (
    <Container
      button
      selected={selected}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <TrackListContextMenu
        onClickDelete={onClickDelete}
        onClickAdd={onClickAdd}
        {...menuProps}
      />
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
          <IconButton
            color="default"
            size="small"
            className={`button solo ${ghostTrack ? "active" : ""}`}
            onClick={(e) => {
              if (e.nativeEvent.altKey) {
                e.stopPropagation()
                onClickToogleAllGhostTracks()
              } else {
                e.stopPropagation()
                onClickGhostTrack()
              }
            }}
          >
            <Layers fontSize="small" />
          </IconButton>
          {channel !== undefined && <ChannelName>CH {channel + 1}</ChannelName>}
        </div>
      </div>
    </Container>
  )
}

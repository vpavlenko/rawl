import { Headset, Layers, VolumeOff, VolumeUp } from "@mui/icons-material"
import { IconButton, ListItem } from "@mui/material"
import { observer } from "mobx-react-lite"
import { FC, useCallback, useState } from "react"
import styled from "styled-components"
import {
  addTrack,
  removeTrack,
  selectTrack,
  toggleMuteTrack,
  toggleSoloTrack,
  toogleAllGhostTracks,
  toogleGhostTrack,
} from "../../actions"
import { useContextMenu } from "../../hooks/useContextMenu"
import { useStores } from "../../hooks/useStores"
import { TrackDialog } from "./TrackDialog"
import { TrackListContextMenu } from "./TrackListContextMenu"

export type TrackListItemProps = {
  trackId: number
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

  &:hover {
    background: var(--secondary-background-color);
  }
`

export const TrackListItem: FC<TrackListItemProps> = observer(({ trackId }) => {
  const rootStore = useStores()
  const { song, pianoRollStore, rootViewStore, trackMute, router } = rootStore
  const track = song.tracks[trackId]

  const selected =
    !rootViewStore.isArrangeViewSelected && trackId === song.selectedTrackId
  const name = track.displayName
  const instrument = track.instrumentName ?? ""
  const mute = trackMute.isMuted(trackId)
  const solo = trackMute.isSolo(trackId)
  const ghostTrack = !pianoRollStore.notGhostTracks.has(trackId)
  const channel = track.channel
  const { onContextMenu, menuProps } = useContextMenu()
  const [isDialogOpened, setDialogOpened] = useState(false)

  const onClickMute: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.stopPropagation()
      toggleMuteTrack(rootStore)(trackId)
    },
    [trackId]
  )
  const onClickSolo: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.stopPropagation()
      toggleSoloTrack(rootStore)(trackId)
    },
    [trackId]
  )
  const onClickDelete = useCallback(
    () => removeTrack(rootStore)(trackId),
    [trackId]
  )
  const onClickGhostTrack: React.MouseEventHandler<HTMLButtonElement> =
    useCallback(
      (e) => {
        if (e.nativeEvent.altKey) {
          e.stopPropagation()
          toogleAllGhostTracks(rootStore)()
        } else {
          e.stopPropagation()
          toogleGhostTrack(rootStore)(trackId)
        }
      },
      [trackId]
    )
  const onClickAddTrack = useCallback(() => addTrack(rootStore)(), [trackId])
  const onSelectTrack = useCallback(() => {
    router.pushTrack()
    selectTrack(rootStore)(trackId)
  }, [trackId])
  const openDialog = useCallback(() => setDialogOpened(true), [])
  const closeDialog = useCallback(() => setDialogOpened(false), [])

  return (
    <>
      <Container
        selected={selected}
        onClick={onSelectTrack}
        onContextMenu={onContextMenu}
        tabIndex={-1}
      >
        <div>
          <div className="label">
            <div className="name">{name}</div>
            <div className="instrument">{instrument}</div>
          </div>
          <div className="controls">
            <IconButton
              color="default"
              size="small"
              className={`button solo ${solo ? "active" : ""}`}
              onClick={onClickSolo}
            >
              <Headset fontSize="small" />
            </IconButton>
            <IconButton
              color="default"
              size="small"
              className={`button mute ${mute ? "active" : ""}`}
              onClick={onClickMute}
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
              onClick={onClickGhostTrack}
            >
              <Layers fontSize="small" />
            </IconButton>
            {channel !== undefined && (
              <ChannelName onClick={openDialog}>CH {channel + 1}</ChannelName>
            )}
          </div>
        </div>
      </Container>
      <TrackListContextMenu
        onClickDelete={onClickDelete}
        onClickAdd={onClickAddTrack}
        onClickProperty={openDialog}
        {...menuProps}
      />
      <TrackDialog
        trackId={trackId}
        open={isDialogOpened}
        onClose={closeDialog}
      />
    </>
  )
})

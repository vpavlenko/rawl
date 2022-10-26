import styled from "@emotion/styled"
import { Headset, Layers, VolumeOff, VolumeUp } from "@mui/icons-material"
import { IconButton } from "@mui/material"
import { observer } from "mobx-react-lite"
import { FC, useCallback, useState } from "react"
import { categoryEmojis, getCategoryIndex } from "../../../common/midi/GM"
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

const Container = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  border-right: 5px solid;
  border-right-color: ${({ theme, selected }) =>
    selected ? theme.themeColor : "transparent"};
  padding: 0.5rem 1rem;

  &:hover {
    background: ${({ theme }) => theme.secondaryBackgroundColor};
  }
`

const Label = styled.div`
  display: flex;
  padding-bottom: 0.3em;
  font-size: 105%;
  align-items: baseline;
`

const Instrument = styled.div`
  color: ${({ theme }) => theme.secondaryTextColor};
  font-size: 90%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

const Name = styled.div<{ selected: boolean }>`
  font-weight: 600;
  color: ${({ theme, selected }) =>
    selected ? theme.textColor : theme.secondaryTextColor};
  padding-right: 0.5em;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Controls = styled.div`
  display: flex;
`

const Button = styled(IconButton)<{ active: boolean }>`
  margin-right: 0.5em;
  color: ${({ theme, active }) =>
    active ? theme.textColor : theme.secondaryTextColor};
`

const ChannelName = styled.div`
  flex-shrink: 0;
  color: ${({ theme }) => theme.secondaryTextColor};
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.dividerColor};
  padding: 0 0.3rem;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.secondaryBackgroundColor};
  }
`

const Icon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 1.3rem;
  margin-right: 1rem;
  flex-shrink: 0;
  background: ${({ theme }) => theme.secondaryBackgroundColor};
`

const IconInner = styled.div<{ selected: boolean }>`
  opacity: ${({ selected }) => (selected ? 1 : 0.5)};
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

  const emoji = track.isRhythmTrack
    ? "🥁"
    : categoryEmojis[getCategoryIndex(track.programNumber ?? 0)]

  return (
    <>
      <Container
        selected={selected}
        onClick={onSelectTrack}
        onContextMenu={onContextMenu}
        tabIndex={-1}
      >
        <Icon>
          <IconInner selected={selected}>{emoji}</IconInner>
        </Icon>
        <div>
          <Label>
            <Name selected={selected}>{name}</Name>
            <Instrument>{instrument}</Instrument>
          </Label>
          <Controls>
            <Button
              color="default"
              size="small"
              active={solo}
              onClick={onClickSolo}
            >
              <Headset fontSize="small" />
            </Button>
            <Button
              color="default"
              size="small"
              active={mute}
              onClick={onClickMute}
            >
              {mute ? (
                <VolumeOff fontSize="small" />
              ) : (
                <VolumeUp fontSize="small" />
              )}
            </Button>
            <Button
              color="default"
              size="small"
              active={ghostTrack}
              onClick={onClickGhostTrack}
            >
              <Layers fontSize="small" />
            </Button>
            {channel !== undefined && (
              <ChannelName onClick={openDialog}>CH {channel + 1}</ChannelName>
            )}
          </Controls>
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

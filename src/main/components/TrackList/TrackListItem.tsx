import styled from "@emotion/styled"
import Color from "color"
import Headset from "mdi-react/HeadphonesIcon"
import Layers from "mdi-react/LayersIcon"
import VolumeUp from "mdi-react/VolumeHighIcon"
import VolumeOff from "mdi-react/VolumeOffIcon"
import { observer } from "mobx-react-lite"
import { FC, useCallback, useState } from "react"
import { categoryEmojis, getCategoryIndex } from "../../../common/midi/GM"
import { trackColorToCSSColor } from "../../../common/track/TrackColor"
import { IconButton } from "../../../components/IconButton"
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
import { ColorPicker } from "../ColorPicker/ColorPicker"
import { TrackInstrumentName } from "./InstrumentName"
import { TrackDialog } from "./TrackDialog"
import { TrackListContextMenu } from "./TrackListContextMenu"
import { TrackName } from "./TrackName"

export type TrackListItemProps = {
  trackId: number
}

const Container = styled.div<{ selected: boolean }>`
  background-color: ${({ theme, selected }) =>
    selected ? theme.secondaryBackgroundColor : "transparent"};
  display: flex;
  align-items: center;
  padding: 0.5rem 0.5rem;
  border-radius: 0.5rem;
  margin: 0.5rem;
  outline: none;

  &:hover {
    background: ${({ theme }) => theme.highlightColor};
  }
`

const Label = styled.div`
  display: flex;
  padding-bottom: 0.3em;
  align-items: baseline;
`

const Instrument = styled.div`
  color: ${({ theme }) => theme.secondaryTextColor};
  font-size: 0.75rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

const Name = styled.div<{ selected: boolean }>`
  font-weight: 600;
  color: ${({ theme, selected }) =>
    selected ? theme.textColor : theme.secondaryTextColor};
  padding-right: 0.5em;
  font-size: 0.875rem;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Controls = styled.div`
  display: flex;
  align-items: center;
`

const ChannelName = styled.div`
  flex-shrink: 0;
  color: ${({ theme }) => theme.secondaryTextColor};
  font-size: 0.625rem;
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.dividerColor};
  padding: 0 0.25rem;
  cursor: pointer;
  height: 1.25rem;
  margin-left: 0.25rem;

  &:hover {
    background: ${({ theme }) => theme.highlightColor};
  }
`

const Icon = styled.div<{ selected: boolean; color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 1.3rem;
  margin-right: 0.5rem;
  flex-shrink: 0;
  background: ${({ theme, selected }) =>
    selected ? theme.backgroundColor : theme.secondaryBackgroundColor};
  border: 2px solid ${({ color }) => color};
  box-sizing: border-box;
`

const IconInner = styled.div<{ selected: boolean }>`
  opacity: ${({ selected }) => (selected ? 1 : 0.5)};
`

const ControlButton = styled(IconButton)`
  width: 1.9rem;
  height: 1.9rem;
  margin-right: 0.25rem;
`

export const TrackListItem: FC<TrackListItemProps> = observer(({ trackId }) => {
  const rootStore = useStores()
  const { song, pianoRollStore, rootViewStore, trackMute, router } = rootStore
  const track = song.tracks[trackId]

  const selected =
    !rootViewStore.isArrangeViewSelected &&
    trackId === pianoRollStore.selectedTrackId
  const mute = trackMute.isMuted(trackId)
  const solo = trackMute.isSolo(trackId)
  const ghostTrack = !pianoRollStore.notGhostTracks.has(trackId)
  const channel = track.channel
  const { onContextMenu, menuProps } = useContextMenu()
  const [isDialogOpened, setDialogOpened] = useState(false)
  const [isColorPickerOpened, setColorPickerOpened] = useState(false)

  const onClickMute: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.stopPropagation()
      toggleMuteTrack(rootStore)(trackId)
    },
    [trackId],
  )
  const onClickSolo: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.stopPropagation()
      toggleSoloTrack(rootStore)(trackId)
    },
    [trackId],
  )
  const onClickDelete = useCallback(
    () => removeTrack(rootStore)(trackId),
    [trackId],
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
      [trackId],
    )
  const onClickAddTrack = useCallback(() => addTrack(rootStore)(), [trackId])
  const onSelectTrack = useCallback(() => {
    router.pushTrack()
    selectTrack(rootStore)(trackId)
  }, [trackId])
  const openDialog = useCallback(() => setDialogOpened(true), [])
  const closeDialog = useCallback(() => setDialogOpened(false), [])
  const changeTrackColor = useCallback(() => setColorPickerOpened(true), [])

  const onPickColor = (color: string | null) => {
    if (color === null) {
      track.setColor(null)
      return
    }
    const obj = Color(color)
    track.setColor({
      red: Math.floor(obj.red()),
      green: Math.floor(obj.green()),
      blue: Math.floor(obj.blue()),
      alpha: 0xff,
    })
  }

  const emoji = track.isRhythmTrack
    ? "🥁"
    : categoryEmojis[getCategoryIndex(track.programNumber ?? 0)]

  const color =
    track.color !== undefined
      ? trackColorToCSSColor(track.color)
      : "transparent"

  return (
    <>
      <Container
        selected={selected}
        onClick={onSelectTrack}
        onContextMenu={onContextMenu}
        tabIndex={-1}
      >
        <Icon selected={selected} color={color}>
          <IconInner selected={selected}>{emoji}</IconInner>
        </Icon>
        <div>
          <Label>
            <Name selected={selected}>
              <TrackName track={track} />
            </Name>
            <Instrument>
              <TrackInstrumentName track={track} />
            </Instrument>
          </Label>
          <Controls>
            <ControlButton active={solo} onClick={onClickSolo}>
              <Headset />
            </ControlButton>
            <ControlButton active={mute} onClick={onClickMute}>
              {mute ? <VolumeOff /> : <VolumeUp />}
            </ControlButton>
            <ControlButton active={ghostTrack} onClick={onClickGhostTrack}>
              <Layers />
            </ControlButton>
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
        onClickChangeTrackColor={changeTrackColor}
        {...menuProps}
      />
      <TrackDialog
        trackId={trackId}
        open={isDialogOpened}
        onClose={closeDialog}
      />
      <ColorPicker
        open={isColorPickerOpened}
        onSelect={onPickColor}
        onClose={() => setColorPickerOpened(false)}
      />
    </>
  )
})

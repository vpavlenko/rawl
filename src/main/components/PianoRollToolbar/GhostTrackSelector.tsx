import { Checkbox, ListItemText, MenuItem, Select } from "@material-ui/core"
import { Layers } from "@material-ui/icons"
import { observer } from "mobx-react-lite"
import { useMemo } from "react"
import styled from "styled-components"
import { useStores } from "../../hooks/useStores"

const Selector = styled(Select)`
  border: 1px solid var(--divider-color);
  border-radius: 4px;
  height: 2rem;
  margin-left: 1em;

  // hide underline
  &::before {
    display: none;
  }
  &::after {
    display: none;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }

  .MuiSelect-root {
    padding-top: 0;
    padding-bottom: 0;
    display: flex;
    padding-left: 8px;

    &:focus {
      background: none;
    }
  }
`

const StyledCheckbox = styled(Checkbox)`
  padding-left: 0;

  &.Mui-checked {
    color: var(--text-color);

    &:focus,
    &:hover {
      background: none;
    }
  }

  &:focus,
  &:hover {
    background: none;
  }
`

export const GhostTrackSelector = observer(() => {
  const { pianoRollStore, song } = useStores()
  const ghostTrackIds = pianoRollStore.ghostTracks[song.selectedTrackId] ?? []
  const tracks = [...song.tracks]
  const selectedTrackId = song.selectedTrackId

  const trackEntries = useMemo(
    () =>
      tracks
        .map((track, id) => ({ track, id }))
        .filter(
          ({ track, id }) => id !== selectedTrackId && !track.isConductorTrack
        ),
    [tracks, selectedTrackId]
  )

  if (trackEntries.length === 0) {
    return <></>
  }

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    pianoRollStore.ghostTracks[song.selectedTrackId] = event.target
      .value as number[]
  }

  return (
    <Selector
      multiple
      value={ghostTrackIds}
      onChange={handleChange}
      displayEmpty={true}
      renderValue={() => <Layers />}
      MenuProps={{ style: { marginTop: "2rem" } }}
    >
      {trackEntries.map(({ track, id }) => (
        <MenuItem key={id} value={id}>
          <StyledCheckbox checked={ghostTrackIds.includes(id)} />
          <ListItemText
            primary={track.displayName}
            secondary={track.instrumentName}
          />
        </MenuItem>
      ))}
    </Selector>
  )
})

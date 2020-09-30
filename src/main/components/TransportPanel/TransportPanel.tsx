import { ToolbarSeparator } from "components/groups/Toolbar"
import React, { FC, useCallback } from "react"
import { Toolbar, makeStyles } from "@material-ui/core"
import { Stop, FastRewind, FastForward, PlayArrow } from "@material-ui/icons"
import styled from "styled-components"
import { play, stop, rewindOneBar, fastForwardOneBar } from "main/actions"
import { useObserver } from "mobx-react-lite"
import { useStores } from "main/hooks/useStores"
import { getMBTString } from "common/measure/mbt"

const useStyles = makeStyles((theme) => ({
  toolbar: {
    justifyContent: "center",
    background: "var(--background-color)",
    borderTop: "1px solid var(--divider-color)",
  },
  loop: {
    marginLeft: "1rem",
    height: "2rem",
  },
}))

const TempoInput = styled.input`
  background: transparent;
  -webkit-appearance: none;
  border: none;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  width: 5em;
  text-align: center;
  outline: none;
  font-family: "Roboto Mono", monospace;
  font-size: 1rem;
  padding: 0.3rem 0;

  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`

const Button = styled.div`
  --webkit-appearance: none;
  outline: none;
  border: none;
  background: #ffffff0d;
  border-radius: 30%;
  margin: 0.25rem;
  padding: 0.5rem;
  color: var(--text-color);
  display: flex;
  cursor: pointer;

  &:hover {
    background: #ffffff1f;
  }

  svg {
    font-size: 1rem;
  }

  &.playing {
    background: var(--theme-color);
  }
`

const TempoWrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid transparent;
  padding-left: 0.7rem;
  border-radius: 0.25rem;

  label {
    font-size: 0.6rem;
    color: var(--secondary-text-color);
  }

  &:focus-within {
    border: 1px solid var(--divider-color);
    background: #ffffff14;
  }
`

interface TempoFormProps {
  tempo: number
  onChangeTempo: (tempo: number) => void
}

const TempoForm: FC<TempoFormProps> = ({ tempo, onChangeTempo }) => {
  const onKeyPressTempo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      e.currentTarget.blur()
    }
  }

  const onChangeTempo_ = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onChangeTempo(parseFloat(e.target.value)),
    []
  )

  return (
    <TempoWrapper>
      <label htmlFor="tempo-input">BPM</label>
      <TempoInput
        type="number"
        id="tempo-input"
        value={Math.floor(tempo * 100) / 100}
        onChange={onChangeTempo_}
        onKeyPress={onKeyPressTempo}
      />
    </TempoWrapper>
  )
}

const Timestamp = styled.div`
  font-family: "Roboto Mono", monospace;
  font-size: 0.9rem;
  color: var(--secondary-text-color);
`

export const TransportPanel: FC = () => {
  const { rootStore: stores } = useStores()
  const { tempo, mbtTime, isPlaying } = useObserver(() => ({
    mbtTime: getMBTString(
      stores.song.measures,
      stores.services.player.position,
      stores.services.player.timebase
    ),
    tempo:
      stores.song.conductorTrack?.getTempo(stores.services.player.position) ??
      0,
    isPlaying: stores.services.player.isPlaying,
  }))
  const onClickPlay = () => play(stores)()
  const onClickStop = () => stop(stores)()
  const onClickBackward = () => rewindOneBar(stores)()
  const onClickForward = () => fastForwardOneBar(stores)()
  const onChangeTempo = (tempo: number) => {
    stores.song.conductorTrack?.setTempo(tempo, stores.services.player.position)
  }

  const classes = useStyles({})
  return (
    <Toolbar variant="dense" className={classes.toolbar}>
      <Button onClick={onClickBackward}>
        <FastRewind />
      </Button>
      <Button onClick={onClickStop}>
        <Stop />
      </Button>
      <Button
        onClick={onClickPlay}
        className={isPlaying ? "playing" : undefined}
      >
        <PlayArrow />
      </Button>
      <Button onClick={onClickForward}>
        <FastForward />
      </Button>

      <ToolbarSeparator />

      <TempoForm tempo={tempo} onChangeTempo={onChangeTempo} />

      <ToolbarSeparator />

      <Timestamp>{mbtTime}</Timestamp>
    </Toolbar>
  )
}

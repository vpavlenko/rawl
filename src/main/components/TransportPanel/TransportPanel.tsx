import { makeStyles, Toolbar } from "@material-ui/core"
import { FastForward, FastRewind, PlayArrow, Stop } from "@material-ui/icons"
import { useObserver } from "mobx-react-lite"
import React, { FC } from "react"
import styled from "styled-components"
import { getMBTString } from "../../../common/measure/mbt"
import { fastForwardOneBar, play, rewindOneBar, stop } from "../../actions"
import { useMemoObserver } from "../../hooks/useMemoObserver"
import { useStores } from "../../hooks/useStores"
import { ToolbarSeparator } from "../groups/Toolbar"

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

const TempoForm: FC = () => {
  const { rootStore: stores } = useStores()
  const tempo = useMemoObserver(
    () =>
      stores.song.conductorTrack?.getTempo(stores.services.player.position) ?? 1
  )

  const changeTempo = (tempo: number) =>
    stores.song.conductorTrack?.setTempo(tempo, stores.services.player.position)

  const onKeyPressTempo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      e.currentTarget.blur()
    }
  }

  const onChangeTempo = (e: React.ChangeEvent<HTMLInputElement>) =>
    changeTempo(parseFloat(e.target.value))

  return (
    <TempoWrapper>
      <label htmlFor="tempo-input">BPM</label>
      <TempoInput
        type="number"
        id="tempo-input"
        min={1}
        max={1000}
        value={Math.round(tempo * 100) / 100}
        step={1}
        onChange={onChangeTempo}
        onKeyPress={onKeyPressTempo}
      />
    </TempoWrapper>
  )
}

const TimestampText = styled.div`
  font-family: "Roboto Mono", monospace;
  font-size: 0.9rem;
  color: var(--secondary-text-color);
`

const Timestamp: FC = () => {
  const { rootStore: stores } = useStores()
  const mbtTime = useMemoObserver(() =>
    getMBTString(
      stores.song.measures,
      stores.services.player.position,
      stores.services.player.timebase
    )
  )
  return <TimestampText>{mbtTime}</TimestampText>
}

export const TransportPanel: FC = () => {
  const { rootStore: stores } = useStores()
  const { isPlaying } = useObserver(() => ({
    isPlaying: stores.services.player.isPlaying,
  }))
  const onClickPlay = () => play(stores)()
  const onClickStop = () => stop(stores)()
  const onClickBackward = () => rewindOneBar(stores)()
  const onClickForward = () => fastForwardOneBar(stores)()

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

      <TempoForm />

      <ToolbarSeparator />

      <Timestamp />
    </Toolbar>
  )
}

import { ToolbarSeparator } from "components/groups/Toolbar"
import React, { FC, useCallback } from "react"
import { shouldUpdate } from "recompose"
import { Toolbar, IconButton, makeStyles } from "@material-ui/core"
import { Stop, FastRewind, FastForward, PlayArrow } from "@material-ui/icons"
import styled from "styled-components"

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
  time: {
    minWidth: "10em",
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
  font-family: monospace;
  font-size: 1rem;
  padding: 0.3rem 0;
  width: 4em;

  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`

const Button = styled(IconButton)`
  background: #ffffff0d;
  border-radius: 30%;
  margin: 0.25rem;
  padding: 0.5rem;

  &:hover {
    background: #ffffff1f;
  }

  svg {
    font-size: 1rem;
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

export interface TransportPanelProps {
  onClickPlay: () => void
  onClickStop: () => void
  onClickBackward: () => void
  onClickForward: () => void
  loopEnabled: boolean
  onClickEnableLoop: () => void
  mbtTime: string
  tempo: number
  onChangeTempo: (tempo: number) => void
}

const TransportPanel: FC<TransportPanelProps> = ({
  onClickPlay,
  onClickStop,
  onClickBackward,
  onClickForward,
  loopEnabled,
  onClickEnableLoop,
  mbtTime,
  tempo = 0,
  onChangeTempo,
}) => {
  const classes = useStyles({})
  return (
    <Toolbar variant="dense" className={classes.toolbar}>
      <Button onClick={onClickBackward}>
        <FastRewind />
      </Button>
      <Button onClick={onClickStop}>
        <Stop />
      </Button>
      <Button onClick={onClickPlay}>
        <PlayArrow />
      </Button>
      <Button onClick={onClickForward}>
        <FastForward />
      </Button>

      <ToolbarSeparator />

      <TempoForm tempo={tempo} onChangeTempo={onChangeTempo} />

      <ToolbarSeparator />

      <div className={classes.time}>
        <p className="time">{mbtTime}</p>
      </div>
    </Toolbar>
  )
}

function test(props: TransportPanelProps, nextProps: TransportPanelProps) {
  return (
    props.loopEnabled !== nextProps.loopEnabled ||
    props.mbtTime !== nextProps.mbtTime ||
    props.tempo !== nextProps.tempo
  )
}

export default shouldUpdate(test)(TransportPanel)

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

  &:focus {
    border: 1px solid var(--divider-color);
    background: var(--secondary-background-color);
  }
`

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
  const onChangeTempo_ = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onChangeTempo(parseFloat(e.target.value)),
    []
  )
  const onKeyPressTempo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      e.currentTarget.blur()
    }
  }
  return (
    <Toolbar variant="dense" className={classes.toolbar}>
      <IconButton onClick={onClickBackward}>
        <FastRewind />
      </IconButton>
      <IconButton onClick={onClickStop}>
        <Stop />
      </IconButton>
      <IconButton onClick={onClickPlay}>
        <PlayArrow />
      </IconButton>
      <IconButton onClick={onClickForward}>
        <FastForward />
      </IconButton>

      <ToolbarSeparator />

      <TempoInput
        type="number"
        value={Math.floor(tempo * 100) / 100}
        onChange={onChangeTempo_}
        onKeyPress={onKeyPressTempo}
      />

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

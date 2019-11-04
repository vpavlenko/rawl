import { ToolbarSeparator } from "components/groups/Toolbar"
import React, { StatelessComponent } from "react"
import { shouldUpdate } from "recompose"
import { Toolbar, IconButton, makeStyles } from "@material-ui/core"
import {
  Stop,
  FastRewind,
  FastForward,
  PlayArrow,
  Loop
} from "@material-ui/icons"
import { ToggleButton } from "@material-ui/lab"

const useStyles = makeStyles(theme => ({
  toolbar: {
    justifyContent: "center",
    background: "var(--secondary-background-color)"
  },
  loop: {
    marginLeft: "1rem",
    height: "2rem"
  },
  tempo: {
    minWidth: "5em"
  },
  time: {
    minWidth: "10em"
  }
}))

export interface TransportPanelProps {
  onClickPlay: () => void
  onClickStop: () => void
  onClickBackward: () => void
  onClickForward: () => void
  loopEnabled: boolean
  onClickEnableLoop: () => void
  mbtTime: string
  tempo: number
  onClickTempo: () => void
}

const TransportPanel: StatelessComponent<TransportPanelProps> = ({
  onClickPlay,
  onClickStop,
  onClickBackward,
  onClickForward,
  loopEnabled,
  onClickEnableLoop,
  mbtTime,
  tempo = 0,
  onClickTempo
}) => {
  const classes = useStyles({})
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

      <div className={classes.tempo} onClick={onClickTempo}>
        <p className="tempo">{tempo.toFixed(2)}</p>
      </div>

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

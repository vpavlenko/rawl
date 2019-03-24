import {
  Toolbar,
  ToolbarItem,
  ToolbarSeparator
} from "components/groups/Toolbar"
import Icon from "components/outputs/Icon"
import { TIME_BASE } from "Constants"
import {
  MOVE_PLAYER_POSITION,
  PLAY,
  SELECT_TRACK,
  STOP,
  TOGGLE_ENABLE_LOOP
} from "main/actions"
import { inject, observer } from "mobx-react"
import React, { StatelessComponent } from "react"
import { compose } from "recompose"
import "./TransportPanel.css"
import withMBTTime from "./withMBTTime"

export interface TransportPanelProps {
  onClickPlay: (e: any) => void
  onClickStop: (e: any) => void
  onClickBackward: (e: any) => void
  onClickForward: (e: any) => void
  loopEnabled: boolean
  onClickEnableLoop: (e: any) => void
  mbtTime: string
  tempo: number
  onClickTempo: (e: any) => void
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
  return (
    <Toolbar className="TransportPanel">
      <ToolbarSeparator />

      <ToolbarItem onClick={onClickBackward}>
        <Icon>skip-backward</Icon>
      </ToolbarItem>
      <ToolbarItem onClick={onClickStop}>
        <Icon>stop</Icon>
      </ToolbarItem>
      <ToolbarItem onClick={onClickPlay}>
        <Icon>play</Icon>
      </ToolbarItem>
      <ToolbarItem onClick={onClickForward}>
        <Icon>skip-forward</Icon>
      </ToolbarItem>
      <ToolbarItem onClick={onClickEnableLoop} selected={loopEnabled}>
        <Icon>loop</Icon>
      </ToolbarItem>

      <ToolbarSeparator />

      <ToolbarItem className="tempo-section" onClick={onClickTempo}>
        <p className="tempo">{tempo.toFixed(2)}</p>
      </ToolbarItem>

      <ToolbarSeparator />

      <ToolbarItem className="time-section">
        <p className="time">{mbtTime}</p>
      </ToolbarItem>
    </Toolbar>
  )
}

export default compose(
  inject(
    ({
      rootStore: {
        services: { player },
        song: { measureList },
        playerStore: { loop },
        router,
        dispatch
      }
    }) => ({
      player,
      tempo: player.currentTempo,
      measureList,
      loopEnabled: loop.enabled,
      onClickPlay: () => dispatch(PLAY),
      onClickStop: () => dispatch(STOP),
      onClickBackward: () => dispatch(MOVE_PLAYER_POSITION, -TIME_BASE * 4),
      onClickForward: () => dispatch(MOVE_PLAYER_POSITION, TIME_BASE * 4),
      onClickEnableLoop: () => dispatch(TOGGLE_ENABLE_LOOP),
      onClickTempo: () => {
        dispatch(SELECT_TRACK, 0)
        router.pushTrack()
      }
    })
  ),
  observer,
  withMBTTime
)(TransportPanel)

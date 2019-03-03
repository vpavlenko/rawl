import React, { Component, StatelessComponent } from "react"
import { observer, inject } from "mobx-react"
import { withState, lifecycle, compose } from "recompose"

import Icon from "components/Icon"
import { Toolbar, ToolbarItem, ToolbarSeparator } from "components/groups/Toolbar"
import withMBTTime from "./withMBTTime"

import { TIME_BASE } from "Constants"

import "./TransportPanel.css"
import { PLAY, MOVE_PLAYER_POSITION, STOP, TOGGLE_ENABLE_LOOP, SELECT_TRACK } from "main/actions";

export interface TransportPanelProps {
  onClickPlay: (any) => void
  onClickStop: (any) => void
  onClickBackward: (any) => void
  onClickForward: (any) => void
  loopEnabled: boolean
  onClickEnableLoop: (any) => void
  mbtTime: string
  tempo: number
  onClickTempo: (any) => void
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
  return <Toolbar className="TransportPanel">
    <ToolbarSeparator />

    <ToolbarItem onClick={onClickBackward}><Icon>skip-backward</Icon></ToolbarItem>
    <ToolbarItem onClick={onClickStop}><Icon>stop</Icon></ToolbarItem>
    <ToolbarItem onClick={onClickPlay}><Icon>play</Icon></ToolbarItem>
    <ToolbarItem onClick={onClickForward}><Icon>skip-forward</Icon></ToolbarItem>
    <ToolbarItem onClick={onClickEnableLoop} selected={loopEnabled}><Icon>loop</Icon></ToolbarItem>

    <ToolbarSeparator />

    <ToolbarItem className="tempo-section" onClick={onClickTempo}>
      <p className="tempo">{tempo.toFixed(2)}</p>
    </ToolbarItem>

    <ToolbarSeparator />

    <ToolbarItem className="time-section">
      <p className="time">{mbtTime}</p>
    </ToolbarItem>
  </Toolbar>
}

export default compose(
  inject(({
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
    onClickBackward: () => dispatch(MOVE_PLAYER_POSITION, { tick: -TIME_BASE * 4 }),
    onClickForward: () => dispatch(MOVE_PLAYER_POSITION, { tick: TIME_BASE * 4 }),
    onClickEnableLoop: () => dispatch(TOGGLE_ENABLE_LOOP),
    onClickTempo: () => {
      dispatch(SELECT_TRACK, { trackId: 0 })
      router.pushTrack()
    },
  })),
  observer,
  withMBTTime
)(TransportPanel)
